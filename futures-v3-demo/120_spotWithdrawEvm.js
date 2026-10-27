/**
 * User Withdraw [EVM][Spot] / 通过 Aster Chain 提现 [EVM][现货]
 * POST /aster-chain/v3/spot/user-withdraw
 * Base URL: https://chainapi.asterdex.com
 *
 * 从现货账户提现到链上地址。
 * Submit a withdrawal request from the Spot account to an on-chain address.
 *
 * ⚠️ 此接口需要两套独立签名：
 *   1. userSignature - 提现专用 EIP712 签名（Domain name="Aster"，使用用户主钱包私钥）
 *   2. signature     - API 鉴权签名（Domain name="AsterSignTransaction"，使用 API signer 私钥）
 * ⚠️ This endpoint requires two independent signatures:
 *   1. userSignature - Withdrawal EIP712 signature (Domain name="Aster", signed by the USER's main wallet)
 *   2. signature     - API auth signature (Domain name="AsterSignTransaction", signed by the API signer)
 *
 * signatureType: "EOA"（默认）或 "SafeWallet"（Safe 钱包，多签用逗号分隔）
 *                "EOA" (default) or "SafeWallet" (Safe wallet; multiple signatures separated by commas)
 *
 * Security: WITHDRAW (weight 5)
 */

const axios = require('axios');
const { ethers } = require('ethers');
const config = require('./config');
const { signParamsWeb3, buildQueryString } = require('./utils');

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
    // signatureChainId: 56,                    // 可选：签名所用链ID（EIP-712 domain 的 chainId），默认等于 chainId / optional: chain ID used for signing, defaults to chainId
};

// chainId → chainName 映射 / chainId to chainName mapping
const CHAIN_NAME_MAP = { 1: 'ETH', 56: 'BSC', 42161: 'Arbitrum' };

// 提现签名专用 EIP712 Domain（name="Aster"）/ Withdrawal EIP712 domain (name="Aster")
const WITHDRAW_DOMAIN = {
    name: 'Aster',
    version: '1',
    chainId: WITHDRAW_PARAMS.signatureChainId || WITHDRAW_PARAMS.chainId,
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

async function spotWithdrawEvm() {
    try {
        console.log('Request / 请求:', 'POST /aster-chain/v3/spot/user-withdraw');

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

        // Step 3: 构造 API 参数并用 API signer 签名 / Build API params and sign with the API signer
        const apiParams = {
            chainId:       String(WITHDRAW_PARAMS.chainId),
            ...(WITHDRAW_PARAMS.signatureChainId ? { signatureChainId: String(WITHDRAW_PARAMS.signatureChainId) } : {}),
            asset:         WITHDRAW_PARAMS.asset,
            amount:        WITHDRAW_PARAMS.amount,
            fee:           WITHDRAW_PARAMS.fee,
            receiver:      WITHDRAW_PARAMS.receiver,
            userNonce:     userNonce.toString(),
            signatureType: 'EOA',
            userSignature: userSignature
        };
        // API 鉴权：现货提现接口线上实测要求 signer（API signer 签名），需要该 agent 拥有提现权限（canWithdraw），否则返回 -2015
        // API auth: the live SPOT withdraw endpoints require `signer` (API signer signature);
        // the agent must have the withdraw permission (canWithdraw), otherwise -2015 is returned
        // （合约提现接口 115/116 则使用 user + 主钱包签名 / PERP withdraw endpoints 115/116 use user + main-wallet signature）
        const signedParams = await signParamsWeb3(
            apiParams,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );

        const response = await axios.post(
            `${CHAIN_API_URL}/aster-chain/v3/spot/user-withdraw`,
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
    spotWithdrawEvm()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = spotWithdrawEvm;
