/**
 * Batch Orders / 批量下单
 * POST /fapi/v3/batchOrders
 */

const axios = require('axios');
const config = require('./config');

// IMPORTANT: batchOrders must use SINGLE quotes, not double quotes
// 重要：batchOrders 必须使用单引号，不能使用双引号
const params = {
    batchOrders: JSON.stringify([{"symbol":"ASTERUSDT","side":"BUY","type":"LIMIT","quantity":"0.001","price":"0.0100","timeInForce":"GTC"},{"symbol":"ASTERUSDT","side":"BUY","type":"LIMIT","quantity":"0.001","price":"0.0101","timeInForce":"GTC"}]).replace(/"/g, "'")
};

async function batchOrders() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/batchOrders');
        console.log('Parameters / 参数:', params);
        
        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        
        // IMPORTANT: Parameters must be in URL query string, not in body (matching Python demo)
        // 重要：参数必须在 URL query string 中，不是在 body 中（匹配 Python demo）
        const response = await axios.post(
            `${config.BASE_URL}/fapi/v3/batchOrders?${queryString}`,
            '',  // Empty body / 空 body
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
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
    batchOrders()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = batchOrders;
