/**
 * 24hr Ticker Price Change Statistics / 24hr 价格变动情况
 * GET /api/v3/ticker/24hr
 */

const axios = require('axios');
const config = require('./config');

const params = {
    symbol: config.DEFAULT_SYMBOL  // 可选，不传返回所有交易对
};

async function ticker24hr() {
    try {
        console.log('Request / 请求:', 'GET /api/v3/ticker/24hr');
        console.log('Parameters / 参数:', params);
        const qs = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
        const response = await axios.get(`${config.BASE_URL}/api/v3/ticker/24hr?${qs}`);
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    ticker24hr()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = ticker24hr;
