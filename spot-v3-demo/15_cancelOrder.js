/**
 * Cancel Order / 撤销订单 (TRADE)
 * DELETE /api/v3/order
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "symbol": "BTCUSDT",
    "orderId": "12345678"  // 替换为实际订单ID / Replace with actual order ID
    // "origClientOrderId": "myOrder1"  // 或使用自定义订单号 / Or use custom order ID
};

async function cancelOrder() {
    try {
        console.log('Request / 请求:', 'DELETE /api/v3/order');
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
            `${config.BASE_URL}/api/v3/order`,
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
    cancelOrder()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = cancelOrder;
