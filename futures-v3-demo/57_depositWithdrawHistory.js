/**
 * Query Deposit & Withdraw History [v3] / 查询充值提现历史[v3]
 * POST /fapi/v3/aster/deposit-withdraw-history
 */

const axios = require('axios');
const config = require('./config');

async function depositWithdrawHistory() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/aster/deposit-withdraw-history');

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            {},
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.post(
            `${config.BASE_URL}/fapi/v3/aster/deposit-withdraw-history`,
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
    depositWithdrawHistory()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = depositWithdrawHistory;
