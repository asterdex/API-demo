/**
 * Get Position Mode / 查询持仓模式
 * GET /fapi/v3/positionSide/dual
 * 
 * Query current position mode (Hedge Mode or One-way Mode)
 * 查询当前持仓模式（双向持仓或单向持仓）
 * 
 * Weight: 30
 * Security: USER_DATA (requires Web3 signature)
 */

const axios = require('axios');
const config = require('./config');
const { signParamsWeb3, buildQueryString } = require('./utils');

/**
 * Get position mode / 获取持仓模式
 */
async function getPositionMode() {
    try {
        console.log('Getting position mode... / 获取持仓模式中...\n');
        
        // Parameters (empty for this endpoint) / 参数（此接口为空）
        const params = {};
        
        // Generate Web3 signature / 生成Web3签名
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        
        // Build query string / 构建查询字符串
        const queryString = buildQueryString(signedParams);
        
        // Make request / 发起请求
        const response = await axios.get(
            `${config.BASE_URL}/fapi/v3/positionSide/dual?${queryString}`
        );
        
        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Execute / 执行
if (require.main === module) {
    getPositionMode()
        .then(() => console.log('\n✓ Request completed / 请求完成'))
        .catch(() => console.log('\n✗ Request failed / 请求失败'));
}

module.exports = getPositionMode;
