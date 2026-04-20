/**
 * Spot V3 Utility Functions with EIP-712 Signature / 现货V3工具函数（EIP-712签名）
 *
 * Spot V3 API uses EIP-712 typed data signature authentication
 * 现货V3 API使用EIP-712类型化数据签名认证
 */

const { ethers } = require('ethers');
const config = require('./config');

/**
 * Nonce generator: seconds * 1,000,000 + per-second counter
 * 与文档 Python 示例 get_nonce() 逻辑完全一致，确保单调递增
 *
 * nonce 必须为微秒级时间戳，且不能重复、不能早于服务端最近已处理的最小值
 * 服务端校验：nonce 与系统时间偏差不得超过 ±10 秒
 */
let _lastSec = 0;
let _counter = 0;

function getNonce() {
    const nowSec = Math.floor(Date.now() / 1000);
    if (nowSec === _lastSec) {
        _counter += 1;
    } else {
        _lastSec = nowSec;
        _counter = 0;
    }
    return nowSec * 1_000_000 + _counter;
}

/**
 * Generate EIP-712 signature for Spot V3 API / 为现货V3 API生成EIP-712签名
 *
 * @param {Object} params - API parameters / API参数
 * @param {string} userAddress - Main account wallet address / 主账户钱包地址
 * @param {string} signerAddress - API wallet address / API钱包地址
 * @param {string} privateKey - API wallet private key / API钱包私钥
 * @param {Object} eip712Domain - Optional: EIP-712 domain override / 可选：覆盖EIP-712域配置
 * @returns {Object} - Signed parameters / 签名后的参数
 */
async function signParamsWeb3(params, userAddress, signerAddress, privateKey, eip712Domain = null) {
    try {
        // Step 1: Generate nonce (microseconds, monotonically increasing)
        const nonce = getNonce();

        // Step 2: Build parameters object
        const allParams = { ...params };

        for (const key in allParams) {
            if (allParams[key] !== null && allParams[key] !== undefined) {
                allParams[key] = String(allParams[key]);
            } else {
                delete allParams[key];
            }
        }

        // Add authentication parameters
        allParams.nonce = String(nonce);
        allParams.user = userAddress;
        allParams.signer = signerAddress;

        // Step 3: Build RAW query string for signing (NO URL encoding)
        const rawQueryString = buildRawQueryString(allParams);
        console.log('Step 1 - Raw Query String (for signing):', rawQueryString);

        // Step 4: Setup EIP-712 domain
        const domain = eip712Domain || config.EIP712_DOMAIN;

        // Step 5: Define EIP-712 types
        const types = {
            Message: [
                { name: 'msg', type: 'string' }
            ]
        };

        // Step 6: Define message value
        const value = { msg: rawQueryString };

        console.log('Step 2 - EIP-712 Domain:', JSON.stringify(domain));

        // Step 7: Sign with EIP-712
        const wallet = new ethers.Wallet(privateKey);
        const signature = await wallet.signTypedData(domain, types, value);

        console.log('Step 3 - EIP-712 Signature:', signature);
        console.log('');

        // Step 8: Return all parameters with signature
        return { ...allParams, signature };

    } catch (error) {
        console.error('Error generating EIP-712 signature:', error.message);
        throw error;
    }
}

/**
 * Build RAW query string (NO URL encoding) - used for signing
 */
function buildRawQueryString(params) {
    return Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${key}=${params[key]}`)
        .join('&');
}

/**
 * Build URL-encoded query string - used for HTTP requests
 */
function buildQueryString(params) {
    return Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
}

module.exports = { signParamsWeb3, buildQueryString, buildRawQueryString };
