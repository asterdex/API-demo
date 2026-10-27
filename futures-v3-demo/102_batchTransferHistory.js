/**
 * Batch Transfer History / 查询批量转账历史（Aster Chain）
 * GET /aster-chain/v3/batch-transfer/history
 * Base URL: https://chainapi.asterdex.com
 *
 * 查询当前账户提交的批量转账及每笔明细的结果。
 * Get the batch transfers submitted by the current account, with the result of each item.
 *
 * 参数 / Parameters:
 *   clientTranId - 批次ID；仅传它（不传 startTime/endTime）时只返回该批次，不受创建时间限制
 *                  Batch ID; if sent alone, returns that batch only regardless of creation time
 *   status       - 批次状态 / Batch status: I(待执行 pending) P(执行中 processing) S(成功 success) F(失败 failed) M(部分成功 partial)
 *   startTime    - 批次创建时间(ms)，包含；默认 endTime-7天 / creation time, inclusive; default endTime - 7 days
 *   endTime      - 批次创建时间(ms)，不包含；默认当前时间 / creation time, exclusive; default now
 *   page         - 页码，从 1 开始 / page number, starts at 1
 *   limit        - 每页批次数，默认 20，最大 100 / batches per page, default 20, max 100
 *   时间跨度不能超过 31 天 / time range must not exceed 31 days
 *
 * Security: USER_DATA (weight 5) — 使用 API signer 签名 / signed by the API signer
 */

const axios = require('axios');
const config = require('./config');

const CHAIN_API_URL = 'https://chainapi.asterdex.com';

const params = {
    // "clientTranId": "batch-20261026-000000001",   // 指定批次ID查询 / query a specific batch
    // "status": "S",
    "page": 1,
    "limit": 20
};

async function batchTransferHistory() {
    try {
        console.log('Request / 请求:', 'GET /aster-chain/v3/batch-transfer/history');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(
            `${CHAIN_API_URL}/aster-chain/v3/batch-transfer/history?${queryString}`
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
    batchTransferHistory()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = batchTransferHistory;
