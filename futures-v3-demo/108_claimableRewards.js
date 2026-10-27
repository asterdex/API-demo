/**
 * Get Claimable Rewards / 查询可领取的质押奖励
 * GET /aster-chain/v3/staking/claimableRewards
 * Base URL: https://chainapi.asterdex.com
 *
 * Security: USER_DATA (weight 1) — 使用 API signer 签名 / signed by the API signer
 */

const axios = require('axios');
const config = require('./config');

const CHAIN_API_URL = 'https://chainapi.asterdex.com';

const params = {};

async function claimableRewards() {
    try {
        console.log('Request / 请求:', 'GET /aster-chain/v3/staking/claimableRewards');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(`${CHAIN_API_URL}/aster-chain/v3/staking/claimableRewards?${queryString}`);

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    claimableRewards()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = claimableRewards;
