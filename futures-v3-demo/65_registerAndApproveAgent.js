/**
 * Register and Approve Agent / 注册并授权 Agent
 * POST /fapi/v3/registerAndApproveAgent
 *
 * ⚠️ 此为公开接口（PUBLIC），无需 API Key 或 HMAC 请求头，所有授权通过链上签名验证
 * ⚠️ This is an unauthenticated PUBLIC endpoint — no API Key required. Authorization is verified via on-chain signature.
 *
 * 签名说明 / Signature Instructions:
 *   - 使用用户主钱包私钥（非 API signer 私钥）对消息体进行 EIP-712 签名
 *   - Sign the message body using the user's MASTER wallet private key (NOT the API signer key)
 *   - signatureChainId 参数填写 56（EVM 地址）
 *   - Set signatureChainId to 56 for EVM addresses
 *
 * 消息体格式 / Message body format:
 *   user={user}&nonce={nonce}&agentName={agentName}&agentAddress={agentAddress}&expired={expired}
 *   &signatureChainId={signatureChainId}&canSpotTrade={canSpotTrade}&canPerpTrade={canPerpTrade}
 *   &canWithdraw={canWithdraw}[&ipWhitelist={ipWhitelist}]
 *   (ipWhitelist 仅在 canWithdraw=true 时必填 / Required only when canWithdraw=true)
 */

const axios = require('axios');
const { ethers } = require('ethers');
const config = require('./config');
const { buildQueryString } = require('./utils');

// ── 参数配置 / Parameter Configuration ──────────────────────────────────────
const PARAMS = {
    agentName:        'MyAgent',                         // Agent 显示名称 / Agent display name
    agentAddress:     '0xYourAgentWalletAddress',        // Agent 钱包地址 / Agent wallet address
    expired:          Date.now() + 30 * 24 * 60 * 60 * 1000, // 过期时间(ms), 示例: 30天后 / Expiry timestamp (ms), e.g. 30 days from now
    signatureChainId: 56,                                // EVM 地址填 56 / 56 for EVM, 101 for Solana
    canSpotTrade:     true,                              // 是否允许现货交易 / Allow spot trading
    canPerpTrade:     true,                              // 是否允许合约交易 / Allow perpetual futures trading
    canWithdraw:      false,                             // 是否允许提现 / Allow withdrawal
    ipWhitelist:      '',                                // IP 白名单，canWithdraw=true 时必填，空格分隔 / Required when canWithdraw=true, space-separated
    agentCode:        '',                                // 推荐码（可选）/ Referral code (optional)
};

async function registerAndApproveAgent() {
    try {
        console.log('Request / 请求: POST /fapi/v3/registerAndApproveAgent');

        // ── Step 1: 生成 nonce / Generate nonce ──────────────────────────────
        // 手动生成微秒级时间戳，此接口不经过 signParamsWeb3，直接用主钱包私钥签名
        const nowSec = Math.floor(Date.now() / 1000);
        const nonce = String(nowSec * 1_000_000);

        const user             = config.MASTER_WALLET_ADDRESS;
        const agentName        = PARAMS.agentName;
        const agentAddress     = PARAMS.agentAddress;
        const expired          = String(PARAMS.expired);
        const signatureChainId = String(PARAMS.signatureChainId);
        const canSpotTrade     = String(PARAMS.canSpotTrade);
        const canPerpTrade     = String(PARAMS.canPerpTrade);
        const canWithdraw      = String(PARAMS.canWithdraw);

        if (PARAMS.canWithdraw && !PARAMS.ipWhitelist) {
            throw new Error('ipWhitelist is required when canWithdraw is true / canWithdraw=true 时 ipWhitelist 不能为空');
        }

        // ── Step 2: 构建待签名的消息体 / Build message body for signing ─────
        // 字段顺序必须与文档保持一致 / Field order must follow the docs exactly
        let msgBody = `user=${user}&nonce=${nonce}&agentName=${agentName}&agentAddress=${agentAddress}&expired=${expired}&signatureChainId=${signatureChainId}&canSpotTrade=${canSpotTrade}&canPerpTrade=${canPerpTrade}&canWithdraw=${canWithdraw}`;

        if (PARAMS.ipWhitelist) {
            msgBody += `&ipWhitelist=${PARAMS.ipWhitelist}`;
        }

        console.log('Step 1 - Message body (for signing) / 待签名消息体:', msgBody);

        // ── Step 3: EIP-712 签名（使用主钱包私钥）/ EIP-712 sign with master wallet key ──
        const domain = config.EIP712_DOMAIN;  // chainId=1666, name="AsterSignTransaction"
        const types  = { Message: [{ name: 'msg', type: 'string' }] };
        const value  = { msg: msgBody };

        // ⚠️ 必须使用主钱包私钥（config.MASTER_WALLET_PRIVATE_KEY），不能使用 API signer 私钥（config.PRIVATE_KEY）
        // ⚠️ Must use MASTER wallet private key (config.MASTER_WALLET_PRIVATE_KEY), NOT the API signer key (config.PRIVATE_KEY)
        const masterWallet = new ethers.Wallet(config.MASTER_WALLET_PRIVATE_KEY);
        const signature = await masterWallet.signTypedData(domain, types, value);

        console.log('Step 2 - EIP-712 Domain / EIP-712域:', JSON.stringify(domain));
        console.log('Step 3 - Signature / 签名:', signature);
        console.log('');

        // ── Step 4: 构建请求参数并发送 / Build request params and send ───────
        const requestParams = {
            user,
            nonce,
            agentName,
            agentAddress,
            expired,
            signatureChainId,
            signature,
            canSpotTrade,
            canPerpTrade,
            canWithdraw,
        };

        if (PARAMS.ipWhitelist) {
            requestParams.ipWhitelist = PARAMS.ipWhitelist;
        }
        if (PARAMS.agentCode) {
            requestParams.agentCode = PARAMS.agentCode;
        }

        const queryString = buildQueryString(requestParams);
        console.log('Request params / 请求参数:', requestParams);

        // 此接口为 PUBLIC，不需要 X-MBX-APIKEY 等认证头
        // This endpoint is PUBLIC — no authentication headers required
        const response = await axios.post(
            `${config.BASE_URL}/fapi/v3/registerAndApproveAgent`,
            queryString,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        console.log('\nResponse / 响应:');
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    registerAndApproveAgent()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = registerAndApproveAgent;
