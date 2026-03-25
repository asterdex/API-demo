/**
 * Account Information / 账户信息
 * GET /fapi/v3/account
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const params = {};

async function account() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/account');
        console.log('Parameters / 参数:', params);
        
        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const fullUrl = `${config.BASE_URL}/fapi/v3/account?${queryString}`;
        const response = await axios.get(fullUrl);
        
        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        
        // Save to JSON file / 保存为 JSON 文件
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `account_info_${timestamp}.json`;
        const filepath = path.join(__dirname, filename);
        fs.writeFileSync(filepath, JSON.stringify(response.data, null, 2), 'utf-8');
        console.log(`\n✓ Saved to / 已保存至: ${filename}`);
        
        // Output request details / 输出请求详情
        console.log('\n--- Request Details / 请求详情 ---');
        console.log('Full URL / 完整URL:', fullUrl);
        // console.log('Query String / 查询字符串:', queryString);
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    account()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = account;
