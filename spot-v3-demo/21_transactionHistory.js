/**
 * Transaction History / 查询交易流水 (USER_DATA)
 * GET /api/v3/transactionHistory
 *
 * type 取值：TRADE_TARGET, TRADE_SOURCE, TRANSFER_SPOT_TO_FUTURE,
 *            TRANSFER_FUTURE_TO_SPOT, TRANSFER_SPOT_TO_SPOT, AIRDROP,
 *            DIVIDEND, TRANSFER_REFUND, INTERNAL_TRANSFER, TRANSFER,
 *            SWAP, COMMISSION_REBATE, CASH_BACK
 */

const axios = require('axios');
const config = require('./config');

const params = {
    // "limit": 20
    "symbol": "ASTERUSDT",
    // "asset": "USDT",
    // "type": "TRADE_SOURCE",
    // "startTime": 1700000000000,
    // "endTime": 1700086400000
};

async function transactionHistory() {
    try {
        console.log('Request / 请求:', 'GET /api/v3/transactionHistory');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(`${config.BASE_URL}/api/v3/transactionHistory?${queryString}`);

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    transactionHistory()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = transactionHistory;
