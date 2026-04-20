/**
 * Exchange Info / 交易规范信息
 * GET /api/v3/exchangeInfo
 */

const axios = require('axios');
const config = require('./config');

async function exchangeInfo() {
    try {
        console.log('Request / 请求:', 'GET /api/v3/exchangeInfo');
        const response = await axios.get(`${config.BASE_URL}/api/v3/exchangeInfo`);
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    exchangeInfo()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = exchangeInfo;
