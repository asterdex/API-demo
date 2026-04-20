/**
 * Spot Withdraw / 现货提现 (USER_DATA)
 * POST /api/v3/aster/user-withdraw
 *
 * ⚠️ 此接口需要两套独立签名：
 *   1. userSignature - 提现专用 EIP712 签名（Domain name="Aster"，用用户主钱包私钥签名）
 *   2. signature     - API 鉴权签名（Domain name="AsterSignTransaction"，用 signer 私钥签名）
 *
 * chainId: 1 (ETH), 56 (BSC), 42161 (Arbitrum)
 * receiver: 必须是账户注册地址
 */

const axios = require('axios');
const { ethers } = require('ethers');
const config = require('./config');

const WITHDRAW_PARAMS = {
    chainId: 56,
    asset: 'USDT',
    amount: '10',
    fee: '0.5',                              // 通过 23_estimateWithdrawFee.js 获取
    receiver: '0xYourReceiverAddress'        // 账户注册地址
};

const CHAIN_NAME_MAP = { 1: 'ETH', 56: 'BSC', 42161: 'Arbitrum' };

async function withdraw() {
    try {
        console.log('Request / 请求:', 'POST /api/v3/aster/user-withdraw');

        // Step 1: 生成提现签名 nonce（毫秒 * 1000）
        const userNonce = BigInt(Date.now()) * 1000n;

        // Step 2: 提现专用 EIP712 签名（Domain name="Aster"）
        const withdrawDomain = {
            name: 'Aster',
            version: '1',
            chainId: WITHDRAW_PARAMS.chainId,
            verifyingContract: ethers.ZeroAddress
        };
        const withdrawTypes = {
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
        const withdrawValue = {
            'type': 'Withdraw',
            'destination': WITHDRAW_PARAMS.receiver,
            'destination Chain': CHAIN_NAME_MAP[WITHDRAW_PARAMS.chainId] || String(WITHDRAW_PARAMS.chainId),
            'token': WITHDRAW_PARAMS.asset,
            'amount': WITHDRAW_PARAMS.amount,
            'fee': WITHDRAW_PARAMS.fee,
            'nonce': userNonce,
            'aster chain': 'Mainnet'
        };

        // ⚠️ 使用用户主钱包私钥签名，非 API signer 私钥
        // ⚠️ Use USER's main wallet private key, NOT the API signer key
        const userWallet = new ethers.Wallet(config.PRIVATE_KEY);
        const userSignature = await userWallet.signTypedData(withdrawDomain, withdrawTypes, withdrawValue);
        console.log('Withdrawal Signature:', userSignature);

        // Step 3: API 鉴权签名
        const apiParams = {
            chainId: String(WITHDRAW_PARAMS.chainId),
            asset: WITHDRAW_PARAMS.asset,
            amount: WITHDRAW_PARAMS.amount,
            fee: WITHDRAW_PARAMS.fee,
            receiver: WITHDRAW_PARAMS.receiver,
            nonce: userNonce.toString(),
            userSignature
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
            `${config.BASE_URL}/api/v3/aster/user-withdraw`,
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
    withdraw()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = withdraw;
