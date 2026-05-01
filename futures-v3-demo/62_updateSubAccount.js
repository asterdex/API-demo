/**
 * Update Sub-Account / 更新子账户
 * POST /fapi/v3/updateSubAccount
 *
 * ⚠️ signature 必须使用主账户（主钱包）私钥签名，不能使用 API signer 私钥
 * ⚠️ signature must be signed with MASTER wallet private key, NOT the API signer key
 *
 * 可更新子账户名称（subAccountName）和/或状态（status: NORMAL | FROZEN）
 * Can update sub-account name (subAccountName) and/or status (NORMAL | FROZEN)
 */

const axios = require('axios');
const { ethers } = require('ethers');
const config = require('./config');

const PARAMS = {
    subSourceAddr: '0xSubAccountWalletAddress',  // 子账户钱包地址 / Sub-account wallet address
    subAccountName: 'new-name',                  // 新名称（可选）/ New name (optional)
    status: 'NORMAL',                            // NORMAL(解冻) / FROZEN(冻结)，可选 / optional
};

const EIP712_DOMAIN = config.EIP712_DOMAIN;

async function updateSubAccount() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/updateSubAccount');

        const { getNonce, buildQueryString } = require('./utils');
        const nonce = String(getNonce());

        // ── Step 1: Build message body and sign with MASTER wallet key ──
        // 只有提供的可选字段才加入消息体 / Include optional fields only if provided
        let msgParts = [
            `subSourceAddr=${PARAMS.subSourceAddr}`,
            `nonce=${nonce}`,
            `user=${config.USER_ADDRESS}`,
            `signer=${config.SIGNER_ADDRESS}`
        ];
        if (PARAMS.subAccountName) msgParts.push(`subAccountName=${PARAMS.subAccountName}`);
        if (PARAMS.status) msgParts.push(`status=${PARAMS.status}`);
        const masterMsgBody = msgParts.join('&');

        const types = { Message: [{ name: 'msg', type: 'string' }] };
        const value = { msg: masterMsgBody };

        // ⚠️ Must use MASTER wallet private key, NOT the API signer key
        const masterWallet = new ethers.Wallet(config.PRIVATE_KEY);
        const signature = await masterWallet.signTypedData(EIP712_DOMAIN, types, value);
        console.log('signature:', signature);

        // ── Step 2: Send request / 发送请求 ──
        const requestParams = {
            subSourceAddr: PARAMS.subSourceAddr,
            nonce,
            user: config.USER_ADDRESS,
            signer: config.SIGNER_ADDRESS,
            signature
        };
        if (PARAMS.subAccountName) requestParams.subAccountName = PARAMS.subAccountName;
        if (PARAMS.status) requestParams.status = PARAMS.status;

        const queryString = buildQueryString(requestParams);
        const response = await axios.post(
            `${config.BASE_URL}/fapi/v3/updateSubAccount`,
            queryString,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    updateSubAccount()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = updateSubAccount;
