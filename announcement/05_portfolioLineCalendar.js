/**
 * Portfolio Line Calendar / 持仓组合日历图
 * POST /v1/private/campaign/portfolio/overview/line/calendar
 *
 * Returns daily-granularity portfolio data points within a specified date range,
 * used to render a calendar-style or date-range chart.
 * Unlike the period-based line chart, this endpoint queries by explicit start/end dates.
 * 返回指定日期范围内的每日持仓数据，用于渲染日历风格图表。
 * 与基于 period 的折线图不同，此接口通过明确的起止日期查询。
 *
 * Notes / 注意:
 *   - startDate and endDate are required / startDate 和 endDate 均为必填
 *   - Date format: yyyy-MM-dd
 *   - Recommended range ≤ 90 days / 建议查询区间不超过 90 天
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

// 辅助函数：将 Date 对象格式化为 yyyy-MM-dd / Helper: format Date to yyyy-MM-dd
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

const today     = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);

const requestBody = {
    startDate: formatDate(thirtyDaysAgo),   // 起始日期（含）/ Start date (inclusive)
    endDate:   formatDate(today),           // 结束日期（含）/ End date (inclusive)
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

async function portfolioLineCalendar() {
    try {
        console.log('Request / 请求:', 'POST /v1/private/campaign/portfolio/overview/line/calendar');
        console.log('Body / 请求体:', requestBody);

        const response = await axios.post(
            `${config.PORTFOLIO_BASE_URL}/v1/private/campaign/portfolio/overview/line/calendar`,
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
    portfolioLineCalendar()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = portfolioLineCalendar;
