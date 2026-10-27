/**
 * Query Deposit Assets / 查询所有充值资产
 * GET /bapi/futures/v1/public/future/aster/deposit/assets
 *
 * 返回指定链和网络下支持充值的资产列表。
 * Returns the list of assets available for deposit on the specified chain/network.
 *
 * Security: PUBLIC (no authentication required / 无需认证)
 * Base URL: https://www.asterdex.com
 */

const axios = require('axios');

const BAPI_BASE_URL = 'https://www.asterdex.com';

const params = {
    chainIds:    '56',    // 链ID，多个用逗号分隔 / Chain IDs, comma-separated. e.g. '1,56,42161'
    networks:    'EVM',   // 网络类型，可选 EVM / SOLANA，多个用逗号分隔 / Optional: EVM, SOLANA
    accountType: 'spot',  // 账户类型: spot（现货）或 perp（合约）/ Account type: spot or perp
};

async function depositAssets() {
    try {
        console.log('Request / 请求:', 'GET /bapi/futures/v1/public/future/aster/deposit/assets');
        console.log('Parameters / 参数:', params);

        const response = await axios.get(
            `${BAPI_BASE_URL}/bapi/futures/v1/public/future/aster/deposit/assets`,
            { params }
        );

        console.log('\nResponse / 响应:');
        console.log(JSON.stringify(response.data, null, 2));

        if (Array.isArray(response.data?.data)) {
            console.log(`\nAssets count / 资产数量: ${response.data.data.length}`);
        }

        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    depositAssets()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = depositAssets;
