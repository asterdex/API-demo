/**
 * Place Order / 下单
 * POST /api/v1/order
 * 
 * Send in a new order
 * 创建新订单
 * 
 * Weight: 1
 * Security: TRADE
 */

const axios = require('axios');
const config = require('./config');
const { signParams, buildQueryString } = require('./utils');

/**
 * Parameters / 参数
 */
const params = {
    symbol: 'ASTERUSDT',          // Trading pair / 交易对 (required / 必需)
    side: 'BUY',                // Order side / 订单方向 (required / 必需): BUY or SELL
    type: 'MARKET',              // Order type / 订单类型 (required / 必需): LIMIT, MARKET, STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, TAKE_PROFIT_LIMIT
    quantity: '10',            // Order quantity / 订单数量 (required / 必需)
    // price: '300',               // Order price / 订单价格 (required for LIMIT orders / LIMIT订单必需)
    // timeInForce: 'GTC',         // Time in force / 有效方式: GTC, IOC, FOK (required for LIMIT orders / LIMIT订单必需)
    // newClientOrderId: 'my_order_123',  // Custom order ID / 自定义订单ID (optional / 可选)
    // stopPrice: '305',        // Stop price / 触发价格 (required for STOP orders / STOP订单必需)
    // icebergQty: '0.05',      // Iceberg quantity / 冰山订单数量 (optional / 可选)
};

/**
 * Place an order / 下单
 */
async function placeOrder() {
    try {
        console.log('Placing order... / 下单中...\n');
        console.log('Parameters / 参数:', params);
        console.log('');
        
        // Sign the parameters / 签名参数
        const signedParams = signParams(params, config.SECRET_KEY, config.RECV_WINDOW);
        const queryString = buildQueryString(signedParams);
        
        const response = await axios.post(
            `${config.BASE_URL}/api/v1/order?${queryString}`,
            {},
            {
                headers: {
                    'X-MBX-APIKEY': config.API_KEY,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        // Output raw response data / 输出原始响应数据
        console.log(JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error('Error / 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Execute / 执行
if (require.main === module) {
    placeOrder()
        .then(() => console.log('\n✓ Request completed / 请求完成'))
        .catch(() => console.log('\n✗ Request failed / 请求失败'));
}

module.exports = placeOrder;
