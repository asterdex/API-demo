/**
 * Update Strategy Order / 修改策略组合单
 * POST /fapi/v3/updateStrategyOrder
 *
 * Update one or more sub-orders of an existing strategy order.
 * 修改现有策略组合单中的一个或多个子单。
 *
 * Notes / 注意:
 *   - strategyId is required / strategyId 必传
 *   - Max 2 sub-orders for OTO/OCO; max 3 for OTOCO / OTO/OCO 最多 2 个；OTOCO 最多 3 个
 *
 * Weight: 50
 * Security: TRADE (requires signer + nonce + signature)
 */

const axios = require('axios');
const config = require('./config');

// 要修改的子单列表 / Sub-orders to update
const subOrderList = [
    {
        strategySubId: '1',
        securityType:  'FUTURE',
        symbol:        config.DEFAULT_SYMBOL,
        side:          'BUY',
        type:          'LIMIT',
        quantity:      '0.002',    // 修改数量 / New quantity
        price:         '79000',    // 修改价格 / New price
        timeInForce:   'GTC',
    }
];

const params = {
    strategyId:   123456789,       // 策略订单ID，由 placeStrategyOrder 返回 / Strategy ID from placeStrategyOrder response
    strategyType: 'OTO',
    subOrderList: JSON.stringify(subOrderList),
};

async function updateStrategyOrder() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/updateStrategyOrder');
        console.log('Strategy ID / 策略ID:', params.strategyId);
        console.log('Sub-orders to update / 待修改子单:', JSON.stringify(subOrderList, null, 2));

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);

        const response = await axios.post(
            `${config.BASE_URL}/fapi/v3/updateStrategyOrder`,
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
    updateStrategyOrder()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = updateStrategyOrder;
