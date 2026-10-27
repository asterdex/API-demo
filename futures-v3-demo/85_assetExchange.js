/**
 * Asset Exchange / 手动触发资产兑换
 * POST /fapi/v3/assetExchange
 *
 * 在联合保证金（Multi-Assets Mode）下手动触发一次资产兑换（等同于阈值为 0 的自动兑换）
 * Manually trigger an asset exchange in Multi-Assets Mode (equivalent to auto exchange with threshold 0)
 *
 * - 无业务参数，仅需通用鉴权参数 / No business params, only common auth params
 * - 仅联合保证金模式可用，否则返回 -4212 / Only in Multi-Assets Mode, otherwise -4212 is returned
 * - 若没有发生兑换，响应体为空 / If no exchange takes place, the response body is empty
 *
 * Security: TRADE (weight 1)
 */

const axios = require('axios');
const config = require('./config');

const params = {};

async function assetExchange() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/assetExchange');
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
            `${config.BASE_URL}/fapi/v3/assetExchange`,
            queryString,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
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
    assetExchange()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = assetExchange;
