/**
 * Query Strategy History Order / 查询历史策略单
 * GET /fapi/v3/strategyHistoryOrder
 *
 * Query historical strategy orders by strategyId or clientStrategyId (mutually exclusive).
 * Maximum lookback window: 90 days.
 * 通过 strategyId 或 clientStrategyId 查询历史策略单（二者互斥）。
 * 最大回溯窗口：90 天。
 *
 * Weight: 5
 * Security: USER_DATA (requires signer + nonce + signature)
 */

const axios = require('axios');
const config = require('./config');
const { signParamsWeb3, buildQueryString } = require('./utils');

const params = {
    strategyType: 'OTO',              // 策略类型: OTO / OCO / OTOCO
    strategyId:   123456789,          // 与 clientStrategyId 二选一 / Mutually exclusive with clientStrategyId
    // clientStrategyId: 'myStrategy1',
    // startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,  // 可选，开始时间(ms) / Optional start time
    // endTime:   Date.now(),                              // 可选，结束时间(ms) / Optional end time
    // limit:     500,                                     // 默认 500，最大 1000 / Default 500, max 1000
};

async function strategyHistoryOrder() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/strategyHistoryOrder');
        console.log('Parameters / 参数:', params);

        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);

        const response = await axios.get(
            `${config.BASE_URL}/fapi/v3/strategyHistoryOrder?${queryString}`
        );

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    strategyHistoryOrder()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = strategyHistoryOrder;
