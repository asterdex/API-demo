/**
 * Wallet Transfer [Perp] / 现货与合约账户互转（合约）
 * POST /aster-chain/v3/perp/wallet/transfer
 * Base URL: https://chainapi.asterdex.com
 *
 * 在现货钱包与合约账户之间划转资产。
 * Transfer assets between the spot wallet and the perp account.
 *
 * kindType: SPOT_FUTURE（现货→合约 spot → perp） / FUTURE_SPOT（合约→现货 perp → spot）
 *
 * ⚠️ 文档参数表写的是 user + 主钱包签名，但线上实测该接口要求 signer（API signer 签名），与 TRADE 类型一致
 * ⚠️ The docs list user + master-wallet signature, but the live server requires `signer` (API signer signature)
 *
 * Security: TRADE (weight 5) — 使用 API signer 签名 / signed by the API signer
 */

const axios = require('axios');
const config = require('./config');
const { signParamsWeb3, buildQueryString } = require('./utils');

const CHAIN_API_URL = 'https://chainapi.asterdex.com';

const params = {
    "asset": "USDT",
    "amount": "0.01",                              // 必须大于 0 / must be > 0
    "clientTranId": `wallet-${Date.now()}-demo`,   // 客户端自定义划转ID / client-defined transfer ID
    "kindType": "SPOT_FUTURE"                      // SPOT_FUTURE: 现货→合约 / FUTURE_SPOT: 合约→现货
};

async function perpWalletTransfer() {
    try {
        console.log('Request / 请求:', 'POST /aster-chain/v3/perp/wallet/transfer');
        console.log('Parameters / 参数:', params);

        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const response = await axios.post(
            `${CHAIN_API_URL}/aster-chain/v3/perp/wallet/transfer`,
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
    perpWalletTransfer()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = perpWalletTransfer;
