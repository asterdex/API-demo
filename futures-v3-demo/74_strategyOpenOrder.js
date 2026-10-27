/**
 * Query Strategy Open Order / 查询当前策略挂单
 * GET /fapi/v3/strategyOpenOrder
 *
 * Query a currently open strategy order by strategyId or clientStrategyId (mutually exclusive).
 * 通过 strategyId 或 clientStrategyId 查询当前未完成的策略单（二者互斥）。
 *
 * Weight: 5
 * Security: USER_DATA (requires signer + nonce + signature)
 */

const axios = require('axios');
const config = require('./config');
const { signParamsWeb3, buildQueryString } = require('./utils');

const params = {
    strategyType: 'OTO',           // 策略类型: OTO / OCO / OTOCO
    strategyId:   123456789,       // 与 clientStrategyId 二选一 / Mutually exclusive with clientStrategyId
    // clientStrategyId: 'myStrategy1',
};

async function strategyOpenOrder() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/strategyOpenOrder');
        console.log('Parameters / 参数:', params);

        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);

        const response = await axios.get(
            `${config.BASE_URL}/fapi/v3/strategyOpenOrder?${queryString}`
        );

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    strategyOpenOrder()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = strategyOpenOrder;
