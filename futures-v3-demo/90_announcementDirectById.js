/**
 * Get Direct Announcement By ID / 按ID获取直达公告
 * GET /fapi/v3/announcement/directById
 *
 * id: 公告ID，可先用 89_announcementDirect.js 获取 / announcement ID, get it from 89_announcementDirect.js
 * Security: USER_DATA (weight 1)
 */

const axios = require('axios');
const config = require('./config');

// id 为空时，自动取 89_announcementDirect.js 列表中的第一条公告ID
// If id is empty, the first announcement ID from the list (89_announcementDirect.js) is used
const params = {
    "id": null
};

async function announcementDirectById() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/announcement/directById');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');

        if (!params.id) {
            const listSigned = await signParamsWeb3(
                { page: 1, size: 1 },
                config.USER_ADDRESS,
                config.SIGNER_ADDRESS,
                config.PRIVATE_KEY
            );
            const list = await axios.get(`${config.BASE_URL}/fapi/v3/announcement/direct?${buildQueryString(listSigned)}`);
            params.id = list.data.rows && list.data.rows.length ? list.data.rows[0].id : 1;
            console.log('Using announcement id / 使用公告ID:', params.id);
        }

        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(`${config.BASE_URL}/fapi/v3/announcement/directById?${queryString}`);

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    announcementDirectById()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = announcementDirectById;
