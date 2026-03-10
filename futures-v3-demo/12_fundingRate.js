/**
 * Funding Rate History / 资金费率历史
 * GET /fapi/v3/fundingRate
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "symbol": "ZECUSDT",
    "limit": 10
};

async function fundingRate() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/fundingRate');
        console.log('Parameters / 参数:', params);
        
        const response = await axios.get(`${config.BASE_URL}/fapi/v3/fundingRate`, { params });
        
        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    fundingRate()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = fundingRate;
