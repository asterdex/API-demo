/**
 * Create Staking / 创建质押
 * POST /aster-chain/v3/staking/create
 * Base URL: https://chainapi.asterdex.com
 *
 * ⚠️ 质押后资产将被锁定，请谨慎使用真实验证者地址 / staked assets are LOCKED, be careful when using a real validator address
 *
 * ⚠️ signature 必须使用 user 账户的主钱包私钥签名（config.MASTER_WALLET_PRIVATE_KEY），不是 API signer 私钥
 * ⚠️ signature must be signed with the `user` account's MASTER wallet private key, NOT the API signer key
 * 待签名消息 / Message to sign: URL-encoded query string of all params (without signature)
 *
 * Security: TRADE (weight 5)
 */

const axios = require('axios');
const { ethers } = require('ethers');
const config = require('./config');
const { buildQueryString, getNonce } = require('./utils');

const CHAIN_API_URL = 'https://chainapi.asterdex.com';

// 业务参数 / Business params
const params = {
    "validatorAddress": "0x0000000000000000000000000000000000000001",  // ⚠️ 替换为真实验证者地址 / replace with a REAL validator address
    "stakeAmount": "1",
    "periodCode": "26_WEEKS"   // 26_WEEKS / 52_WEEKS / 104_WEEKS / 156_WEEKS / 208_WEEKS
};

async function stakingCreate() {
    try {
        console.log('Request / 请求:', 'POST /aster-chain/v3/staking/create');
        console.log('Parameters / 参数:', params);

        const user  = config.MASTER_WALLET_ADDRESS;
        const nonce = String(getNonce());

        // ── Step 1: 构造待签名消息（URL 编码后的查询字符串）/ Build message to sign (URL-encoded) ──
        const unsigned = { ...params, nonce, user };
        const msgBody  = buildQueryString(unsigned);
        console.log('Step 1 - Message body (for signing) / 待签名消息体:', msgBody);

        // ── Step 2: EIP-712 签名（主钱包私钥）/ EIP-712 sign with the MASTER wallet key ──
        const types  = { Message: [{ name: 'msg', type: 'string' }] };
        const wallet = new ethers.Wallet(config.MASTER_WALLET_PRIVATE_KEY);
        const signature = await wallet.signTypedData(config.EIP712_DOMAIN, types, { msg: msgBody });
        console.log('Step 2 - EIP-712 Signature / EIP-712签名:', signature);

        // ── Step 3: 发送请求 / Send request ──
        const response = await axios.post(
            `${CHAIN_API_URL}/aster-chain/v3/staking/create`,
            buildQueryString({ ...unsigned, signature }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        // Output raw response data / 输出原始响应数据
        console.log('\nResponse / 响应:');
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    stakingCreate()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = stakingCreate;
