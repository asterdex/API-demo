/**
 * Portfolio Line Chart / 持仓组合折线图
 * POST /v1/private/campaign/portfolio/overview/v2/line/chart
 *
 * Returns time-series data points for rendering a multi-line equity curve chart.
 * Each point contains balance and PnL broken down by asset type (perp, spot, staking).
 * 返回用于绘制多折线资产曲线图的时序数据，每个点包含各资产类型（合约/现货/质押）的余额和 PnL。
 *
 * Period Enum / 时间段枚举:
 *   24h / 7d / 14d / 30d / all
 *
 * Security: PRIVATE (requires valid user session / 需要用户登录 session)
 * Base URL: https://asterdex.com/bapi/futures
 *
 * ⚠️ 认证说明 / Auth Note:
 *   Fill in SESSION_COOKIE or AUTH_TOKEN in config.js before running.
 *   运行前请在 config.js 中填写 SESSION_COOKIE 或 AUTH_TOKEN。
 */

const axios = require('axios');
const config = require('./config');

const requestBody = {
    period: '30d',  // 24h | 7d | 14d | 30d | all
};

function buildAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (config.AUTH_TOKEN && config.AUTH_TOKEN !== 'YOUR_AUTH_TOKEN_HERE') {
        headers['Authorization'] = `Bearer ${config.AUTH_TOKEN}`;
    } else if (config.SESSION_COOKIE && config.SESSION_COOKIE !== 'YOUR_SESSION_COOKIE_HERE') {
        headers['Cookie'] = config.SESSION_COOKIE;
    } else {
        console.warn('⚠️  No auth configured. Set SESSION_COOKIE or AUTH_TOKEN in config.js');
        console.warn('⚠️  未配置认证信息，请在 config.js 中设置 SESSION_COOKIE 或 AUTH_TOKEN');
    }
    return headers;
}

async function portfolioLineChart() {
    try {
        console.log('Request / 请求:', 'POST /v1/private/campaign/portfolio/overview/v2/line/chart');
        console.log('Body / 请求体:', requestBody);

        const response = await axios.post(
            `${config.PORTFOLIO_BASE_URL}/v1/private/campaign/portfolio/overview/v2/line/chart`,
            requestBody,
            { headers: buildAuthHeaders() }
        );

        const data = response.data;
        console.log('\nResponse / 响应:');
        console.log(JSON.stringify(data, null, 2));

        if (Array.isArray(data.data)) {
            console.log(`\nData points / 数据点数量: ${data.data.length}`);
        }

        return data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    portfolioLineChart()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = portfolioLineChart;
