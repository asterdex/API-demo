/**
 * Individual Symbol Mini Ticker Stream / 单一交易对简易Ticker流
 * Stream: <symbol>@miniTicker
 *
 * 24hr rolling window mini-ticker statistics for a single symbol
 * 单一交易对的24小时滚动窗口简易Ticker统计
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
 * Connect to mini ticker stream / 连接简易Ticker流
 */
function connectMiniTickerStream() {
    const streamUrl = `${config.baseUrl}/${config.symbol}@miniTicker`;

    console.log('Connecting to Mini Ticker Stream... / 连接简易Ticker流中...\n');
    console.log(`URL: ${streamUrl}\n`);

    const ws = new WebSocket(streamUrl);

    ws.on('open', () => {
        console.log('✓ Connected to Mini Ticker Stream! / 已连接到简易Ticker流！\n');
        console.log('Listening for mini ticker updates... / 监听简易Ticker更新中...\n');
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
    connectMiniTickerStream();
}

module.exports = connectMiniTickerStream;
