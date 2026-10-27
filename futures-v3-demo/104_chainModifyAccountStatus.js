/**
 * Modify Account Status / 修改账户隐私状态（Aster Chain）
 * POST /aster-chain/v3/account/modify-status
 * Base URL: https://chainapi.asterdex.com
 *
 * 修改账户隐私状态，成功后变更会广播到 Aster Chain。
 * Modify the account's privacy status. After a successful update, the change is broadcast to the Aster Chain.
 *
 * ⚠️ PRIVATE 模式下批量转账（101_batchTransfer.js）不可用
 * ⚠️ Batch transfer (101_batchTransfer.js) is not available in PRIVATE mode
 *
 * 本 demo 默认先查询当前状态，再提交相同状态（不改变账户设置）；
 * 如需切换，把 TARGET_STATUS 改为 'PUBLIC' 或 'PRIVATE'。
 * By default this demo reads the current status and re-submits the SAME status (no actual change);
 * set TARGET_STATUS to 'PUBLIC' or 'PRIVATE' to really switch.
 *
 * Security: TRADE (weight 5) — 使用 API signer 签名 / signed by the API signer
 */

const axios = require('axios');
const config = require('./config');
const { signParamsWeb3, buildQueryString } = require('./utils');

const CHAIN_API_URL = 'https://chainapi.asterdex.com';

// null = 保持当前状态 / null = keep the current status
const TARGET_STATUS = null;   // 'PUBLIC' | 'PRIVATE' | null

async function chainModifyAccountStatus() {
    try {
        // Step 1: 查询当前状态 / Get the current status
        let status = TARGET_STATUS;
        if (!status) {
            const signedGet = await signParamsWeb3({}, config.USER_ADDRESS, config.SIGNER_ADDRESS, config.PRIVATE_KEY);
            const current = await axios.get(
                `${CHAIN_API_URL}/aster-chain/v3/account/status?${buildQueryString(signedGet)}`
            );
            status = current.data.status;
            console.log('Current status / 当前状态:', status);
        }

        // Step 2: 提交状态 / Submit the status
        const params = { status };
        console.log('Request / 请求:', 'POST /aster-chain/v3/account/modify-status');
        console.log('Parameters / 参数:', params);

        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const response = await axios.post(
            `${CHAIN_API_URL}/aster-chain/v3/account/modify-status`,
            buildQueryString(signedParams),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
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
    chainModifyAccountStatus()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = chainModifyAccountStatus;
