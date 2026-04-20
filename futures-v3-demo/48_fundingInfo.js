/**
 * Funding Rate Info / 查询资金费率配置
 * GET /fapi/v3/fundingInfo
 */

const axios = require('axios');
const config = require('./config');

const params = {
    // symbol: 'BTCUSDT'  // 可选，不传则返回所有交易对
};

async function fundingInfo() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/fundingInfo');
        console.log('Parameters / 参数:', params);

        const queryParts = [];
        for (const [key, val] of Object.entries(params)) {
            queryParts.push(`${key}=${encodeURIComponent(val)}`);
        }
        const queryString = queryParts.length ? '?' + queryParts.join('&') : '';
        const response = await axios.get(`${config.BASE_URL}/fapi/v3/fundingInfo${queryString}`);

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    fundingInfo()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = fundingInfo;
