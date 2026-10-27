/**
 * Change STP Mode / 修改账户级别 STP 模式
 * POST /fapi/v3/stpMode
 *
 * Set the account-level Self-Trade Prevention (STP) mode.
 * This mode applies to all orders by default; individual orders may override it via the stpMode parameter.
 * 设置账户级别的自成交防止（STP）模式，作为所有订单的默认值。
 * 单个订单可通过 stpMode 参数覆盖此设置。
 *
 * Weight: 1
 * Security: TRADE (requires signer + nonce + signature)
 */

const axios = require('axios');
const config = require('./config');

const params = {
    // EXPIRE_TAKER: 撤销 taker 方订单 / cancel taker side
    // EXPIRE_MAKER: 撤销 maker 方订单 / cancel maker side
    // EXPIRE_BOTH:  同时撤销双方订单 / cancel both sides
    stpMode: 'EXPIRE_TAKER'
};

async function setStpMode() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/stpMode');
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
            `${config.BASE_URL}/fapi/v3/stpMode`,
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
    setStpMode()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = setStpMode;
