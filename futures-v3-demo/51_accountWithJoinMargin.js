/**
 * Account Information with Join Margin / 账户信息v3（含联合保证金）
 * GET /fapi/v3/accountWithJoinMargin
 */

const axios = require('axios');
const config = require('./config');

async function accountWithJoinMargin() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/accountWithJoinMargin');

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            {},
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(
            `${config.BASE_URL}/fapi/v3/accountWithJoinMargin?${queryString}`
        );

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    accountWithJoinMargin()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = accountWithJoinMargin;
