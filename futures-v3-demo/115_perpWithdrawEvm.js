/**
 * User Withdraw [EVM][Perp] / 通过 Aster Chain 提现 [EVM][合约]
 * POST /aster-chain/v3/perp/user-withdraw
 * Base URL: https://chainapi.asterdex.com
 *
 * 从合约账户提现到链上地址。
 * Submit a withdrawal request from the Perp account to an on-chain address.
 *
 * ⚠️ 此接口需要两套独立签名：
 *   1. userSignature - 提现专用 EIP712 签名（Domain name="Aster"，使用用户主钱包私钥）
 *   2. signature     - API 鉴权签名（Domain name="AsterSignTransaction"，user + nonce，使用主钱包私钥）
 * ⚠️ This endpoint requires two independent signatures:
 *   1. userSignature - Withdrawal EIP712 signature (Domain name="Aster", signed by the USER's main wallet)
 *   2. signature     - API auth signature (Domain name="AsterSignTransaction", user + nonce, signed by the main wallet)
 *
 * signatureType: "EOA"（默认）或 "SafeWallet"（Safe 钱包，多签用逗号分隔）
 *                "EOA" (default) or "SafeWallet" (Safe wallet; multiple signatures separated by commas)
 *
 * Security: WITHDRAW (weight 5)
 */

const axios = require('axios');
const { ethers } = require('ethers');
const config = require('./config');
const { buildQueryString, getNonce } = require('./utils');

const CHAIN_API_URL = 'https://chainapi.asterdex.com';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 提现参数配置 / Withdrawal parameters
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const WITHDRAW_PARAMS = {
    chainId:  56,                                  // 链ID / Chain ID: 1(ETH), 56(BSC), 42161(Arbitrum)
    asset:    'USDT',                              // 提现币种 / Asset
    amount:   '1',                                 // 提现数量 / Amount
    fee:      '0.5',                               // 手续费（见 123_chainEstimateFee.js）/ Fee (see 123_chainEstimateFee.js)
    receiver: config.MASTER_WALLET_ADDRESS,        // 收款地址（需为用户注册地址）/ Receiver (must be a registered address)
};

// chainId → chainName 映射 / chainId to chainName mapping
const CHAIN_NAME_MAP = { 1: 'ETH', 56: 'BSC', 42161: 'Arbitrum' };

// 提现签名专用 EIP712 Domain（name="Aster"）/ Withdrawal EIP712 domain (name="Aster")
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

async function perpWithdrawEvm() {
    try {
        console.log('Request / 请求:', 'POST /aster-chain/v3/perp/user-withdraw');

        // Step 1: 提现签名 nonce（毫秒时间戳 * 1000）/ Withdrawal nonce (ms timestamp * 1000)
        const userNonce = BigInt(Date.now()) * 1000n;

        // Step 2: 使用主钱包私钥签名提现消息 / Sign the withdrawal message with the MAIN wallet key
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
        const userWallet = new ethers.Wallet(config.MASTER_WALLET_PRIVATE_KEY);
        const userSignature = await userWallet.signTypedData(WITHDRAW_DOMAIN, WITHDRAW_TYPES, withdrawValue);
        console.log('Withdrawal EIP712 Signature / 提现签名:', userSignature);

        // Step 3: 构造 API 参数并用主钱包签名 / Build API params and sign with the main wallet
        const apiParams = {
            chainId:       String(WITHDRAW_PARAMS.chainId),
            asset:         WITHDRAW_PARAMS.asset,
            amount:        WITHDRAW_PARAMS.amount,
            fee:           WITHDRAW_PARAMS.fee,
            receiver:      WITHDRAW_PARAMS.receiver,
            userNonce:     userNonce.toString(),
            signatureType: 'EOA',
            userSignature: userSignature
        };
        // API 鉴权：WITHDRAW 类型使用 user + nonce + signature，由主钱包私钥签名（线上实测 API signer 无提现权限，返回 -2015）
        // API auth: WITHDRAW endpoints use user + nonce + signature signed by the MAIN wallet
        // (live server rejects the API signer for withdrawals with -2015)
        const unsigned = { ...apiParams, nonce: String(getNonce()), user: config.MASTER_WALLET_ADDRESS };
        const authSignature = await new ethers.Wallet(config.MASTER_WALLET_PRIVATE_KEY).signTypedData(
            config.EIP712_DOMAIN,
            { Message: [{ name: 'msg', type: 'string' }] },
            { msg: buildQueryString(unsigned) }
        );
        const signedParams = { ...unsigned, signature: authSignature };

        const response = await axios.post(
            `${CHAIN_API_URL}/aster-chain/v3/perp/user-withdraw`,
            buildQueryString(signedParams),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

if (require.main === module) {
    perpWithdrawEvm()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = perpWithdrawEvm;
