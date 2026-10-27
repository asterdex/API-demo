/**
 * Get Builder Approved User List / 查询已授权当前 Builder 的用户列表
 * GET /fapi/v3/builder/approvedUserList
 *
 * startTime/endTime/page/limit 可选；响应为分页对象 rows[] / optional filters; response is a paginated object with rows[]
 * Security: USER_DATA (weight 5)
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "page": 1,
    "limit": 100
};

async function builderApprovedUserList() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/builder/approvedUserList');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(`${config.BASE_URL}/fapi/v3/builder/approvedUserList?${queryString}`);

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    builderApprovedUserList()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = builderApprovedUserList;
