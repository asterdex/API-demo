/**
 * Order Book Depth / 深度信息
 * GET /api/v3/depth
 */

const axios = require('axios');
const config = require('./config');

const params = {
    symbol: config.DEFAULT_SYMBOL,
    limit: 20
};

async function depth() {
    try {
        console.log('Request / 请求:', 'GET /api/v3/depth');
        console.log('Parameters / 参数:', params);
        const qs = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
        const response = await axios.get(`${config.BASE_URL}/api/v3/depth?${qs}`);
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    depth()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = depth;
