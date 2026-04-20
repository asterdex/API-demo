/**
 * Partial Book Depth Streams / 有限档深度流
 * Stream: <symbol>@depth<levels> or <symbol>@depth<levels>@100ms
 *
 * Top bids and asks; valid levels are 5, 10, or 20
 * 最优的买卖挂单，有效档位为 5、10 或 20
 */

const WebSocket = require('ws');

/**
 * Configuration / 配置
 */
const config = {
    baseUrl: 'wss://sstream.asterdex.com/ws',  // Base WebSocket URL / WebSocket基础URL
    symbol: 'btcusdt',                          // Trading pair (lowercase) / 交易对（小写）
    levels: 5,                                  // Depth levels / 深度档位 (5, 10, or 20)
    updateSpeed: '',                            // Update speed / 更新速度 ('' = 1000ms, '@100ms' = 100ms)
};

/**
 * Connect to partial depth stream / 连接有限档深度流
 */
function connectPartialDepthStream() {
    const streamUrl = `${config.baseUrl}/${config.symbol}@depth${config.levels}${config.updateSpeed}`;

    console.log('Connecting to Partial Depth Stream... / 连接有限档深度流中...\n');
    console.log(`URL: ${streamUrl}\n`);
    console.log(`Levels / 档位: ${config.levels}`);
    console.log(`Update Speed / 更新速度: ${config.updateSpeed || '1000ms'}\n`);

    const ws = new WebSocket(streamUrl);

    ws.on('open', () => {
        console.log('✓ Connected to Partial Depth Stream! / 已连接到有限档深度流！\n');
        console.log('Listening for partial depth updates... / 监听有限档深度更新中...\n');
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
    connectPartialDepthStream();
}

module.exports = connectPartialDepthStream;
