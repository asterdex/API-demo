/**
 * User Solana Withdraw [Perp] / 通过 Aster Chain 提现 [Solana][合约]
 * POST /aster-chain/v3/perp/user-solana-withdraw
 * Base URL: https://chainapi.asterdex.com
 *
 * 从合约账户提现到 Solana 地址。
 * Submit a withdrawal request from the Perp account to a Solana address.
 *
 * ⚠️ 此接口需要两套签名：
 *   1. userSignature - Solana Ed25519 签名（Solana 钱包私钥，Base58 编码）
 *   2. signature     - API 鉴权签名（EIP-712，user + nonce，使用主钱包私钥）
 * ⚠️ Two signatures:
 *   1. userSignature - Solana Ed25519 withdraw signature (Solana wallet private key, Base58)
 *   2. signature     - API auth signature (EIP-712, user + nonce, signed by the main wallet)
 *
 * 注意：Amount 和 Fee 的尾部零必须去除（如 1.20 → 1.2），否则签名验证会失败。
 * Note: trailing zeros in Amount and Fee must be stripped (e.g. 1.20 -> 1.2), or signature verification fails.
 *
 * 依赖 / Dependencies: npm install @solana/web3.js tweetnacl bs58
 *
 * Security: WITHDRAW (weight 5)
 */

const axios = require('axios');
const { ethers } = require('ethers');
const config = require('./config');
const { buildQueryString, getNonce } = require('./utils');

const CHAIN_API_URL = 'https://chainapi.asterdex.com';

const WITHDRAW_PARAMS = {
    chainId:  '101',                                              // Solana 固定值 / Fixed value for Solana
    asset:    'USDT',                                             // 提现币种 / Asset
    amount:   '1',                                                // 提现数量（去除末尾零）/ Amount (trailing zeros stripped)
    fee:      '0.5',                                              // 手续费（去除末尾零）/ Fee (trailing zeros stripped)
    receiver: 'BzsJhmtg2UtQWNw6764DkK5Y4GPjc1XMzRqAGqSziymK',   // Solana 收款地址 / Solana receiver address
};

async function perpWithdrawSolana() {
    try {
        console.log('Request / 请求:', 'POST /aster-chain/v3/perp/user-solana-withdraw');

        // userNonce: 纳秒级时间戳 / nanosecond-level timestamp
        const userNonce = String(Date.now() * 1000);

        // Step 1: Solana Ed25519 签名 / Solana Ed25519 signature
        let userSignature = '';
        try {
            const { Keypair } = require('@solana/web3.js');
            const nacl = require('tweetnacl');
            const bs58 = require('bs58');

            const message = [
                'PrimaryType=Withdraw',
                'AsterChain=Mainnet',
                `Destination=${WITHDRAW_PARAMS.receiver}`,
                'DestinationChain=Solana',
                `Token=${WITHDRAW_PARAMS.asset}`,
                `Amount=${WITHDRAW_PARAMS.amount}`,
                `Fee=${WITHDRAW_PARAMS.fee}`,
                `Nonce=${userNonce}`
            ].join(',');
            console.log('Solana sign message / Solana 签名消息:', message);

            // ⚠️ 替换为你的 Solana 钱包私钥（Base58）/ Replace with your Solana wallet private key (Base58)
            const keypair = Keypair.fromSecretKey(bs58.decode('YOUR_SOLANA_PRIVATE_KEY_BASE58'));
            const sigBytes = nacl.sign.detached(Buffer.from(message, 'utf8'), keypair.secretKey);
            userSignature = bs58.encode(sigBytes);
            console.log('Solana userSignature:', userSignature);
        } catch (e) {
            console.warn('⚠️  Skip Solana userSignature (packages missing or private key not set):', e.message);
            console.warn('⚠️  跳过 Solana userSignature（缺少依赖或未配置私钥）。运行: npm install @solana/web3.js tweetnacl bs58');
        }

        // Step 2: API 鉴权签名（EIP-712，主钱包）/ API auth signature (EIP-712, main wallet)
        const apiParams = {
            chainId:   WITHDRAW_PARAMS.chainId,
            asset:     WITHDRAW_PARAMS.asset,
            amount:    WITHDRAW_PARAMS.amount,
            fee:       WITHDRAW_PARAMS.fee,
            receiver:  WITHDRAW_PARAMS.receiver,
            userNonce,
            userSignature: userSignature || 'MISSING'   // 文档标记必填 / documented as required
        };
        // API 鉴权：WITHDRAW 类型使用 user + nonce + signature，由主钱包私钥签名（线上实测 API signer 无提现权限，返回 -2015）
        // API auth: WITHDRAW endpoints use user + nonce + signature signed by the MAIN wallet
        // (live server rejects the API signer for withdrawals with -2015)
        const unsigned = { ...apiParams, nonce: String(getNonce()), user: config.MASTER_WALLET_ADDRESS };
        const authSignature = await new ethers.Wallet(config.MASTER_WALLET_PRIVATE_KEY).signTypedData(
            config.EIP712_DOMAIN,
            { Message: [{ name: 'msg', type: 'string' }] },
            { msg: buildQueryString(unsigned) }
        );
        const signedParams = { ...unsigned, signature: authSignature };

        const response = await axios.post(
            `${CHAIN_API_URL}/aster-chain/v3/perp/user-solana-withdraw`,
            buildQueryString(signedParams),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    perpWithdrawSolana()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = perpWithdrawSolana;
