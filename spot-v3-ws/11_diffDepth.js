/**
 * Diff. Depth Stream / 增量深度流
 * Stream: <symbol>@depth or <symbol>@depth@100ms
 *
 * Order book price and quantity depth updates (incremental)
 * 订单簿价格和数量的增量深度更新
 *
 * How to maintain a local order book / 如何维护本地订单簿:
 * 1. Subscribe to wss://sstream.asterdex.com/ws/<symbol>@depth
 * 2. Cache received updates; later updates overwrite earlier ones at the same price
 * 3. Fetch REST snapshot: GET https://sapi.asterdex.com/api/v3/depth?symbol=BTCUSDT&limit=1000
 * 4. Discard cached messages where u <= lastUpdateId from snapshot
 * 5. Apply snapshot, then resume from first event where U <= lastUpdateId+1 AND u >= lastUpdateId+1
 * 6. Each event's U should equal the previous event's u+1; otherwise restart from step 3
 */

const WebSocket = require('ws');

/**
 * Configuration / 配置
 */
const config = {
    baseUrl: 'wss://sstream.asterdex.com/ws',  // Base WebSocket URL / WebSocket基础URL
    symbol: 'btcusdt',                          // Trading pair (lowercase) / 交易对（小写）
    updateSpeed: '',                            // Update speed / 更新速度 ('' = 1000ms, '@100ms' = 100ms)
};

/**
 * Connect to diff depth stream / 连接增量深度流
 */
function connectDiffDepthStream() {
    const streamUrl = `${config.baseUrl}/${config.symbol}@depth${config.updateSpeed}`;

    console.log('Connecting to Diff Depth Stream... / 连接增量深度流中...\n');
    console.log(`URL: ${streamUrl}\n`);
    console.log(`Update Speed / 更新速度: ${config.updateSpeed || '1000ms'}\n`);

    const ws = new WebSocket(streamUrl);

    ws.on('open', () => {
        console.log('✓ Connected to Diff Depth Stream! / 已连接到增量深度流！\n');
        console.log('Listening for diff depth updates... / 监听增量深度更新中...\n');
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
    connectDiffDepthStream();
}

module.exports = connectDiffDepthStream;
