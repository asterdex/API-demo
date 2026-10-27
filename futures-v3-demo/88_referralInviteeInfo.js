/**
 * Get Invitee Info / 查询邀请用户信息
 * GET /fapi/v3/referral/inviteeInfo
 *
 * address: 待查询的钱包地址（EVM 或 Solana）/ wallet address to check (EVM or Solana)
 * Security: USER_DATA (weight 1)
 */

const axios = require('axios');
const config = require('./config');

const params = {
    "address": "0x0000000000000000000000000000000000000001"
};

async function referralInviteeInfo() {
    try {
        console.log('Request / 请求:', 'GET /fapi/v3/referral/inviteeInfo');
        console.log('Parameters / 参数:', params);

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            params,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);
        const response = await axios.get(`${config.BASE_URL}/fapi/v3/referral/inviteeInfo?${queryString}`);

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    referralInviteeInfo()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = referralInviteeInfo;
