/**
 * Cancel All Open Orders / 取消当前所有挂单 (USER_DATA)
 * DELETE /api/v3/allOpenOrders
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "symbol": "BTCUSDT"
    // "orderIdList": "[123,456]"           // 可选，指定订单ID列表
    // "origClientOrderIdList": '["id1","id2"]'  // 可选，指定自定义订单号列表
};

async function cancelAllOrders() {
    try {
        console.log('Request / 请求:', 'DELETE /api/v3/allOpenOrders');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.delete(
            `${config.BASE_URL}/api/v3/allOpenOrders`,
            {
                data: queryString,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
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
    cancelAllOrders()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = cancelAllOrders;
