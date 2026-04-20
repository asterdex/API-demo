/**
 * Estimate Withdraw Fee / 现货提现手续费估算 (NONE)
 * GET /api/v3/aster/withdraw/estimateFee
 *
 * chainId: 1 (ETH), 56 (BSC), 42161 (Arbitrum)
 */

const axios = require('axios');
const config = require('./config');

const params = {
    chainId: 56,
    asset: 'USDT'
};

async function estimateWithdrawFee() {
    try {
        console.log('Request / 请求:', 'GET /api/v3/aster/withdraw/estimateFee');
        console.log('Parameters / 参数:', params);
        const qs = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
        const response = await axios.get(`${config.BASE_URL}/api/v3/aster/withdraw/estimateFee?${qs}`);
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    estimateWithdrawFee()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = estimateWithdrawFee;
