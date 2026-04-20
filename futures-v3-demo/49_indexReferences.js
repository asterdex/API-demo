/**
 * Index Price References / 获取指数价格成分
 * GET /fapi/v3/indexreferences
 *
 * 查询指数价格的成分交易所及各交易所的权重
 */

const axios = require('axios');
const config = require('./config');

const params = {
    symbol: config.DEFAULT_SYMBOL  // 必填 / Required
};

async function indexReferences() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/indexreferences');
        console.log('Parameters / 参数:', params);

        const queryString = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join('&');
        const response = await axios.get(`${config.BASE_URL}/fapi/v3/indexreferences?${queryString}`);

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    indexReferences()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = indexReferences;
