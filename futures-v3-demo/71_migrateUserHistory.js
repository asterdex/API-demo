/**
 * Migrate User Assets History / 查询资产迁移状态
 * GET /fapi/v3/asset/migrateUser/history
 *
 * Query the migration status by batchId.
 * 通过 batchId 查询资产迁移的状态。
 *
 * Weight: 50
 * Security: USER_DATA (requires signer + nonce + signature)
 */

const axios = require('axios');
const config = require('./config');
const { signParamsWeb3, buildQueryString } = require('./utils');

const params = {
    // batchId 由 POST /fapi/v3/asset/migrateUser 返回
    // batchId is returned by POST /fapi/v3/asset/migrateUser
    batchId: 'a1B2c3D4e5F6g7H8i9J0k1'
};

async function migrateUserHistory() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/asset/migrateUser/history');
        console.log('Parameters / 参数:', params);

        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);

        const response = await axios.get(
            `${config.BASE_URL}/fapi/v3/asset/migrateUser/history?${queryString}`
        );

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    migrateUserHistory()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = migrateUserHistory;
