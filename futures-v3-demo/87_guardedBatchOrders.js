/**
 * Cancel Multiple Orders (Guarded) / 批量撤销订单（Guarded）
 * DELETE /fapi/v3/guardedBatchOrders
 *
 * 适用于链上下单/授权的订单：通过订单对应的链上 nonce 防止重复或乱序撤单。
 * Guarded variant of DELETE /fapi/v3/batchOrders, intended for orders placed/authorized on-chain.
 *
 * ⚠️ nonce 必须是【批量下单时使用的 nonce】（POST /fapi/v3/batchOrders 提交的 nonce），不是新的当前时间戳
 * ⚠️ `nonce` MUST be the nonce that was used to place these orders, NOT a new/current timestamp
 *
 * 本 demo 流程 / Demo flow:
 *   1. 批量下 2 个远离市价的限价单，并记录下单时的 nonce / Batch-place 2 far-from-market limit orders and keep the nonce
 *   2. 使用该 nonce 调用 guardedBatchOrders 撤单 / Cancel them via guardedBatchOrders with the same nonce
 *
 * Security: TRADE (weight 1)
 */

const axios = require('axios');
const config = require('./config');
const { signParamsWeb3, buildQueryString, buildRestingBuyOrder } = require('./utils');

// 价格 = 标记价 * 0.99（不会成交），数量满足最小名义价值，由 buildRestingBuyOrder 自动生成
// price = mark price * 0.99 (will not fill), quantity satisfies min notional; built by buildRestingBuyOrder
const SYMBOL = 'ASTERUSDT';

const FORM = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

async function guardedBatchOrders() {
    try {
        // Step 1: 批量下单并记录 nonce / Batch place orders and keep nonce
        console.log('Step 1 - Batch place / 批量下单: POST /fapi/v3/batchOrders');
        const o1 = await buildRestingBuyOrder(SYMBOL);
        const o2 = { ...o1, quantity: o1.quantity };   // 两个相同参数的订单 / two identical orders
        // IMPORTANT: batchOrders must use SINGLE quotes, not double quotes
        // 重要：batchOrders 必须使用单引号，不能使用双引号
        const batchOrdersParam = JSON.stringify([o1, o2]).replace(/"/g, "'");
        const signedOrders = await signParamsWeb3(
            { batchOrders: batchOrdersParam },
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const orderNonce = signedOrders.nonce;
        const orderIds = [];
        try {
            // IMPORTANT: parameters must be in URL query string, body is empty (matching 23_batchOrders.js)
            // 重要：参数必须放在 URL query string 中，body 为空（与 23_batchOrders.js 一致）
            const orderRes = await axios.post(
                `${config.BASE_URL}/fapi/v3/batchOrders?${buildQueryString(signedOrders)}`,
                '',
                FORM
            );
            console.log(JSON.stringify(orderRes.data, null, 2));
            orderRes.data.filter(o => o.orderId).forEach(o => orderIds.push(o.orderId));
        } catch (e) {
            console.log('⚠️  Batch place failed / 批量下单失败:', e.response ? JSON.stringify(e.response.data) : e.message);
        }
        if (orderIds.length === 0) {
            console.log('    继续使用占位订单ID调用 guardedBatchOrders / Continue with a dummy orderId to exercise guardedBatchOrders');
            orderIds.push(1);
        }

        // Step 2: 使用下单时的 nonce 批量撤单 / Cancel with the ORIGINAL nonce
        console.log('\nStep 2 - Guarded batch cancel / Guarded 批量撤单: DELETE /fapi/v3/guardedBatchOrders');
        const cancelParams = {
            symbol: SYMBOL,
            orderIdList: JSON.stringify(orderIds)   // e.g. [1234567,2345678]
        };
        console.log('Parameters / 参数:', cancelParams, 'nonce(原下单nonce):', orderNonce);

        const signedCancel = await signParamsWeb3(
            cancelParams,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY,
            null,
            orderNonce          // 复用下单 nonce / reuse the batch order's nonce
        );
        const response = await axios.delete(
            `${config.BASE_URL}/fapi/v3/guardedBatchOrders?${buildQueryString(signedCancel)}`
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
    guardedBatchOrders()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = guardedBatchOrders;
