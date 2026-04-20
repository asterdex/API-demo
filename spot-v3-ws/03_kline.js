/**
 * Kline/Candlestick Streams / K线流
 * Stream: <symbol>@kline_<interval>
 *
 * The Kline/Candlestick Stream pushes updates to the current klines/candlestick every 2000ms
 * K线流每2000ms推送K线/蜡烛图更新
 */

const WebSocket = require('ws');

/**
 * Configuration / 配置
 */
const config = {
    baseUrl: 'wss://sstream.asterdex.com/ws',  // Base WebSocket URL / WebSocket基础URL
    symbol: 'btcusdt',                          // Trading pair (lowercase) / 交易对（小写）
    interval: '1m',                             // Kline interval / K线时间间隔
                                                // Options / 可选值: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
};

/**
 * Connect to kline stream / 连接K线流
 */
function connectKlineStream() {
    const streamUrl = `${config.baseUrl}/${config.symbol}@kline_${config.interval}`;

    console.log('Connecting to Kline Stream... / 连接K线流中...\n');
    console.log(`URL: ${streamUrl}\n`);
    console.log(`Interval / 时间间隔: ${config.interval}\n`);

    const ws = new WebSocket(streamUrl);

    ws.on('open', () => {
        console.log('✓ Connected to Kline Stream! / 已连接到K线流！\n');
        console.log('Listening for kline updates... / 监听K线更新中...\n');
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
    connectKlineStream();
}

module.exports = connectKlineStream;
