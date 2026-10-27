/**
 * Modify Order / 修改订单
 * PUT /fapi/v3/order
 *
 * Modify an existing LIMIT order's quantity and/or price.
 * 修改现有 LIMIT 订单的数量和/或价格。
 *
 * Notes / 注意:
 *   - Both quantity and price must be sent / quantity 和 price 必须同时传入
 *   - Either orderId or origClientOrderId must be sent / orderId 和 origClientOrderId 二选一
 *   - Only LIMIT orders are supported / 仅支持 LIMIT 订单
 *   - Maximum 10000 modifications per order / 每笔订单最多修改 10000 次
 *
 * Weight: 1
 * Security: TRADE (requires signer + nonce + signature)
 */

const axios = require('axios');
const config = require('./config');

const params = {
    symbol:   config.DEFAULT_SYMBOL,  // 交易对 / Trading pair
    orderId:  12345678,               // 订单ID（与 origClientOrderId 二选一）/ Order ID (or use origClientOrderId)
    // origClientOrderId: 'myOrder1', // 客户端订单ID / Client order ID
    quantity: '0.001',                // 新数量 / New quantity
    price:    '80000',                // 新价格 / New price
};

async function modifyOrder() {
    try {
        console.log('Request / 请求:', 'PUT /fapi/v3/order');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);

        const response = await axios.put(
            `${config.BASE_URL}/fapi/v3/order`,
            queryString,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    modifyOrder()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = modifyOrder;
