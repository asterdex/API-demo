/**
 * All Symbols Ticker Stream / 全市场完整Ticker流
 * Stream: !ticker@arr
 *
 * 24hr rolling window ticker statistics for all symbols; only tickers with updated data will be pushed
 * 全市场24小时滚动窗口完整Ticker统计，仅推送有更新的交易对
 */

const WebSocket = require('ws');

/**
 * Configuration / 配置
 */
const config = {
    baseUrl: 'wss://sstream.asterdex.com/ws',  // Base WebSocket URL / WebSocket基础URL
};

/**
 * Connect to all tickers stream / 连接全市场完整Ticker流
 */
function connectAllTickersStream() {
    const streamUrl = `${config.baseUrl}/!ticker@arr`;

    console.log('Connecting to All Tickers Stream... / 连接全市场完整Ticker流中...\n');
    console.log(`URL: ${streamUrl}\n`);

    const ws = new WebSocket(streamUrl);

    ws.on('open', () => {
        console.log('✓ Connected to All Tickers Stream! / 已连接到全市场完整Ticker流！\n');
        console.log('Listening for all ticker updates... / 监听全市场Ticker更新中...\n');
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
    connectAllTickersStream();
}

module.exports = connectAllTickersStream;
