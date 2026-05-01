/**
 * Bind Sub-Account / 绑定子账户
 * POST /fapi/v3/sub-accounts/bind
 *
 * ⚠️ 此接口需要两套独立签名：
 *   1. childSignature  - 子账户用自己的钱包私钥对消息体 (不含 childSignature) 进行 EIP-712 签名
 *   2. signature       - 主账户用主钱包私钥对消息体 (含 childSignature) 进行 EIP-712 签名
 *                        注意：必须使用主钱包私钥，不能使用 API signer 私钥
 *
 * ⚠️ Two independent signatures required:
 *   1. childSignature  - Sub-account signs message body (excluding childSignature) with its own wallet private key
 *   2. signature       - Master account signs full message body (including childSignature) with MASTER wallet key
 *                        Note: Must use MASTER wallet private key, NOT the API signer key
 */

const axios = require('axios');
const { ethers } = require('ethers');
const config = require('./config');

const PARAMS = {
    childAddress: '0xSubAccountWalletAddress',   // 子账户钱包地址 / Sub-account wallet address
    name: 'trading-desk-1',                       // 子账户名称 / Sub-account name
    // childPrivateKey: '0x...',                  // 子账户私钥（仅用于生成 childSignature）/ Sub-account private key (for childSignature only)
};

const EIP712_DOMAIN = config.EIP712_DOMAIN;

async function bindSubAccount() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/sub-accounts/bind');

        const { getNonce, buildQueryString } = require('./utils');
        const nonce = String(getNonce());

        // ── Step 1: Sub-account signature / 子账户签名 ──
        // Message body: childAddress + name + nonce + user (no childSignature)
        const childMsgBody = `childAddress=${PARAMS.childAddress}&name=${PARAMS.name}&nonce=${nonce}&user=${config.USER_ADDRESS}`;

        const childTypes = { Message: [{ name: 'msg', type: 'string' }] };
        const childValue = { msg: childMsgBody };

        // ⚠️ Replace with sub-account private key / 请替换为子账户私钥
        const childWallet = new ethers.Wallet('0xSUB_ACCOUNT_PRIVATE_KEY');
        const childSignature = await childWallet.signTypedData(EIP712_DOMAIN, childTypes, childValue);
        console.log('childSignature:', childSignature);

        // ── Step 2: Master account signature / 主账户签名 ──
        // Message body: full body including childSignature
        const masterMsgBody = `${childMsgBody}&childSignature=${childSignature}`;

        const masterTypes = { Message: [{ name: 'msg', type: 'string' }] };
        const masterValue = { msg: masterMsgBody };

        // ⚠️ Must use MASTER wallet private key, NOT the API signer key
        // ⚠️ 必须使用主钱包私钥，不能使用 API signer 私钥
        const masterWallet = new ethers.Wallet(config.PRIVATE_KEY);
        const masterSignature = await masterWallet.signTypedData(EIP712_DOMAIN, masterTypes, masterValue);
        console.log('masterSignature:', masterSignature);

        // ── Step 3: Send request / 发送请求 ──
        const requestParams = {
            childAddress: PARAMS.childAddress,
            name: PARAMS.name,
            nonce,
            user: config.USER_ADDRESS,
            childSignature,
            signature: masterSignature
        };
        const queryString = buildQueryString(requestParams);

        const response = await axios.post(
            `${config.BASE_URL}/fapi/v3/sub-accounts/bind`,
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
    bindSubAccount()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = bindSubAccount;
