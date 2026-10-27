/**
 * Estimate Withdraw Fee / 估算提现手续费（Aster Chain）
 * GET /aster-chain/v3/withdraw/estimateFee
 * Base URL: https://chainapi.asterdex.com
 *
 * Security: NONE (weight 1, no authentication / 无需认证)
 */

const axios = require('axios');

const CHAIN_API_URL = 'https://chainapi.asterdex.com';

const params = {
    "chainId": 56,       // 目标链ID / target chain ID
    "asset": "USDT"      // 资产名称 / asset name
};

async function chainEstimateFee() {
    try {
        console.log('Request / 请求:', 'GET /aster-chain/v3/withdraw/estimateFee');
        console.log('Parameters / 参数:', params);

        const response = await axios.get(`${CHAIN_API_URL}/aster-chain/v3/withdraw/estimateFee`, { params });

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    chainEstimateFee()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = chainEstimateFee;
