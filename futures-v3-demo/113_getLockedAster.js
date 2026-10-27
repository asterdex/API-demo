/**
 * Get Locked Aster / 查询全网锁定的 ASTER 总量（208 周）
 * GET /aster-chain/v3/staking/getLockedAster
 * Base URL: https://chainapi.asterdex.com
 *
 * Security: NONE (weight 20, no authentication / 无需认证)
 */

const axios = require('axios');

const CHAIN_API_URL = 'https://chainapi.asterdex.com';

const params = {};

async function getLockedAster() {
    try {
        console.log('Request / 请求:', 'GET /aster-chain/v3/staking/getLockedAster');
        console.log('Parameters / 参数:', params);

        const response = await axios.get(`${CHAIN_API_URL}/aster-chain/v3/staking/getLockedAster`, { params });

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    getLockedAster()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = getLockedAster;
