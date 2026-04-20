/**
 * Noop / 空操作（取消排队中的交易）
 * POST /fapi/v3/noop
 *
 * 通过此请求，可以高效取消已发送但仍在队列中且尚未完成链上操作的交易。
 * Nonce 需与需要撤销的目标请求一致，不保证成功。
 *
 * 典型用法：下单时用相同 nonce 同时发送 noop，若订单仍在队列中则可被取消。
 */

const axios = require('axios');
const config = require('./config');

async function noop(targetNonce) {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/noop');

        const { signParamsWeb3, buildQueryString } = require('./utils');

        // 若指定 targetNonce，使用该 nonce（需与目标请求一致）
        // If targetNonce provided, use it (must match the target request's nonce)
        const params = {};
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );

        if (targetNonce) {
            signedParams.nonce = String(targetNonce);
        }

        const queryString = buildQueryString(signedParams);
        const response = await axios.post(
            `${config.BASE_URL}/fapi/v3/noop`,
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
    noop()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = noop;
