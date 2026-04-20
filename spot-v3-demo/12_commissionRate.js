/**
 * Commission Rate / 获取Symbol手续费
 * GET /api/v3/commissionRate
 * USER_DATA - Requires authentication / 需要鉴权
 */

const axios = require('axios');
const config = require('./config');
const { signParamsWeb3, buildQueryString } = require('./utils');

const params = {
    "symbol": "ASTERUSDT"
};

async function commissionRate() {
    try {
        console.log('Request / 请求:', 'GET /api/v3/commissionRate');
        console.log('Parameters / 参数:', params);

        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(`${config.BASE_URL}/api/v3/commissionRate?${queryString}`);

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    commissionRate()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = commissionRate;
