/**
 * Notional and Leverage Brackets (plural, recommended) / 杠杆分层标准（复数，推荐）
 * GET /fapi/v3/leverageBrackets
 *
 * 单数路径 /fapi/v3/leverageBracket 已废弃（见 39_leverageBracket.js）/ singular path is deprecated (see 39_leverageBracket.js)
 * Security: USER_DATA (weight 1)
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "symbol": "BTCUSDT"
};

async function leverageBrackets() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/leverageBrackets');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(`${config.BASE_URL}/fapi/v3/leverageBrackets?${queryString}`);

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    leverageBrackets()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = leverageBrackets;
