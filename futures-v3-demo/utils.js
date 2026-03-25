/**
 * Futures V3 Utility Functions with EIP-712 Signature / 期货V3工具函数（EIP-712签名）
 * 
 * Futures V3 API uses EIP-712 typed data signature authentication
 * 期货V3 API使用EIP-712类型化数据签名认证
 */

const { ethers } = require('ethers');
const config = require('./config');

/**
 * Nonce generator: seconds * 1,000,000 + per-second counter
 * 与文档 Python 示例 get_nonce() 逻辑完全一致，确保单调递增
 * 
 * nonce 必须为微秒级时间戳，且不能重复、不能早于服务端最近已处理的最小值
 * 服务端校验：nonce 与系统时间偏差不得超过 ±5 秒
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
 * Generate EIP-712 signature for Futures V3 API / 为期货V3 API生成EIP-712签名
 * 
 * @param {Object} params - API parameters / API参数
 * @param {string} userAddress - Main account wallet address / 主账户钱包地址
 * @param {string} signerAddress - API wallet address / API钱包地址
 * @param {string} privateKey - API wallet private key / API钱包私钥
 * @param {Object} eip712Domain - Optional: EIP-712 domain override (defaults to config.EIP712_DOMAIN) / 可选：覆盖EIP-712域配置（默认使用config.EIP712_DOMAIN）
 * @returns {Object} - Signed parameters / 签名后的参数
 */
async function signParamsWeb3(params, userAddress, signerAddress, privateKey, eip712Domain = null) {
    try {
        // Step 1: Generate nonce (microseconds, monotonically increasing) / 生成nonce（微秒，单调递增）
        const nonce = getNonce();
        
        // Step 2: Build parameters object / 构建参数对象
        const allParams = {
            ...params
        };
        
        // Convert all values to strings / 将所有值转为字符串
        for (const key in allParams) {
            if (allParams[key] !== null && allParams[key] !== undefined) {
                allParams[key] = String(allParams[key]);
            } else {
                delete allParams[key];
            }
        }
        
        // Add authentication parameters / 添加认证参数
        allParams.nonce = String(nonce);
        allParams.user = userAddress;
        allParams.signer = signerAddress;
        
        // Step 3: Build RAW query string for signing (NO URL encoding!) / 构建原始查询字符串用于签名（不进行URL编码！）
        const rawQueryString = buildRawQueryString(allParams);
        
        console.log('Step 1 - Raw Query String (for signing) / 原始查询字符串（用于签名）:', rawQueryString);
        
        // Step 4: Setup EIP-712 domain (use config or parameter) / 设置EIP-712域（使用配置或参数）
        const domain = eip712Domain || config.EIP712_DOMAIN;
        
        // Step 5: Define EIP-712 types / 定义EIP-712类型
        const types = {
            Message: [
                { name: 'msg', type: 'string' }
            ]
        };
        
        // Step 6: Define message value (use RAW string, matching Python demo) / 定义消息值（使用原始字符串，匹配Python demo）
        const value = {
            msg: rawQueryString
        };
        
        console.log('Step 2 - EIP-712 Domain / EIP-712域:', JSON.stringify(domain));
        
        // Step 7: Sign with EIP-712 / 使用EIP-712签名
        const wallet = new ethers.Wallet(privateKey);
        const signature = await wallet.signTypedData(domain, types, value);
        
        console.log('Step 3 - EIP-712 Signature / EIP-712签名:', signature);
        console.log('');
        
        // Step 8: Return all parameters with signature / 返回包含签名的所有参数
        return {
            ...allParams,
            signature: signature
        };
        
    } catch (error) {
        console.error('Error generating EIP-712 signature / 生成EIP-712签名错误:', error.message);
        throw error;
    }
}

/**
 * Build RAW query string from parameters (NO URL encoding) / 从参数构建原始查询字符串（不进行URL编码）
 * Used for EIP-712 signature - must match Python's get_url() behavior
 * 用于EIP-712签名 - 必须匹配Python的get_url()行为
 */
function buildRawQueryString(params) {
    return Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${key}=${params[key]}`)
        .join('&');
}

/**
 * Build URL-encoded query string from parameters / 从参数构建URL编码的查询字符串
 * Used for actual HTTP request / 用于实际的HTTP请求
 */
function buildQueryString(params) {
    return Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => {
            const value = params[key];
            // For batchOrders, manually encode single quotes as %27
            // 对于 batchOrders，手动将单引号编码为 %27
            if (key === 'batchOrders') {
                return `${key}=${encodeURIComponent(value).replace(/'/g, '%27')}`;
            }
            return `${key}=${encodeURIComponent(value)}`;
        })
        .join('&');
}

module.exports = {
    signParamsWeb3,
    buildQueryString,
    buildRawQueryString
};
