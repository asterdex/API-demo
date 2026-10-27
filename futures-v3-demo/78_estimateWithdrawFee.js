/**
 * Estimate Withdraw Fee / 估算提现手续费
 * GET /bapi/futures/v1/public/future/aster/estimate-withdraw-fee
 *
 * 返回指定资产在指定链上的预估提现手续费（以代币单位计）。
 * Returns the estimated withdrawal fee (in token units) for the specified asset on the given chain.
 *
 * Response field / 响应字段:
 *   gasCost — 以代币单位计的预估提现手续费 / Estimated withdrawal fee in token units
 *
 * Security: PUBLIC (no authentication required / 无需认证)
 * Base URL: https://www.asterdex.com
 */

const axios = require('axios');

const BAPI_BASE_URL = 'https://www.asterdex.com';

const params = {
    chainId:     56,       // 链ID / Chain ID. e.g. 1(ETH), 56(BSC), 42161(Arbitrum), 101(Solana)
    network:     'EVM',    // 网络类型: EVM 或 SOL / Network type: EVM or SOL
    currency:    'USDT',   // 币种名称 / Asset name. e.g. USDT, ASTER
    accountType: 'spot',   // 账户类型: spot 或 perp / Account type: spot or perp
};

async function estimateWithdrawFee() {
    try {
        console.log('Request / 请求:', 'GET /bapi/futures/v1/public/future/aster/estimate-withdraw-fee');
        console.log('Parameters / 参数:', params);

        const response = await axios.get(
            `${BAPI_BASE_URL}/bapi/futures/v1/public/future/aster/estimate-withdraw-fee`,
            { params }
        );

        console.log('\nResponse / 响应:');
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data?.data) {
            console.log(`\nEstimated fee / 预估手续费: ${response.data.data.gasCost} ${params.currency}`);
        }

        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    estimateWithdrawFee()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = estimateWithdrawFee;
