/**
 * Query User Withdraw Info [v3] / 查询用户提现信息[v3]
 * POST /fapi/v3/aster/user-withdraw-info
 *
 * 返回用户每日提现限额、平台每日限额及各资产各链的可提现余额
 */

const axios = require('axios');
const config = require('./config');

async function withdrawInfo() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/aster/user-withdraw-info');

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            {},
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.post(
            `${config.BASE_URL}/fapi/v3/aster/user-withdraw-info`,
            queryString,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    withdrawInfo()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = withdrawInfo;
