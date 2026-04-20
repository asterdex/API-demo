# Spot V3 WebSocket API Demo / 现货V3 WebSocket API示例

This directory contains WebSocket stream examples for the **Spot V3** API.  
此目录包含 **Spot V3** API 的所有 WebSocket 流示例。

---

## Setup / 设置

1. Install dependencies / 安装依赖:
```bash
npm install
```

2. Run any example file / 运行任意示例文件:
```bash
node 01_aggTrade.js
```

---

## File List / 文件列表

### Market Data Streams / 行情数据流

| File / 文件 | Stream | Description / 说明 |
|---|---|---|
| `01_aggTrade.js` | `<symbol>@aggTrade` | Aggregate trade stream / 聚合成交流 |
| `02_trade.js` | `<symbol>@trade` | Tick-by-tick trade stream / 逐笔成交流 |
| `03_kline.js` | `<symbol>@kline_<interval>` | Kline/Candlestick stream / K线流 |
| `04_miniTicker.js` | `<symbol>@miniTicker` | Symbol mini ticker / 单一交易对简易Ticker |
| `05_allMiniTickers.js` | `!miniTicker@arr` | All symbols mini ticker / 全市场简易Ticker |
| `06_ticker.js` | `<symbol>@ticker` | Symbol full ticker / 单一交易对完整Ticker |
| `07_allTickers.js` | `!ticker@arr` | All symbols full ticker / 全市场完整Ticker |
| `08_bookTicker.js` | `<symbol>@bookTicker` | Best order book by symbol / 单一交易对最优挂单 |
| `09_allBookTickers.js` | `!bookTicker` | Best order book all symbols / 全市场最优挂单 |
| `10_partialDepth.js` | `<symbol>@depth<levels>` | Partial book depth / 有限档深度流 |
| `11_diffDepth.js` | `<symbol>@depth` | Incremental depth / 增量深度流 |

### User Data Stream / 用户数据流

| File / 文件 | Description / 说明 |
|---|---|
| `12_userData.js` | User data stream with EIP-712 listenKey / 使用 EIP-712 鉴权的用户数据流 |

### Spot V3 Exclusive / Spot V3 专有

| File / 文件 | Stream | Description / 说明 |
|---|---|---|
| `13_tradePro.js` | `<symbol>@tradepro` | Trade with on-chain hash & wallet addresses / 含链上哈希和钱包地址的专业成交流 |

### Advanced Features / 高级功能

| File / 文件 | Description / 说明 |
|---|---|
| `14_combined.js` | Multiple streams in one connection / 单连接多流订阅 |
| `15_subscribeUnsubscribe.js` | Dynamic subscribe/unsubscribe demo / 动态订阅/取消订阅演示 |

---

## WebSocket URLs / WebSocket 地址

| Mode / 模式 | URL |
|---|---|
| Single stream / 单流 | `wss://sstream.asterdex.com/ws/<streamName>` |
| Combined streams / 组合流 | `wss://sstream.asterdex.com/stream?streams=<s1>/<s2>` |
| User data stream / 用户数据流 | `wss://sstream.asterdex.com/ws/<listenKey>` |

---

## Stream Name Format / 流名称格式

All stream names must be **lowercase** / 所有流名称必须为**小写**

| Stream | Format / 格式 | Example / 示例 |
|---|---|---|
| Aggregate Trade | `<symbol>@aggTrade` | `btcusdt@aggTrade` |
| Trade | `<symbol>@trade` | `btcusdt@trade` |
| Kline | `<symbol>@kline_<interval>` | `btcusdt@kline_1m` |
| Mini Ticker | `<symbol>@miniTicker` | `btcusdt@miniTicker` |
| All Mini Tickers | `!miniTicker@arr` | — |
| Ticker | `<symbol>@ticker` | `btcusdt@ticker` |
| All Tickers | `!ticker@arr` | — |
| Book Ticker | `<symbol>@bookTicker` | `btcusdt@bookTicker` |
| All Book Tickers | `!bookTicker` | — |
| Partial Depth | `<symbol>@depth<levels>[@100ms]` | `btcusdt@depth5` |
| Diff Depth | `<symbol>@depth[@100ms]` | `btcusdt@depth` |
| TradePro *(V3)* | `<symbol>@tradepro` | `btcusdt@tradepro` |

