/**
 * Batch Transfer to Addresses / 批量转账至地址（Aster Chain）
 * POST /aster-chain/v3/batch-transfer
 * Base URL: https://chainapi.asterdex.com
 *
 * 在一次请求中将当前账户的资产转账至多个 Aster Chain 地址（最多 10 条）。
 * Transfer assets from the current account to multiple Aster Chain addresses in one request (max 10 items).
 *
 * ⚠️ signature 必须使用 user 账户的主钱包私钥签名（config.MASTER_WALLET_PRIVATE_KEY），不是 API signer 私钥
 * ⚠️ signature must be signed with the `user` account's MASTER wallet private key, NOT the API signer key
 *
 * 规则 / Rules:
 *   - clientTranId: 20~64 个字符，用于幂等（相同 ID 重复提交返回已有批次）
 *                   20-64 chars, idempotent: re-submitting the same ID returns the existing batch
 *   - items: JSON 数组，最多 10 条；每条 { toAddress, asset, amount, transferChainId? }
 *            JSON array, max 10 items; each { toAddress, asset, amount, transferChainId? }
 *   - 整批校验：任一条不合法则整批失败（地址非法/未注册/自己的地址、同一 toAddress+asset 重复、amount<=0 或超过 8 位小数）
 *     Whole batch is validated: any invalid item rejects the whole batch
 *   - 账户处于 PRIVATE 模式时不可用 / Not available while the account is in PRIVATE mode
 *   - 异步处理：响应仅表示批次已受理，最终结果请用 102_batchTransferHistory.js 查询
 *     Async: the response only confirms acceptance; use 102_batchTransferHistory.js for final results
 *
 * Message to sign / 待签名消息: URL-encoded  clientTranId={..}&items={..}&nonce={..}&user={..}
 *
 * Security: WITHDRAW (weight 50)
 */

const axios = require('axios');
const { ethers } = require('ethers');
const config = require('./config');
const { buildQueryString, getNonce } = require('./utils');

const CHAIN_API_URL = 'https://chainapi.asterdex.com';

// 转账明细 / Transfer items（收款地址必须是已注册的 Aster Chain 用户，且不能是自己的地址）
// Recipient must be a registered Aster Chain user and must not be your own address
const items = [
    { toAddress: config.USER_ADDRESS, asset: 'USDT', amount: '0.01' }
];

// 批次ID（20~64字符，唯一）/ Batch ID (20-64 chars, unique)
const clientTranId = `batch-${Date.now()}-demo`;

async function batchTransfer() {
    try {
        console.log('Request / 请求:', 'POST /aster-chain/v3/batch-transfer');

        const user  = config.MASTER_WALLET_ADDRESS;
        const nonce = String(getNonce());
        const itemsStr = JSON.stringify(items);

        // ── Step 1: 构造待签名消息（URL 编码后的查询字符串，与实际发送的参数一致）──
        // Build the message to sign: the URL-ENCODED query string, exactly as it is sent
        // ⚠️ 服务端对 URL 编码后的字符串验签（items 含 JSON 特殊字符，必须编码后再签名）
        // ⚠️ The server verifies over the URL-encoded string (items contains JSON special chars)
        const unsigned = { clientTranId, items: itemsStr, nonce, user };
        const msgBody  = buildQueryString(unsigned);
        console.log('Step 1 - Message body (for signing) / 待签名消息体:', msgBody);

        // ── Step 2: EIP-712 签名（主钱包私钥）/ EIP-712 sign with the MASTER wallet key ──
        const types = { Message: [{ name: 'msg', type: 'string' }] };
        const wallet = new ethers.Wallet(config.MASTER_WALLET_PRIVATE_KEY);
        const signature = await wallet.signTypedData(config.EIP712_DOMAIN, types, { msg: msgBody });
        console.log('Step 2 - EIP-712 Signature / EIP-712签名:', signature);

        // ── Step 3: 发送请求 / Send request ──
        const requestParams = { ...unsigned, signature };
        const response = await axios.post(
            `${CHAIN_API_URL}/aster-chain/v3/batch-transfer`,
            buildQueryString(requestParams),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        // Output raw response data / 输出原始响应数据
        console.log('\nResponse / 响应:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('\n⚠️  Save clientTranId to query the result / 请保存 clientTranId 用于查询结果:', clientTranId);
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    batchTransfer()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = batchTransfer;
