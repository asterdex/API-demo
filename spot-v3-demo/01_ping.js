/**
 * Ping / 测试服务器连通性
 * GET /api/v3/ping
 */

const axios = require('axios');
const config = require('./config');

async function ping() {
    try {
        console.log('Request / 请求:', 'GET /api/v3/ping');
        const response = await axios.get(`${config.BASE_URL}/api/v3/ping`);
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    ping()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = ping;
