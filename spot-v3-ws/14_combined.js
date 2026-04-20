/**
 * Combined Streams / 组合流
 * Multiple streams can be accessed in a single connection
 * 可以在单个连接中访问多个流
 *
 * Combined stream format: /stream?streams=<stream1>/<stream2>/<stream3>
 * 组合流格式：/stream?streams=<流1>/<流2>/<流3>
 *
 * Each message is wrapped in: {"stream":"<name>","data":<payload>}
 * 每条消息包装格式：{"stream":"<名称>","data":<载荷>}
 */

const WebSocket = require('ws');

/**
 * Configuration / 配置
 */
const config = {
    baseUrl: 'wss://sstream.asterdex.com',     // Base URL (without /ws) / 基础URL（不含 /ws）
    streams: [                                  // Streams to combine / 要组合的流
        'btcusdt@aggTrade',                     // Aggregate trade stream / 聚合成交流
        'btcusdt@depth',                        // Diff depth stream / 增量深度流
        'btcusdt@ticker',                       // Ticker stream / Ticker流
        'btcusdt@tradepro',                     // TradePro stream (V3 exclusive) / 专业成交流（V3 专有）
    ]
};

/**
 * Connect to combined streams / 连接组合流
 */
function connectCombinedStreams() {
    const streamsParam = config.streams.join('/');
    const streamUrl = `${config.baseUrl}/stream?streams=${streamsParam}`;

    console.log('Connecting to Combined Streams... / 连接组合流中...\n');
    console.log('Streams / 流:');
    config.streams.forEach((stream, index) => {
        console.log(`  ${index + 1}. ${stream}`);
    });
    console.log(`\nURL: ${streamUrl}\n`);

    const ws = new WebSocket(streamUrl);

    ws.on('open', () => {
        console.log('✓ Connected to Combined Streams! / 已连接到组合流！\n');
        console.log('Listening for updates from all streams... / 监听所有流的更新中...\n');
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
    connectCombinedStreams();
}

module.exports = connectCombinedStreams;
