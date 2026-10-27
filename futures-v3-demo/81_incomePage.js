/**
 * Get Income History With Pagination / 获取分页资金流水
 * GET /fapi/v3/incomePage
 *
 * incomeType 可选 / optional; page 从1开始 / starts at 1; limit 默认100 最大1000 / default 100, max 1000
 * Security: USER_DATA (weight 30)
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "incomeType": "REALIZED_PNL",
    "page": 1,
    "limit": 100
};

async function incomePage() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/incomePage');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(`${config.BASE_URL}/fapi/v3/incomePage?${queryString}`);

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    incomePage()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = incomePage;
