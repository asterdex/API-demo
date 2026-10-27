/**
 * Pro Summary / Pro 统计摘要
 * POST /v1/private/campaign/portfolio/summary/pro
 *
 * Returns trading summary statistics (funding fees, commissions, trade counts/volumes,
 * grid strategy metrics) for the Pro portfolio within a given time period.
 * 返回指定时间段内 Pro 组合的交易统计数据（资金费、手续费、交易笔数/量、网格策略指标）。
 *
 * Period Enum / 时间段枚举:
 *   24h  — 最近 24 小时 / Last 24 hours
 *   7d   — 最近 7 天 / Last 7 days
 *   14d  — 最近 14 天 / Last 14 days
 *   30d  — 最近 30 天 / Last 30 days
 *   all  — 全部时间 / All time (default when omitted)
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
    // period: '7d',  // 可选；不传则默认返回全部时间 / Optional; omit to get all-time stats
    period: '30d',
};

function buildAuthHeaders() {
    // 优先使用 Bearer Token；如无则退回到 cookie
    // Prefer Bearer Token; fall back to session cookie if not set
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

async function proSummary() {
    try {
        console.log('Request / 请求:', 'POST /v1/private/campaign/portfolio/summary/pro');
        console.log('Body / 请求体:', requestBody);

        const response = await axios.post(
            `${config.PORTFOLIO_BASE_URL}/v1/private/campaign/portfolio/summary/pro`,
            requestBody,
            { headers: buildAuthHeaders() }
        );

        console.log('\nResponse / 响应:');
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    proSummary()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = proSummary;
