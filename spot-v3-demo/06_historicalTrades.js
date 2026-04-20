/**
 * Historical Trades / 查询历史成交 (MARKET_DATA)
 * GET /api/v3/historicalTrades
 */

const axios = require('axios');
const config = require('./config');

const params = {
    symbol: config.DEFAULT_SYMBOL,
    limit: 20
};

async function historicalTrades() {
    try {
        console.log('Request / 请求:', 'GET /api/v3/historicalTrades');
        console.log('Parameters / 参数:', params);
        const qs = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
        const response = await axios.get(`${config.BASE_URL}/api/v3/historicalTrades?${qs}`);
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    historicalTrades()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = historicalTrades;
