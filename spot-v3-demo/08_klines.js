/**
 * Kline / Candlestick Data / K线数据
 * GET /api/v3/klines
 */

const axios = require('axios');
const config = require('./config');

const params = {
    symbol: config.DEFAULT_SYMBOL,
    interval: '1h',
    limit: 10
};

async function klines() {
    try {
        console.log('Request / 请求:', 'GET /api/v3/klines');
        console.log('Parameters / 参数:', params);
        const qs = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
        const response = await axios.get(`${config.BASE_URL}/api/v3/klines?${qs}`);
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    klines()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = klines;
