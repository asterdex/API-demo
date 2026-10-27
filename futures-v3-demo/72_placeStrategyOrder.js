/**
 * Place Strategy Order / 下策略组合单
 * POST /fapi/v3/placeStrategyOrder
 *
 * Place a new strategy order: OTO / OCO / OTOCO.
 * 下一个策略组合单：OTO（一触即发）/ OCO（二选一）/ OTOCO（三单组合）
 *
 * Strategy types / 策略类型:
 *   OTO   (One-Triggers-the-Other)  - 2 sub-orders, first triggers second / 2个子单，第一个触发第二个
 *   OCO   (One-Cancels-the-Other)   - 2 sub-orders, one fills cancels other / 2个子单，一个成交取消另一个
 *   OTOCO (One-Triggers-OCO)        - 3 sub-orders / 3个子单
 *
 * Notes / 注意:
 *   - subOrderList is sent as a JSON string / subOrderList 以 JSON 字符串格式传入
 *   - OTO/OCO need exactly 2 sub-orders; OTOCO needs exactly 3 / OTO/OCO 需恰好 2 个子单；OTOCO 需恰好 3 个
 *   - IOC/FOK are not supported for LIMIT sub-orders / LIMIT 子单不支持 IOC/FOK
 *
 * Weight: 50
 * Security: TRADE (requires signer + nonce + signature)
 */

const axios = require('axios');
const config = require('./config');

// ── 示例：OTO 策略（先开仓，再止盈）/ Example: OTO strategy (entry then take-profit) ──
const subOrderList = [
    {
        strategySubId: '1',
        securityType:  'FUTURE',
        symbol:        config.DEFAULT_SYMBOL,
        side:          'BUY',
        positionSide:  'BOTH',
        type:          'LIMIT',
        quantity:      '0.001',
        price:         '80000',
        timeInForce:   'GTC',
        // firstDrivenId, firstDrivenOn, firstTrigger 用于触发关系配置
        // See docs for trigger field details
    },
    {
        strategySubId: '2',
        securityType:  'FUTURE',
        symbol:        config.DEFAULT_SYMBOL,
        side:          'SELL',
        positionSide:  'BOTH',
        type:          'TAKE_PROFIT_MARKET',
        quantity:      '0.001',
        stopPrice:     '90000',
        reduceOnly:    'true',
        firstDrivenId: '1',
        firstDrivenOn: 'FILLED',
        firstTrigger:  'PLACE',
    }
];

const params = {
    strategyType:   'OTO',
    subOrderList:   JSON.stringify(subOrderList),
    // clientStrategyId: 'myStrategy1',  // 可选，自定义策略ID / Optional custom strategy ID
};

async function placeStrategyOrder() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/placeStrategyOrder');
        console.log('Strategy type / 策略类型:', params.strategyType);
        console.log('Sub-orders / 子单列表:', JSON.stringify(subOrderList, null, 2));

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);

        const response = await axios.post(
            `${config.BASE_URL}/fapi/v3/placeStrategyOrder`,
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
    placeStrategyOrder()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = placeStrategyOrder;
