/**
 * Futures V3 TradePro Stream / 期货V3 TradePro 流
 * Stream: <symbol>@tradepro
 *
 * Provides real-time trade data including transaction hash and trader addresses.
 * 提供实时成交数据，包含交易哈希和交易双方地址。
 *
 * Payload fields / 消息字段:
 *   e  — 事件类型: tradepro
 *   E  — 事件时间 (ms)
 *   T  — 成交时间 (ms)
 *   s  — 交易对 symbol
 *   t  — 成交 ID
 *   p  — 成交价格
 *   q  — 成交数量
 *   h  — 成交哈希 (Transaction hash)
 *   m  — 交易双方地址数组: m[0]=Taker地址, m[1]=Maker地址
 */

const WebSocket = require('ws');

const config = {
    baseUrl: 'wss://fstream.asterdex.com/ws',
    symbol:  'btcusdt',   // 订阅的交易对（小写）/ Symbol to subscribe (lowercase)
};

function connect() {
    const streamUrl = `${config.baseUrl}/${config.symbol}@tradepro`;
    console.log(`Connecting to ${streamUrl}...\n`);

    const ws = new WebSocket(streamUrl);

    ws.on('open', () => {
        console.log('✓ Connected / 已连接\n');
        console.log('Listening for TradePro events... / 监听 TradePro 事件中...\n');
    });

    ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());

        // Parse and display key fields / 解析并展示关键字段
        if (msg.data) {
            const d = msg.data;
            console.log('─────────────────────────────────────────');
            console.log(`Symbol    / 交易对  : ${d.s}`);
            console.log(`Price     / 成交价  : ${d.p}`);
            console.log(`Quantity  / 成交量  : ${d.q}`);
            console.log(`Tx Hash   / 交易哈希: ${d.h}`);
            console.log(`Taker     / Taker  : ${d.m?.[0]}`);
            console.log(`Maker     / Maker  : ${d.m?.[1]}`);
            console.log(`Trade ID  / 成交ID  : ${d.t}`);
            console.log(`Time      / 时间    : ${new Date(d.T).toISOString()}`);
            console.log('─────────────────────────────────────────\n');
        } else {
            console.log('Message / 消息:', JSON.stringify(msg, null, 2));
        }
    });

    ws.on('error', (err) => console.error('Error / 错误:', err.message));
    ws.on('close', () => console.log('Closed / 已关闭'));

    process.on('SIGINT', () => { ws.close(); process.exit(0); });
}

if (require.main === module) connect();
module.exports = connect;
