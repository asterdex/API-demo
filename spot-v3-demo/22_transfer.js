/**
 * Spot <-> Futures Transfer / 期货现货互转 (TRADE)
 * POST /api/v3/asset/wallet/transfer
 *
 * kindType: SPOT_FUTURE (现货→期货), FUTURE_SPOT (期货→现货)
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "asset": "USDT",
    "amount": "10",
    "clientTranId": `transfer_${Date.now()}`,
    "kindType": "SPOT_FUTURE"  // SPOT_FUTURE 或 FUTURE_SPOT
};

async function transfer() {
    try {
        console.log('Request / 请求:', 'POST /api/v3/asset/wallet/transfer');
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
            `${config.BASE_URL}/api/v3/asset/wallet/transfer`,
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
    transfer()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = transfer;
