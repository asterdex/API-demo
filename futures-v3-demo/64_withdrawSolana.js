/**
 * Withdraw [Solana][Futures][v3] / 通过fapi[v3]提现[solana][futures]
 * POST /fapi/v3/aster/user-solana-withdraw
 *
 * ⚠️ 此接口需要两套签名（userSignature 目前非必填，但强烈建议提供）：
 *   1. userSignature - Solana Ed25519 签名（使用 Solana 钱包私钥）
 *   2. signature     - API 鉴权签名（使用 API signer 私钥，EIP-712）
 *
 * ⚠️ Two signatures (userSignature is optional but strongly recommended):
 *   1. userSignature - Solana Ed25519 withdraw signature (signed by Solana wallet private key, Base58)
 *   2. signature     - API auth signature (EIP-712, signed by API signer wallet)
 *
 * 依赖 / Dependencies:
 *   npm install @solana/web3.js tweetnacl bs58
 */

const axios = require('axios');
const config = require('./config');

const WITHDRAW_PARAMS = {
    chainId: '101',                                             // Solana 固定值 / Fixed value for Solana
    asset: 'USDT',                                             // 提现币种 / Asset
    amount: '10',                                              // 提现数量（去除末尾零）/ Amount (trailing zeros stripped)
    fee: '0.5',                                                // 提现手续费（去除末尾零）/ Fee (trailing zeros stripped)
    receiver: 'BzsJhmtg2UtQWNw6764DkK5Y4GPjc1XMzRqAGqSziymK',  // Solana 收款地址 / Solana receiver address
};

async function withdrawSolana() {
    try {
        console.log('Request / 请求:', 'POST /fapi/v3/aster/user-solana-withdraw');

        const { signParamsWeb3, buildQueryString } = require('./utils');

        // userNonce: 纳秒级时间戳 / Nanosecond-level timestamp
        const userNonce = String(Date.now() * 1000);

        // ── Step 1: Generate Solana Ed25519 userSignature (optional but strongly recommended) ──
        // 生成 Solana Ed25519 提现签名（建议提供）
        let userSignature = '';
        try {
            const { Keypair } = require('@solana/web3.js');
            const nacl = require('tweetnacl');
            const bs58 = require('bs58');

            // Message format / 签名消息格式:
            // PrimaryType=Withdraw,AsterChain=Mainnet,Destination=...,DestinationChain=Solana,Token=...,Amount=...,Fee=...,Nonce=...
            const message = [
                'PrimaryType=Withdraw',
                'AsterChain=Mainnet',
                `Destination=${WITHDRAW_PARAMS.receiver}`,
                'DestinationChain=Solana',
                `Token=${WITHDRAW_PARAMS.asset}`,
                `Amount=${WITHDRAW_PARAMS.amount}`,
                `Fee=${WITHDRAW_PARAMS.fee}`,
                `Nonce=${userNonce}`
            ].join(',');

            console.log('Solana sign message / Solana 签名消息:', message);

            // ⚠️ Replace with your Solana wallet private key (Base58) / 替换为你的 Solana 钱包私钥（Base58）
            const keypair = Keypair.fromSecretKey(bs58.decode('YOUR_SOLANA_PRIVATE_KEY_BASE58'));
            const messageBytes = Buffer.from(message, 'utf8');
            const signatureBytes = nacl.sign.detached(messageBytes, keypair.secretKey);
            userSignature = bs58.encode(signatureBytes);
            console.log('Solana userSignature:', userSignature);
        } catch (e) {
            console.warn('⚠️  Solana packages not installed, skipping userSignature. Run: npm install @solana/web3.js tweetnacl bs58');
            console.warn('⚠️  未安装 Solana 依赖，跳过 userSignature。运行: npm install @solana/web3.js tweetnacl bs58');
        }

        // ── Step 2: API auth signature (EIP-712) / API 鉴权签名 ──
        const apiParams = {
            chainId: WITHDRAW_PARAMS.chainId,
            asset: WITHDRAW_PARAMS.asset,
            amount: WITHDRAW_PARAMS.amount,
            fee: WITHDRAW_PARAMS.fee,
            receiver: WITHDRAW_PARAMS.receiver,
            userNonce,
        };
        if (userSignature) apiParams.userSignature = userSignature;

        const signedParams = await signParamsWeb3(
            apiParams,
            config.USER_ADDRESS,
            config.SIGNER_ADDRESS,
            config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);

        const response = await axios.post(
            `${config.BASE_URL}/fapi/v3/aster/user-solana-withdraw`,
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
    withdrawSolana()
        .then(() => console.log('\n✓ Completed / 完成'))
        .catch(() => console.log('\n✗ Failed / 失败'));
}

module.exports = withdrawSolana;
