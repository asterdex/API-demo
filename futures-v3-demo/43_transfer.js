/**
 * Transfer Between Futures And Spot / 期货现货划转
 * POST /fapi/v3/asset/wallet/transfer
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "asset": "USDT",
    "amount": "100",
    "clientTranId": `transfer_${Date.now()}`, // 唯一的交易ID / Unique transaction ID
    "kindType": "FUTURE_SPOT" // FUTURE_SPOT (期货转现货) 或 SPOT_FUTURE (现货转期货)
};

async function transfer() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/asset/wallet/transfer');
        console.log('Parameters / 参数:', params);
        
        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const fullUrl = `${config.BASE_URL}/fapi/v3/asset/wallet/transfer`;
        const response = await axios.post(
            fullUrl,
            queryString,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        
        // Output request details / 输出请求详情
        console.log('\n--- Request Details / 请求详情 ---');
        console.log('Full URL / 完整URL:', fullUrl);
        console.log('Query String / 查询字符串:', queryString);
        
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
