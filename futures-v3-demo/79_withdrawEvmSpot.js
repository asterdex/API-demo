/**
 * Withdraw [EVM][Spot][v3] / 通过fapi[v3]提现[evm][spot]
 * POST /api/v3/aster/user-withdraw
 *
 * ⚠️ 此接口需要两套独立签名：
 *   1. userSignature - 提现专用 EIP712 签名（Domain name="Aster"，使用用户主钱包私钥）
 *   2. signature     - API 鉴权签名（Domain name="AsterSignTransaction"，使用 API signer 私钥）
 *
 * ⚠️ This endpoint requires two independent signatures:
 *   1. userSignature - Withdrawal EIP712 signature (Domain name="Aster", signed by USER's main wallet)
 *   2. signature     - API auth signature (Domain name="AsterSignTransaction", signed by API signer wallet)
 *
 * 与 58_withdrawEvm.js (futures) 的区别：
 *   - Base URL 不同：sapi.asterdex.com（现货）vs fapi.asterdex.com（合约）
 *   - Endpoint 不同：/api/v3/aster/user-withdraw vs /fapi/v3/aster/user-withdraw
 *
 * Difference from 58_withdrawEvm.js (futures):
 *   - Different base URL: sapi.asterdex.com (spot) vs fapi.asterdex.com (futures)
 *   - Different endpoint path: /api/v3/aster/user-withdraw vs /fapi/v3/aster/user-withdraw
 */

const axios   = require('axios');
const { ethers } = require('ethers');
const config  = require('./config');

const SAPI_BASE_URL = 'https://sapi.asterdex.com';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 提现参数配置 / Withdrawal parameters
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const WITHDRAW_PARAMS = {
    chainId:  56,                           // 链ID / Chain ID: 1(ETH), 56(BSC), 42161(Arbitrum)
    asset:    'USDT',                       // 提现币种 / Asset name
    amount:   '10',                         // 提现数量（代币单位）/ Amount in token units
    fee:      '0.5',                        // 提现手续费（由 78_estimateWithdrawFee.js 获取）
                                            // Withdrawal fee (obtained from 78_estimateWithdrawFee.js)
    receiver: '0xYourReceiverAddress',      // 收款地址（需与账户注册地址一致）/ Receiver address
};

// chainId → chainName 映射 / chainId to chainName mapping
const CHAIN_NAME_MAP = { 1: 'ETH', 56: 'BSC', 42161: 'Arbitrum' };

// 提现签名专用 EIP712 Domain（name="Aster"，与API鉴权不同）
// Withdrawal EIP712 Domain (name="Aster", different from API auth domain)
const WITHDRAW_DOMAIN = {
    name: 'Aster',
    version: '1',
    chainId: WITHDRAW_PARAMS.chainId,
    verifyingContract: ethers.ZeroAddress
};

const WITHDRAW_TYPES = {
    Action: [
        { name: 'type',              type: 'string'  },
        { name: 'destination',       type: 'address' },
        { name: 'destination Chain', type: 'string'  },
        { name: 'token',             type: 'string'  },
        { name: 'amount',            type: 'string'  },
        { name: 'fee',               type: 'string'  },
        { name: 'nonce',             type: 'uint256' },
        { name: 'aster chain',       type: 'string'  }
    ]
};

async function withdrawEvmSpot() {
    try {
        console.log('Request / 请求:', 'POST /api/v3/aster/user-withdraw  [Spot / 现货]');

        // Step 1: 生成提现签名的 nonce（毫秒时间戳 * 1000）
        // Step 1: Generate withdrawal nonce (ms timestamp * 1000)
        const userNonce = BigInt(Date.now()) * 1000n;

        // Step 2: 构造提现签名消息并签名（使用用户主钱包私钥）
        // Step 2: Sign withdrawal message with USER's main wallet private key
        const withdrawValue = {
            'type':              'Withdraw',
            'destination':       WITHDRAW_PARAMS.receiver,
            'destination Chain': CHAIN_NAME_MAP[WITHDRAW_PARAMS.chainId] || String(WITHDRAW_PARAMS.chainId),
            'token':             WITHDRAW_PARAMS.asset,
            'amount':            WITHDRAW_PARAMS.amount,
            'fee':               WITHDRAW_PARAMS.fee,
            'nonce':             userNonce,
            'aster chain':       'Mainnet'
        };

        // ⚠️ 此处需要用户主钱包私钥（非 API signer 私钥）
        // ⚠️ Use USER's MAIN wallet private key here (NOT the API signer key)
        const userWallet = new ethers.Wallet(config.PRIVATE_KEY);  // 替换为主钱包私钥 / Replace with main wallet private key
        const userSignature = await userWallet.signTypedData(WITHDRAW_DOMAIN, WITHDRAW_TYPES, withdrawValue);

        console.log('Withdrawal EIP712 Signature / 提现签名:', userSignature);

        // Step 3: 构造 API 鉴权请求参数并签名
        // Step 3: Build API auth params and sign
        const apiParams = {
            chainId:       String(WITHDRAW_PARAMS.chainId),
            asset:         WITHDRAW_PARAMS.asset,
            amount:        WITHDRAW_PARAMS.amount,
            fee:           WITHDRAW_PARAMS.fee,
            receiver:      WITHDRAW_PARAMS.receiver,
            userNonce:     userNonce.toString(),
            userSignature: userSignature
        };

        const { signParamsWeb3, buildQueryString } = require('./utils');
        const signedParams = await signParamsWeb3(
            apiParams,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);

        const response = await axios.post(
            `${SAPI_BASE_URL}/api/v3/aster/user-withdraw`,
            queryString,
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    withdrawEvmSpot()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = withdrawEvmSpot;
