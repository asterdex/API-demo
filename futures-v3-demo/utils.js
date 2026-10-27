/**
 * Futures V3 Utility Functions with EIP-712 Signature / 期货V3工具函数（EIP-712签名）
 * 
 * Futures V3 API uses EIP-712 typed data signature authentication
 * 期货V3 API使用EIP-712类型化数据签名认证
 */

const { ethers } = require('ethers');
const config = require('./config');

/**
 * Nonce generator: microsecond timestamp, strictly increasing within the process
 * Nonce 生成器：微秒级时间戳，进程内严格递增
 *
 * 文档：nonce 为当前时间戳（微秒），与服务器时间偏差不得超过 ±60 秒，且不可重复
 * Docs: nonce is the current timestamp in microseconds, must be within ±60s of server time and never reused
 *
 * 使用毫秒级精度 * 1000，避免短时间内连续运行多个脚本时产生相同 nonce（Nonce used）
 * Millisecond precision * 1000, so that scripts run back-to-back do not collide (avoids "Nonce used")
 */
let _lastNonce = 0;

function getNonce() {
    let nonce = Date.now() * 1000;
    if (nonce <= _lastNonce) {
        nonce = _lastNonce + 1;
    }
    _lastNonce = nonce;
    return nonce;
}

/**
 * Generate EIP-712 signature for Futures V3 API / 为期货V3 API生成EIP-712签名
 * 
 * @param {Object} params - API parameters / API参数
 * @param {string} userAddress - Main account wallet address / 主账户钱包地址
 * @param {string} signerAddress - API wallet address / API钱包地址
 * @param {string} privateKey - API wallet private key / API钱包私钥
 * @param {Object} eip712Domain - Optional: EIP-712 domain override (defaults to config.EIP712_DOMAIN) / 可选：覆盖EIP-712域配置（默认使用config.EIP712_DOMAIN）
 * @param {string|number} nonceOverride - Optional: use a fixed nonce instead of generating one / 可选：使用指定nonce而不是自动生成
 * @returns {Object} - Signed parameters / 签名后的参数
 */
async function signParamsWeb3(params, userAddress, signerAddress, privateKey, eip712Domain = null, nonceOverride = null) {
    try {
        // Step 1: Generate nonce (microseconds, monotonically increasing) / 生成nonce（微秒，单调递增）
        // nonceOverride: used by guarded cancel endpoints, which must reuse the nonce of the original order
        // nonceOverride：guarded 撤单接口需要复用下单时的 nonce
        const nonce = nonceOverride !== null ? nonceOverride : getNonce();
        
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
        
        // Step 3: Build the URL-ENCODED query string for signing / 构建 URL 编码后的查询字符串用于签名
        // The server verifies the signature over the URL-encoded string (docs: urllib.parse.urlencode(params)),
        // so params containing special characters (batchOrders, orderIdList, JSON values ...) must be signed encoded.
        // For plain params (letters/digits/.-_) the encoded and raw strings are identical.
        // 服务端对 URL 编码后的字符串验签（文档：urllib.parse.urlencode(params)），
        // 因此含特殊字符的参数（batchOrders、orderIdList、JSON 值等）必须按编码后的字符串签名。
        // 普通参数（字母/数字/.-_）编码前后一致。
        const rawQueryString = buildQueryString(allParams);
        
        console.log('Step 1 - Query String (for signing) / 查询字符串（用于签名）:', rawQueryString);
        
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
            // Match Python's urllib.parse.quote_plus: also encode ! ' ( ) * (encodeURIComponent leaves them as-is)
            // 与 Python quote_plus 保持一致：额外编码 ! ' ( ) *（encodeURIComponent 默认不编码）
            const encoded = encodeURIComponent(value)
                .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
            return `${key}=${encoded}`;
        })
        .join('&');
}


/**
 * Build a valid, non-filling resting BUY limit order for a symbol / 为交易对构造一个合法且不会成交的限价买单
 * price = markPrice * 0.99 (within PERCENT_PRICE filter, rounded to tickSize), quantity satisfies MIN_NOTIONAL & stepSize
 * 价格 = 标记价 * 0.99（满足 PERCENT_PRICE，按 tickSize 取整），数量满足 MIN_NOTIONAL 与 stepSize
 */
async function buildRestingBuyOrder(symbol) {
    const axios = require('axios');
    const [info, mark] = await Promise.all([
        axios.get(`${config.BASE_URL}/fapi/v3/exchangeInfo`),
        axios.get(`${config.BASE_URL}/fapi/v3/premiumIndex`, { params: { symbol } })
    ]);
    const sym = info.data.symbols.find(x => x.symbol === symbol);
    const f = type => sym.filters.find(x => x.filterType === type) || {};
    const tick = Number(f('PRICE_FILTER').tickSize);
    const step = Number(f('LOT_SIZE').stepSize);
    const minQty = Number(f('LOT_SIZE').minQty);
    const minNotional = Number(f('MIN_NOTIONAL').notional || 5);
    const markPrice = Number(Array.isArray(mark.data) ? mark.data[0].markPrice : mark.data.markPrice);

    const decimals = n => (String(n).split('.')[1] || '').length;
    const price = Math.floor((markPrice * 0.99) / tick) * tick;
    let qty = Math.max(minQty, Math.ceil((minNotional * 1.2 / price) / step) * step);
    return {
        symbol,
        side: 'BUY',
        type: 'LIMIT',
        timeInForce: 'GTC',
        quantity: qty.toFixed(decimals(step)),
        price: price.toFixed(decimals(tick))
    };
}

module.exports = {
    signParamsWeb3,
    buildQueryString,
    buildRawQueryString,
    getNonce,
    buildRestingBuyOrder
};
