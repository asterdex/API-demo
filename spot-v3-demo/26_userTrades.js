/**
 * Account Trade List / 账户成交历史 (USER_DATA)
 * GET /api/v3/userTrades
 */

const axios = require('axios');
const config = require('./config');

const params = {
    // "symbol": "BTCUSDT",  // 可选
    "limit": 20
};

async function userTrades() {
    try {
        console.log('Request / 请求:', 'GET /api/v3/userTrades');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(`${config.BASE_URL}/api/v3/userTrades?${queryString}`);

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    userTrades()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = userTrades;
