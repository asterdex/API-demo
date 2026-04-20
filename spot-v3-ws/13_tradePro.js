/**
 * TradePro Stream / 专业成交流 (Spot V3 专有)
 * Stream: <symbol>@tradepro
 *
 * V3-exclusive stream that pushes trade details including on-chain transaction hash
 * and participant wallet addresses (taker + maker).
 *
 * V3 专有流，推送成交详情，包含链上交易哈希和参与方钱包地址（吃单方 + 挂单方）。
 *
 * Payload fields / 载荷字段:
 *   e  - Event type ("tradepro")
 *   E  - Event time (ms)
 *   T  - Transaction time (ms)
 *   s  - Symbol
 *   t  - Trade ID
 *   p  - Price
 *   q  - Quantity
 *   h  - On-chain transaction hash / 链上交易哈希
 *   m  - [takerAddress, makerAddress] / [吃单方地址, 挂单方地址]
 */

const WebSocket = require('ws');

/**
 * Configuration / 配置
 */
const config = {
    baseUrl: 'wss://sstream.asterdex.com',     // Base URL (without /ws) for subscribe mode / 基础URL（订阅模式不含 /ws）
    symbol: 'btcusdt',                          // Trading pair (lowercase) / 交易对（小写）
};

/**
 * Connect to tradepro stream via subscribe method
 * 通过订阅方式连接专业成交流
 */
function connectTradeProStream() {
    const streamName = `${config.symbol}@tradepro`;
    const streamUrl = `${config.baseUrl}/stream?streams=${streamName}`;

    console.log('Connecting to TradePro Stream (V3)... / 连接专业成交流（V3）中...\n');
    console.log(`URL: ${streamUrl}\n`);
    console.log('ℹ️  This stream is Spot V3 exclusive / 此流为 Spot V3 专有\n');

    const ws = new WebSocket(streamUrl);

    ws.on('open', () => {
        console.log('✓ Connected to TradePro Stream! / 已连接到专业成交流！\n');
        console.log('Listening for tradepro updates... / 监听专业成交数据中...\n');
        console.log('Data includes tx hash & wallet addresses / 数据包含链上哈希和钱包地址\n');
    });

    ws.on('message', (data) => {
        // Output raw data / 输出原始数据
        console.log(data.toString());
    });

    ws.on('error', (error) => {
        console.error('WebSocket Error / WebSocket错误:', error.message);
    });

    ws.on('close', () => {
        console.log('Connection closed / 连接已关闭');
    });

    // Handle Ctrl+C gracefully / 优雅处理Ctrl+C
    process.on('SIGINT', () => {
        console.log('\nClosing connection... / 关闭连接中...');
        ws.close();
        process.exit(0);
    });
}

// Execute / 执行
if (require.main === module) {
    connectTradeProStream();
}

module.exports = connectTradeProStream;
