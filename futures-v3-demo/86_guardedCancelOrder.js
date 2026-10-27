/**
 * Cancel Order (Guarded) / 撤销订单（Guarded）
 * DELETE /fapi/v3/guardedCancelOrder
 *
 * 适用于链上下单/授权的订单：通过订单对应的链上 nonce 防止重复或乱序撤单。
 * Guarded variant of DELETE /fapi/v3/order, intended for orders placed/authorized on-chain.
 *
 * ⚠️ nonce 必须是【下单时使用的 nonce】（POST /fapi/v3/order 提交的 nonce），不是新的当前时间戳
 * ⚠️ `nonce` MUST be the nonce that was used to place the order, NOT a new/current timestamp
 *
 * 本 demo 流程 / Demo flow:
 *   1. 下一个远离市价的限价单，并记录下单时的 nonce / Place a far-from-market limit order and remember its nonce
 *   2. 使用该 nonce 调用 guardedCancelOrder 撤单 / Cancel it via guardedCancelOrder with the same nonce
 *
 * Security: TRADE (weight 1)
 */

const axios = require('axios');
const config = require('./config');
const { signParamsWeb3, buildQueryString, buildRestingBuyOrder } = require('./utils');

// 下单交易对 / Symbol to place the order on
// 价格 = 标记价 * 0.99（不会成交），数量满足最小名义价值，由 buildRestingBuyOrder 自动生成
// price = mark price * 0.99 (will not fill), quantity satisfies min notional; built by buildRestingBuyOrder
const SYMBOL = 'ASTERUSDT';

const FORM = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

async function guardedCancelOrder() {
    try {
        // Step 1: 下单并记录 nonce / Place order and keep its nonce
        console.log('Step 1 - Place order / 下单: POST /fapi/v3/order');
        const orderParams = await buildRestingBuyOrder(SYMBOL);
        console.log('Order params / 下单参数:', orderParams);
        const signedOrder = await signParamsWeb3(
            orderParams,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const orderNonce = signedOrder.nonce;
        let orderId = 1;   // 下单失败（如余额不足）时使用占位ID，仍可验证撤单接口 / dummy id if placement fails (e.g. insufficient margin)
        try {
            const orderRes = await axios.post(`${config.BASE_URL}/fapi/v3/order`, buildQueryString(signedOrder), FORM);
            console.log(JSON.stringify(orderRes.data, null, 2));
            orderId = orderRes.data.orderId;
        } catch (e) {
            console.log('⚠️  Place order failed / 下单失败:', e.response ? JSON.stringify(e.response.data) : e.message);
            console.log('    继续使用占位订单ID调用 guardedCancelOrder / Continue with a dummy orderId to exercise guardedCancelOrder');
        }

        // Step 2: 使用下单时的 nonce 撤单 / Cancel with the ORIGINAL order nonce
        console.log('\nStep 2 - Guarded cancel / Guarded 撤单: DELETE /fapi/v3/guardedCancelOrder');
        const cancelParams = {
            symbol: SYMBOL,
            orderId
        };
        console.log('Parameters / 参数:', cancelParams, 'nonce(原下单nonce):', orderNonce);

        const signedCancel = await signParamsWeb3(
            cancelParams,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY,
            null,
            orderNonce          // 复用下单 nonce / reuse the order's nonce
        );
        const response = await axios.delete(
            `${config.BASE_URL}/fapi/v3/guardedCancelOrder?${buildQueryString(signedCancel)}`
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
    guardedCancelOrder()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = guardedCancelOrder;
