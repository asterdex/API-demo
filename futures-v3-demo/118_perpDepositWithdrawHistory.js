/**
 * Deposit/Withdraw History [Perp] / 合约账户充值提现历史
 * GET /aster-chain/v3/perp/deposit-withdraw-history
 * Base URL: https://chainapi.asterdex.com
 *
 * Security: USER_DATA (weight 5) — 使用 API signer 签名 / signed by the API signer
 */

const axios = require('axios');
const config = require('./config');

const CHAIN_API_URL = 'https://chainapi.asterdex.com';

const params = {
    // "chainId": "56"   // 可选：按链ID过滤 / optional: filter by chain ID
};

async function perpDepositWithdrawHistory() {
    try {
        console.log('Request / 请求:', 'GET /aster-chain/v3/perp/deposit-withdraw-history');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(`${CHAIN_API_URL}/aster-chain/v3/perp/deposit-withdraw-history?${queryString}`);

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    perpDepositWithdrawHistory()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = perpDepositWithdrawHistory;
