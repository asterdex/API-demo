/**
 * Server Time / 获取服务器时间
 * GET /api/v3/time
 */

const axios = require('axios');
const config = require('./config');

async function time() {
    try {
        console.log('Request / 请求:', 'GET /api/v3/time');
        const response = await axios.get(`${config.BASE_URL}/api/v3/time`);
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    time()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = time;
