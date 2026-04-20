/**
 * Individual Symbol Book Ticker Stream / 单一交易对最优挂单流
 * Stream: <symbol>@bookTicker
 *
 * Pushes any update to the best bid or ask's price or quantity in real-time
 * 实时推送最优买卖挂单的价格或数量更新
 */

const WebSocket = require('ws');

/**
 * Configuration / 配置
 */
const config = {
    baseUrl: 'wss://sstream.asterdex.com/ws',  // Base WebSocket URL / WebSocket基础URL
    symbol: 'btcusdt',                          // Trading pair (lowercase) / 交易对（小写）
};

/**
 * Connect to book ticker stream / 连接最优挂单流
 */
function connectBookTickerStream() {
    const streamUrl = `${config.baseUrl}/${config.symbol}@bookTicker`;

    console.log('Connecting to Book Ticker Stream... / 连接最优挂单流中...\n');
    console.log(`URL: ${streamUrl}\n`);

    const ws = new WebSocket(streamUrl);

    ws.on('open', () => {
        console.log('✓ Connected to Book Ticker Stream! / 已连接到最优挂单流！\n');
        console.log('Listening for book ticker updates... / 监听最优挂单更新中...\n');
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
    connectBookTickerStream();
}

module.exports = connectBookTickerStream;
