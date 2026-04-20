/**
 * Set MMP (Market Maker Protection) / 更新用户MMP
 * POST /fapi/v3/mmp
 *
 * 在时间窗口内累计成交数量/名义价值/持仓变化达到限制时，
 * 触发 frozenTimeInMilliseconds 冻结期，期间禁止下MMP订单
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "symbol": "BTCUSDT",
    "windowTimeInMilliseconds": "5000",    // 时间窗口（ms）
    "frozenTimeInMilliseconds": "10000",   // 触发后冻结时长（ms）
    "qtyLimit": "10",                      // 窗口内累计成交数量上限（可选）
    // "valueLimit": "200000000",          // 窗口内累计名义价值上限（可选）
    // "deltaLimit": "100000000"           // 窗口内累计持仓变化上限（可选）
};

async function setMmp() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/mmp');
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
            `${config.BASE_URL}/fapi/v3/mmp`,
            queryString,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
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
    setMmp()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = setMmp;
