/**
 * Trade Streams / 逐笔成交流
 * Stream: <symbol>@trade
 *
 * The Trade Streams push raw trade information; each trade is a match between one taker and one maker
 * 逐笔成交流推送原始成交信息，每笔成交是一个吃单与一个挂单之间的匹配
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
 * Connect to trade stream / 连接逐笔成交流
 */
function connectTradeStream() {
    const streamUrl = `${config.baseUrl}/${config.symbol}@trade`;

    console.log('Connecting to Trade Stream... / 连接逐笔成交流中...\n');
    console.log(`URL: ${streamUrl}\n`);

    const ws = new WebSocket(streamUrl);

    ws.on('open', () => {
        console.log('✓ Connected to Trade Stream! / 已连接到逐笔成交流！\n');
        console.log('Listening for trades... / 监听成交中...\n');
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
    connectTradeStream();
}

module.exports = connectTradeStream;
