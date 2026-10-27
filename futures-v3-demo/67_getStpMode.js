/**
 * Get Current STP Mode / 查询当前账户 STP 模式
 * GET /fapi/v3/stpMode
 *
 * Get the account's current Self-Trade Prevention (STP) mode.
 * 查询账户当前的自成交防止（STP）模式。
 *
 * Weight: 30
 * Security: USER_DATA (requires signer + nonce + signature)
 */

const axios = require('axios');
const config = require('./config');
const { signParamsWeb3, buildQueryString } = require('./utils');

async function getStpMode() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/stpMode');

        const signedParams = await signParamsWeb3(
            {},
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);

        const response = await axios.get(
            `${config.BASE_URL}/fapi/v3/stpMode?${queryString}`
        );

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    getStpMode()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = getStpMode;
