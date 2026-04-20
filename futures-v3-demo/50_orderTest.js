/**
 * Test New Order / 测试下单接口
 * POST /fapi/v3/order/test
 *
 * 用于测试订单请求，但不会提交到撮合引擎，参数与下单接口一致
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "symbol": "TSLAUSDT",
    "side": "BUY",
    "type": "LIMIT",
    "quantity": "1",
    "price": "380",
    "timeInForce": "GTC"
};

async function orderTest() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/order/test');
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
            `${config.BASE_URL}/fapi/v3/order/test`,
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
    orderTest()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = orderTest;