---

## Spot V3 vs Spot — Key Differences / 与旧版 Spot 的关键差异

| Item / 项目 | Spot V3 | Spot (Legacy / 旧版) |
|---|---|---|
| ListenKey endpoint | `POST /api/v3/listenKey` | `POST /api/v1/listenKey` |
| ListenKey keep-alive | `PUT /api/v3/listenKey` | `PUT /api/v1/listenKey` |
| ListenKey close | `DELETE /api/v3/listenKey` | `DELETE /api/v1/listenKey` |
| Auth for listenKey | **EIP-712 signature** | API-Key header |
| Order book snapshot | `GET /api/v3/depth` | `GET /api/v1/depth` |
| TradePro stream | ✅ Available | ❌ Not available |
| WS base URL | `wss://sstream.asterdex.com` | `wss://sstream.asterdex.com` |

---

## User Data Stream Guide / 用户数据流使用指南

`12_userData.js` automatically handles the full lifecycle:  
`12_userData.js` 自动处理完整生命周期：

1. **Create listenKey** via `POST /api/v3/listenKey` with EIP-712 auth  
   通过 EIP-712 鉴权调用 `POST /api/v3/listenKey` 创建 listenKey

2. **Connect** to `wss://sstream.asterdex.com/ws/<listenKey>`  
   连接到 `wss://sstream.asterdex.com/ws/<listenKey>`

3. **Keep alive** by calling `PUT /api/v3/listenKey` every 30 minutes  
   每30分钟调用 `PUT /api/v3/listenKey` 保活（listenKey 60分钟后过期）

4. The script requires `USER_ADDRESS`, `SIGNER_ADDRESS`, and `PRIVATE_KEY` configured in `../spot-v3-demo/config.js`  
   脚本需要在 `../spot-v3-demo/config.js` 中配置 `USER_ADDRESS`、`SIGNER_ADDRESS` 和 `PRIVATE_KEY`

### Event Types / 事件类型

| Event / 事件 | Description / 说明 |
|---|---|
| `outboundAccountPosition` | Account balance update / 账户余额更新 |
| `executionReport` | Order status update / 订单状态更新 |

---

## TradePro Stream (V3 Exclusive) / 专业成交流（V3 专有）

`13_tradePro.js` 演示 V3 专有的 `tradepro` 流，相比普通 `trade` 流额外提供：

- **`h`** — On-chain transaction hash / 链上交易哈希
- **`m[0]`** — Taker wallet address / 吃单方钱包地址
- **`m[1]`** — Maker wallet address / 挂单方钱包地址

```json
{
  "stream": "btcusdt@tradepro",
  "data": {
    "e": "tradepro",
    "E": 1773751963081,
    "T": 1773751963079,
    "s": "BTCUSDT",
    "t": 128884613,
    "p": "73685.5",
    "q": "0.297",
    "h": "0x0000...0000",
    "m": ["0xTakerAddress", "0xMakerAddress"]
  }
}
```

---

## Connection Notes / 连接注意事项

- Each connection is valid for **no more than 24 hours**; reconnect as needed  
  每条连接最多有效 **24 小时**，请实现自动重连逻辑
- Server sends a **ping frame every 3 minutes**; client must reply with pong within 10 minutes  
  服务端每3分钟发送一次 **ping 帧**，客户端须在10分钟内回复 pong
- A single connection can subscribe to up to **1024 streams**  
  单个连接最多可订阅 **1024 个**流
- Press `Ctrl+C` to gracefully close any running example  
  按 `Ctrl+C` 可优雅关闭任何正在运行的示例

---

## Related Directories / 相关目录

| Directory / 目录 | Description / 说明 |
|---|---|
| `../spot-v3-demo/` | Spot V3 REST API demos / Spot V3 REST API 示例 |
| `../spot-ws/` | Legacy Spot WebSocket demos / 旧版 Spot WebSocket 示例 |
