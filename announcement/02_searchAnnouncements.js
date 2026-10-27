/**
 * Search Announcements / 搜索公告列表
 * POST /bapi/composite/v1/public/composite/ae/announcement/search
 *
 * Paginated search for announcements with optional category filtering.
 * 分页搜索公告，支持按类型过滤。
 *
 * Category Enum / 公告类型枚举:
 *   ACTIVITY    — 活动公告 / Activity announcements
 *   NEW_LISTING — 新币上线 / New token listings
 *   DELISTING   — 下线通知 / Delisting notices
 *   UPDATES     — 平台更新 / Platform updates
 *   (omit category to return all / 不传 category 返回所有类型)
 *
 * Security: PUBLIC (no authentication required / 无需认证)
 * Base URL: https://www.asterdex.com
 */

const axios = require('axios');
const config = require('./config');

const requestBody = {
    page:     1,             // 页码，从 1 开始 / Page number, starts from 1
    size:     10,            // 每页条数 / Items per page
    // category: 'NEW_LISTING', // 可选，过滤类型；注释掉则返回全部 / Optional category filter
};

async function searchAnnouncements() {
    try {
        console.log('Request / 请求:', 'POST /bapi/composite/v1/public/composite/ae/announcement/search');
        console.log('Body / 请求体:', requestBody);

        const response = await axios.post(
            `${config.COMPOSITE_BASE_URL}/bapi/composite/v1/public/composite/ae/announcement/search`,
            requestBody,
            { headers: { 'Content-Type': 'application/json' } }
        );

        const data = response.data;
        console.log('\nResponse / 响应:');
        console.log(JSON.stringify(data, null, 2));

        if (data.data) {
            console.log(`\nTotal / 总条数: ${data.data.total}`);
            console.log(`Returned / 本页返回: ${data.data.rows?.length ?? 0} items`);
        }

        return data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    searchAnnouncements()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = searchAnnouncements;
