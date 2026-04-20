/**
 * Noop / 空操作（取消排队中的交易）
 * POST /api/v3/noop
 *
 * 通过此请求，可以高效取消已发送但仍在队列中且尚未完成链上操作的交易。
 * Nonce 需与需要撤销的目标请求一致，不保证成功。
 */

const axios = require('axios');
const config = require('./config');

async function noop(targetNonce) {
    try {
        console.log('Request / 请求:', 'POST /api/v3/noop');

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            {},
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );

        // 若指定 targetNonce，使用该 nonce（需与目标请求一致）
        if (targetNonce) {
            signedParams.nonce = String(targetNonce);
        }

        const queryString = buildQueryString(signedParams);
        const response = await axios.post(
            `${config.BASE_URL}/api/v3/noop`,
            queryString,
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
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
