/**
 * Individual Symbol Ticker Stream / 单一交易对完整Ticker流
 * Stream: <symbol>@ticker
 *
 * 24hr rolling window ticker statistics for a single symbol; updated every 1000ms
 * 单一交易对的24小时滚动窗口完整Ticker统计，每1000ms更新
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
 * Connect to ticker stream / 连接完整Ticker流
 */
function connectTickerStream() {
    const streamUrl = `${config.baseUrl}/${config.symbol}@ticker`;

    console.log('Connecting to Ticker Stream... / 连接完整Ticker流中...\n');
    console.log(`URL: ${streamUrl}\n`);

    const ws = new WebSocket(streamUrl);

    ws.on('open', () => {
        console.log('✓ Connected to Ticker Stream! / 已连接到完整Ticker流！\n');
        console.log('Listening for ticker updates... / 监听Ticker更新中...\n');
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
    connectTickerStream();
}

module.exports = connectTickerStream;
