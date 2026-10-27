/**
 * Get Withdraw Info [Perp] / 查询用户提现信息
 * GET /aster-chain/v3/perp/user-withdraw-info
 * Base URL: https://chainapi.asterdex.com
 *
 * 返回提现限额及各资产各链可提现余额 / withdrawal limits and per-asset per-chain balances
 * Security: USER_DATA (weight 1) — 使用 API signer 签名 / signed by the API signer
 */

const axios = require('axios');
const config = require('./config');

const CHAIN_API_URL = 'https://chainapi.asterdex.com';

const params = {};

async function perpWithdrawInfo() {
    try {
        console.log('Request / 请求:', 'GET /aster-chain/v3/perp/user-withdraw-info');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(`${CHAIN_API_URL}/aster-chain/v3/perp/user-withdraw-info?${queryString}`);

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    perpWithdrawInfo()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = perpWithdrawInfo;
