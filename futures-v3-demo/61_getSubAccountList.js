/**
 * Get Sub-Account List / 获取子账户列表
 * GET /fapi/v3/getSubAccountList
 *
 * 使用标准 EIP-712 鉴权（signer 私钥），与其他 USER_DATA 接口一致
 * Standard EIP-712 auth with signer private key, same as other USER_DATA endpoints
 */

const axios = require('axios');
const config = require('./config');

async function getSubAccountList() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/getSubAccountList');

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            {},
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(
            `${config.BASE_URL}/fapi/v3/getSubAccountList?${queryString}`
        );

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    getSubAccountList()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = getSubAccountList;
