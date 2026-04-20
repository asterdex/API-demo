/**
 * Aggregate Trade Streams / 聚合成交流
 * Stream: <symbol>@aggTrade
 *
 * The Aggregate Trade Streams push trade information that is aggregated for a single taker order
 * 聚合成交流推送单个吃单订单的聚合成交信息
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
 * Connect to aggregate trade stream / 连接聚合成交流
 */
function connectAggTradeStream() {
    const streamUrl = `${config.baseUrl}/${config.symbol}@aggTrade`;

    console.log('Connecting to Aggregate Trade Stream... / 连接聚合成交流中...\n');
    console.log(`URL: ${streamUrl}\n`);

    const ws = new WebSocket(streamUrl);

    ws.on('open', () => {
        console.log('✓ Connected to Aggregate Trade Stream! / 已连接到聚合成交流！\n');
        console.log('Listening for aggregate trades... / 监听聚合成交中...\n');
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
    connectAggTradeStream();
}

module.exports = connectAggTradeStream;
