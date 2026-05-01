/**
 * Sub-Account Transfer / 子账户划转
 * POST /fapi/v3/subAccountTransfer
 *
 * ⚠️ signature 必须使用 user 字段对应的账户主钱包私钥签名，不能使用 API signer 私钥
 * ⚠️ signature must be signed with the `user` account's WALLET private key (not the signer key)
 *
 * kindType 取值 / kindType values:
 *   FUTURE_FUTURE - 合约→合约 / Perpetual→Perpetual
 *   FUTURE_SPOT   - 合约→现货 / Perpetual→Spot
 *   SPOT_FUTURE   - 现货→合约 / Spot→Perpetual
 *   SPOT_SPOT     - 现货→现货 / Spot→Spot
 *
 * 场景说明 / Transfer scenarios:
 *   主→子: user=主账户, fromAccountAddress 不填    / Master→Sub: user=master, omit fromAccountAddress
 *   子→主: user=子账户, 使用子账户私钥签名         / Sub→Master: user=sub, sign with sub account key
 *   子→子: user=主账户, fromAccountAddress=子账户A  / Sub→Sub: user=master, fromAccountAddress=sub-A
 */

const axios = require('axios');
const { ethers } = require('ethers');
const config = require('./config');

const TRANSFER_PARAMS = {
    toAccountAddress: '0xDestinationAddress',   // 目标账户地址 / Destination address
    asset: 'USDT',                               // 划转资产 / Asset
    amount: '10',                                // 划转数量 / Amount
    kindType: 'FUTURE_FUTURE',                   // 划转类型 / Transfer type (see above)
    // fromAccountAddress: '0xSubAccountA',     // 子→子场景需要填写 / Required for Sub→Sub
};

const EIP712_DOMAIN = config.EIP712_DOMAIN;

async function subAccountTransfer() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/subAccountTransfer');

        const { getNonce, buildQueryString } = require('./utils');
        const nonce = String(getNonce());

        // ── Step 1: Build message body / 构造签名消息体 ──
        let msgParts = [
            `toAccountAddress=${TRANSFER_PARAMS.toAccountAddress}`,
            `asset=${TRANSFER_PARAMS.asset}`,
            `amount=${TRANSFER_PARAMS.amount}`,
            `kindType=${TRANSFER_PARAMS.kindType}`,
            `nonce=${nonce}`,
            `user=${config.USER_ADDRESS}`,
            `signer=${config.SIGNER_ADDRESS}`
        ];
        if (TRANSFER_PARAMS.fromAccountAddress) {
            msgParts.push(`fromAccountAddress=${TRANSFER_PARAMS.fromAccountAddress}`);
        }
        const msgBody = msgParts.join('&');

        const types = { Message: [{ name: 'msg', type: 'string' }] };
        const value = { msg: msgBody };

        // ⚠️ Must use MASTER (or initiating account) wallet private key, NOT the API signer key
        // ⚠️ 使用主账户（或发起划转的账户）的主钱包私钥签名，不是 API signer 私钥
        const masterWallet = new ethers.Wallet(config.PRIVATE_KEY);
        const signature = await masterWallet.signTypedData(EIP712_DOMAIN, types, value);
        console.log('signature:', signature);

        // ── Step 2: Send request / 发送请求 ──
        const requestParams = {
            toAccountAddress: TRANSFER_PARAMS.toAccountAddress,
            asset: TRANSFER_PARAMS.asset,
            amount: TRANSFER_PARAMS.amount,
            kindType: TRANSFER_PARAMS.kindType,
            nonce,
            user: config.USER_ADDRESS,
            signer: config.SIGNER_ADDRESS,
            signature
        };
        if (TRANSFER_PARAMS.fromAccountAddress) {
            requestParams.fromAccountAddress = TRANSFER_PARAMS.fromAccountAddress;
        }

        const queryString = buildQueryString(requestParams);
        const response = await axios.post(
            `${config.BASE_URL}/fapi/v3/subAccountTransfer`,
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
    subAccountTransfer()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = subAccountTransfer;
