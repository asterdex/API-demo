/**
 * Get Builder Trades / 查询 Builder 用户成交历史
 * GET /fapi/v3/builder/userTrades
 *
 * userAddresses: 可选，逗号分隔最多50个用户地址；不传则分页返回所有绑定用户 / optional, comma-separated up to 50 addresses; omit to page through all bound users
 * 当前账户作为 Builder 身份，无需传 builder 参数 / the authenticated account is the builder, no builder param needed
 * Security: USER_DATA (weight 5)
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "page": 1,
    "limit": 50
};

async function builderUserTrades() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/builder/userTrades');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(`${config.BASE_URL}/fapi/v3/builder/userTrades?${queryString}`);

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    builderUserTrades()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = builderUserTrades;
