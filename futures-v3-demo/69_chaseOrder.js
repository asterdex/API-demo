/**
 * Place Chase Order / 下 Chase 追单
 * POST /fapi/v3/chase
 *
 * Place a BBO-pegged GTX (post-only) limit order that automatically re-pegs
 * to the best bid/ask as the market moves.
 * 下一个 BBO 挂钩的 GTX（post-only）限价单，策略服务会实时跟随最优买一/卖一价自动调整报价。
 *
 * Notes / 注意:
 *   - timeInForce defaults to GTX (post-only); NO_FILL is not allowed
 *     timeInForce 默认为 GTX（post-only），不允许 NO_FILL
 *   - The chase auto-cancels when market moves beyond maxChaseOffset (reason: OFFSET_CANCELLED)
 *     当市场偏移超过 maxChaseOffset 时 chase 自动撤单（原因: OFFSET_CANCELLED）
 *   - clientStrategyId length must be ≤ 28 chars / clientStrategyId 长度不超过 28 个字符
 *
 * Weight: 1
 * Security: TRADE (requires signer + nonce + signature)
 */

const axios = require('axios');
const config = require('./config');

const params = {
    symbol:       config.DEFAULT_SYMBOL,  // 交易对 / Trading pair
    side:         'BUY',                  // BUY 或 SELL
    quantityUnit: 'BASE',                 // BASE（以标的资产计）或 QUOTE（以报价资产计）
    quantity:     '0.001',                // 订单数量 / Order quantity

    // ── 可选参数 / Optional ──────────────────────────────────────────────────
    // positionSide:     'BOTH',          // 单向持仓用 BOTH，双向持仓用 LONG/SHORT
    // reduceOnly:       'false',         // 是否只减仓 / Reduce-only flag
    // chaseOffset:      '0',             // 与最优价的偏移，默认 0（精确挂钩）/ Offset from BBO, default 0
    // chaseOffsetType:  'ABSOLUTE',      // 当前仅支持 ABSOLUTE / Currently only ABSOLUTE
    // maxChaseOffset:   '100',           // 超过此偏移则自动取消 chase / Auto-cancel threshold
    // maxChaseOffsetType: 'ABSOLUTE',    // ABSOLUTE 或 PERCENTAGE
    // priceLimit:       '85000',         // 价格上限（BUY）/ 价格下限（SELL）
    // clientStrategyId: 'my_chase_1',   // 自定义策略ID（≤28字符）/ Custom strategy ID
};

async function chaseOrder() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/chase');
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
            `${config.BASE_URL}/fapi/v3/chase`,
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
    chaseOrder()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = chaseOrder;
