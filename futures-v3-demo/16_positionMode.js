/**
 * Change Position Mode / 更改持仓模式
 * POST /fapi/v3/positionSide/dual
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "dualSidePosition": "false"
};

async function positionMode() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/positionSide/dual');
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
            `${config.BASE_URL}/fapi/v3/positionSide/dual`,
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
    positionMode()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = positionMode;
