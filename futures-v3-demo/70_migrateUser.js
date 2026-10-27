/**
 * Migrate User Assets / 迁移用户资产
 * POST /fapi/v3/asset/migrateUser
 *
 * Migrate all positive-balance assets from a source account to the authenticated user's account.
 * 将源账户所有正余额资产迁移到当前认证用户的账户。
 *
 * ⚠️ 此接口使用源账户（user）的主钱包私钥签名，而非 API signer 私钥
 * ⚠️ This endpoint is signed with the SOURCE user's wallet private key, NOT the API signer key
 *
 * Preconditions / 前提条件:
 *   - Source account must have NO open positions / 源账户不能有持仓
 *   - Source account must have NO open orders / 源账户不能有挂单
 *   - Up to 300 assets migrated per batch / 每批最多迁移 300 种资产
 *
 * Message body to sign / 待签名消息体:
 *   user={user}&nonce={nonce}
 *
 * Weight: 50
 * Security: WITHDRAW (signs with source user's wallet private key via EIP-712)
 */

const axios = require('axios');
const { ethers } = require('ethers');
const config = require('./config');
const { buildQueryString } = require('./utils');

// ── 源账户配置 / Source account config ──────────────────────────────────────
// 源账户地址（将从此账户迁出资产）
// Source account address (assets will be migrated OUT of this account)
const SOURCE_USER_ADDRESS     = config.MASTER_WALLET_ADDRESS;

// 源账户主钱包私钥（必须使用主钱包私钥，不能使用 signer 私钥）
// Source account wallet private key (must be MASTER wallet key, NOT signer key)
const SOURCE_WALLET_PRIVATE_KEY = config.MASTER_WALLET_PRIVATE_KEY;

async function migrateUser() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/asset/migrateUser');

        // ── Step 1: 生成 nonce / Generate nonce ──────────────────────────────
        const nowSec = Math.floor(Date.now() / 1000);
        const nonce  = String(nowSec * 1_000_000);
        const user   = SOURCE_USER_ADDRESS;

        // ── Step 2: 构建消息体并签名 / Build message and sign ────────────────
        const msgBody = `user=${user}&nonce=${nonce}`;
        console.log('Step 1 - Message body (for signing) / 待签名消息体:', msgBody);

        const domain  = config.EIP712_DOMAIN;
        const types   = { Message: [{ name: 'msg', type: 'string' }] };
        const value   = { msg: msgBody };

        const wallet    = new ethers.Wallet(SOURCE_WALLET_PRIVATE_KEY);
        const signature = await wallet.signTypedData(domain, types, value);
        console.log('Step 2 - EIP-712 Signature / EIP-712签名:', signature);
        console.log('');

        // ── Step 3: 发送请求 / Send request ──────────────────────────────────
        const requestParams = { user, nonce, signature };
        const queryString   = buildQueryString(requestParams);
        console.log('Request params / 请求参数:', requestParams);

        const response = await axios.post(
            `${config.BASE_URL}/fapi/v3/asset/migrateUser`,
            queryString,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        console.log('\nResponse / 响应:');
        console.log(JSON.stringify(response.data, null, 2));
        // 记录返回的 batchId 用于后续查询迁移状态
        // Record the returned batchId for querying migration status later
        console.log('\n⚠️  Save this batchId to query migration status / 请保存 batchId 用于查询迁移状态:', response.data.batchId);
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    migrateUser()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = migrateUser;
