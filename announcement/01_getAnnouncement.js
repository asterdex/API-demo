/**
 * Get Announcement / 获取单条公告
 * GET /bapi/composite/v1/public/composite/ae/announcement/get
 *
 * Retrieve a single announcement by its ID.
 * 通过 ID 获取单条公告详情。
 *
 * Security: PUBLIC (no authentication required / 无需认证)
 * Base URL: https://www.asterdex.com
 */

const axios = require('axios');
const config = require('./config');

// 填入要查询的公告 ID / Set the announcement ID to query
const ANNOUNCEMENT_ID = 277;

async function getAnnouncement() {
    try {
        console.log('Request / 请求:', 'GET /bapi/composite/v1/public/composite/ae/announcement/get');
        console.log('Parameters / 参数:', { id: ANNOUNCEMENT_ID });

        const response = await axios.get(
            `${config.COMPOSITE_BASE_URL}/bapi/composite/v1/public/composite/ae/announcement/get`,
            { params: { id: ANNOUNCEMENT_ID } }
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
    getAnnouncement()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = getAnnouncement;
