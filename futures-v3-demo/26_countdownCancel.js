/**
 * Countdown Cancel / 倒计时撤销
 * POST /fapi/v3/countdownCancelAll
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "symbol": "BTCUSDT",
    "countdownTime": "100000"
};

async function countdownCancel() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/countdownCancelAll');
        console.log('Parameters / 参数:', params);
        
        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.post(
            `${config.BASE_URL}/fapi/v3/countdownCancelAll`,
            queryString,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    countdownCancel()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = countdownCancel;
