/**
 * Get All Asset Logo / 查询所有资产 Logo
 * GET /fapi/v3/common/asset/all-asset-logo
 *
 * 返回所有有效资产的 Logo 地址
 * Returns the logo URL of every active asset
 *
 * Security: NONE (public, no authentication required / 公开接口，无需认证)
 */

const axios = require('axios');
const config = require('./config');

async function allAssetLogo() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/common/asset/all-asset-logo');

        const response = await axios.get(`${config.BASE_URL}/fapi/v3/common/asset/all-asset-logo`);

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    allAssetLogo()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = allAssetLogo;
