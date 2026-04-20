# Spot V3 API Demo / 现货V3 API示例

## ⚠️ 重要提示 / Important Notice

**Spot V3 API 使用 EIP-712 类型化数据签名认证，与旧版 Spot API 完全不同！**

**Spot V3 API uses EIP-712 typed data signature authentication, completely different from the legacy Spot API!**

---

## 🔐 认证方式 / Authentication Method

### EIP-712 类型化数据签名 / EIP-712 Typed Data Signature

Spot V3 需要以下参数 / Spot V3 requires the following parameters:
- `user` - 主账户钱包地址 / Main account wallet address
- `signer` - API钱包地址 / API wallet address
- `nonce` - 微秒级时间戳，单调递增 / Microsecond timestamp, monotonically increasing
- `signature` - EIP-712 签名 / EIP-712 signature

签名流程 / Signature Process:
1. 将所有参数（含 nonce、user、signer）构建为原始查询字符串 / Build all parameters (including nonce, user, signer) as raw query string
2. 构造 EIP-712 类型化数据结构（Domain + Types + Message） / Construct EIP-712 typed data structure (Domain + Types + Message)
3. 使用 ethers.js 的 `signTypedData` 方法签名 / Sign using ethers.js `signTypedData` method
4. 将 `signature` 附加到请求参数中 / Append `signature` to request parameters

**EIP-712 优势 / EIP-712 Advantages**:
- ✅ 符合以太坊标准（EIP-712） / Compliant with Ethereum standard (EIP-712)
- ✅ MetaMask 等钱包可直接显示签名内容 / MetaMask and other wallets can display signature content directly
- ✅ 更好的安全性和可读性 / Better security and readability

---

## 📦 安装依赖 / Install Dependencies

```bash
cd spot-v3-demo
npm install
```

依赖包括 / Dependencies include:
- `axios` - HTTP 客户端 / HTTP client
- `ethers` - Web3 库（用于 EIP-712 签名） / Web3 library (for EIP-712 signing)

---

## ⚙️ 配置 / Configuration

### 1. 获取 API 钱包 / Get API Wallet

访问 AsterDEX 创建 API 钱包 / Visit AsterDEX to create API wallet:
- 中文 / Chinese: https://www.asterdex.com/zh-CN/api-wallet
- 英文 / English: https://www.asterdex.com/en/api-wallet

切换到顶部的 **专业API / Pro API** 模式后创建。

Switch to the **Pro API** mode at the top, then create your wallet.

您将获得 / You will get:
- `signer` - API 钱包地址 / API wallet address
- `privateKey` - API 钱包私钥 / API wallet private key

### 2. 编辑 config.js / Edit config.js

打开 `config.js`，填入以下配置 / Open `config.js` and fill in the following:

```javascript
module.exports = {
    // 基础URL（现货V3）/ Base URL (Spot V3)
    BASE_URL: 'https://sapi.asterdex.com',

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // EIP-712 签名认证 / EIP-712 Signature Authentication
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // 主账户钱包地址（您的交易账户地址）
    // Main account wallet address (your trading account address)
    USER_ADDRESS: '0xYourMainWalletAddress',

    // API 钱包地址（从 API 管理页面获取）
    // API wallet address (get from API management page)
    SIGNER_ADDRESS: '0xYourAPIWalletAddress',

    // API 钱包私钥（从 API 管理页面获取）
    // API wallet private key (get from API management page)
    // ⚠️ 保密！永远不要提交到 Git / Keep secret! Never commit to Git!
    PRIVATE_KEY: '0xYourAPIWalletPrivateKey',

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // EIP-712 域配置 / EIP-712 Domain Configuration
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    EIP712_DOMAIN: {
        name: 'AsterSignTransaction',
        version: '1',
        chainId: 1666,   // 主网 / Mainnet
        verifyingContract: '0x0000000000000000000000000000000000000000'
    },

    // 默认交易对 / Default trading pair
    DEFAULT_SYMBOL: 'BTCUSDT'
};
```

### 3. 配置字段说明 / Field Description

| 字段 / Field | 说明 / Description |
|---|---|
| `BASE_URL` | 现货V3 接口基础地址，固定为 `https://sapi.asterdex.com` / Spot V3 base URL, fixed as `https://sapi.asterdex.com` |
| `USER_ADDRESS` | 您的主交易账户钱包地址（登录地址）/ Your main trading account wallet address (login address) |
| `SIGNER_ADDRESS` | API 专属钱包地址，从 API 管理页面获取 / API-dedicated wallet address, get from API management page |
| `PRIVATE_KEY` | API 钱包对应的私钥，用于生成签名 / Private key corresponding to SIGNER_ADDRESS, used to generate signatures |
| `EIP712_DOMAIN.chainId` | 链ID：主网填 `1666`，测试网填 `714` / Chain ID: `1666` for mainnet, `714` for testnet |
| `DEFAULT_SYMBOL` | 行情类 demo 默认使用的交易对 / Default trading pair for market data demos |

---

## 📘 Nonce 机制 / Nonce Mechanism

Nonce 是防重放攻击的核心机制，规则如下 / Nonce is the core anti-replay mechanism with the following rules:

- nonce 必须为**微秒级时间戳**（秒 × 1,000,000 + 同秒内计数器）/ nonce must be a **microsecond-level timestamp** (seconds × 1,000,000 + per-second counter)
- nonce 与服务端时间偏差不得超过 **±10 秒** / nonce must not deviate from server time by more than **±10 seconds**
- 同一个 nonce 只能使用一次，服务端保留最近 100 个 nonce / Each nonce can only be used once; server retains the latest 100 nonces

`utils.js` 中的 `getNonce()` 已实现正确逻辑，无需手动处理：

`getNonce()` in `utils.js` already implements the correct logic, no manual handling needed:

```javascript
// 与文档 Python 示例 get_nonce() 完全一致
// Identical to the Python get_nonce() example in the documentation
function getNonce() {
    const nowSec = Math.floor(Date.now() / 1000);  // 当前秒数 / Current seconds
    if (nowSec === _lastSec) {
        _counter += 1;                              // 同一秒内递增 / Increment within same second
    } else {
        _lastSec = nowSec;
        _counter = 0;
    }
    return nowSec * 1_000_000 + _counter;           // 微秒级，单调递增 / Microsecond-level, monotonically increasing
}
```

---

## 📘 EIP-712 配置详解 / EIP-712 Configuration Guide

### EIP-712 Domain 说明 / EIP-712 Domain Explanation

```javascript
EIP712_DOMAIN: {
    name: 'AsterSignTransaction',   // 应用名称（固定）/ App name (fixed)
    version: '1',                    // 版本（固定）/ Version (fixed)
    chainId: 1666,                   // 链ID（重要！）/ Chain ID (important!)
    verifyingContract: '0x0000...'  // 验证合约（固定为零地址）/ Verifying contract (zero address)
}
```

### chainId 配置说明 / chainId Configuration

| 环境 / Environment | chainId | 说明 / Description |
|---|---|---|
| 生产环境 / Production | `1666` | 主网 / Mainnet |
| 测试网 / Testnet | `714` | AsterDEX 测试网络 / Test Network |

⚠️ **重要 / Important**: chainId 必须与服务器端配置一致，否则签名验证失败！

⚠️ chainId must match the server-side configuration, otherwise signature verification will fail!

---

## 🔒 安全提示 / Security Notice

- ⚠️ **永远不要将真实私钥提交到 Git** / **Never commit real private keys to Git**
- `config.js` 已在 `.gitignore` 中被忽略 / `config.js` is already ignored in `.gitignore`
- 建议先使用测试账户验证逻辑，再切换到正式账户 / Test with a test account first before switching to a real account
- `PRIVATE_KEY` 仅是 **API 钱包**的私钥，不是主钱包私钥 / `PRIVATE_KEY` is only the **API wallet** private key, not the main wallet private key

---

## 🚀 快速开始 / Quick Start

### 第一步：安装依赖 / Step 1: Install Dependencies

```bash
cd spot-v3-demo
npm install
```

### 第二步：配置 config.js / Step 2: Configure config.js

编辑 `config.js`，填入 `USER_ADDRESS`、`SIGNER_ADDRESS`、`PRIVATE_KEY`。

Edit `config.js` and fill in `USER_ADDRESS`, `SIGNER_ADDRESS`, `PRIVATE_KEY`.

### 第三步：测试连通性 / Step 3: Test Connectivity

```bash
node 01_ping.js
```

### 第四步：查询账户信息 / Step 4: Get Account Info

```bash
node 25_account.js
```

### 第五步：下单 / Step 5: Place an Order

编辑 `14_placeOrder.js` 中的参数（交易对、价格、数量），然后运行：

Edit the parameters in `14_placeOrder.js` (symbol, price, quantity), then run:

```bash
node 14_placeOrder.js
```

---

## 📝 示例文件列表 / Example Files

### 行情数据 / Market Data（无需鉴权 / No authentication required）

| 文件 / File | 接口 / Endpoint | 说明 / Description |
|---|---|---|
| `01_ping.js` | `GET /api/v3/ping` | 测试连通性 / Test connectivity |
| `02_time.js` | `GET /api/v3/time` | 服务器时间 / Server time |
| `03_exchangeInfo.js` | `GET /api/v3/exchangeInfo` | 交易规则 / Exchange info |
| `04_depth.js` | `GET /api/v3/depth` | 深度信息 / Order book depth |
| `05_trades.js` | `GET /api/v3/trades` | 近期成交 / Recent trades |
| `06_historicalTrades.js` | `GET /api/v3/historicalTrades` | 历史成交 / Historical trades |
| `07_aggTrades.js` | `GET /api/v3/aggTrades` | 归集成交 / Aggregate trades |
| `08_klines.js` | `GET /api/v3/klines` | K线数据 / Kline data |
| `09_ticker24hr.js` | `GET /api/v3/ticker/24hr` | 24hr 价格变动 / 24hr price change |
| `10_tickerPrice.js` | `GET /api/v3/ticker/price` | 最新价格 / Latest price |
| `11_bookTicker.js` | `GET /api/v3/ticker/bookTicker` | 最优挂单 / Best bid/ask |
| `12_commissionRate.js` | `GET /api/v3/commissionRate` | Symbol 手续费 / Commission rate |
| `13_noop.js` | `POST /api/v3/noop` | 取消排队中的交易 / Cancel queued transaction |

### 账户与交易 / Account & Trading（需要 EIP-712 鉴权 / EIP-712 authentication required）

| 文件 / File | 接口 / Endpoint | 说明 / Description |
|---|---|---|
| `14_placeOrder.js` | `POST /api/v3/order` | 下单 / Place order |
| `15_cancelOrder.js` | `DELETE /api/v3/order` | 撤销订单 / Cancel order |
| `16_queryOrder.js` | `GET /api/v3/order` | 查询订单 / Query order |
| `17_openOrder.js` | `GET /api/v3/openOrder` | 查询当前挂单 / Query open order |
| `18_openOrders.js` | `GET /api/v3/openOrders` | 所有当前挂单 / All open orders |
| `19_cancelAllOrders.js` | `DELETE /api/v3/allOpenOrders` | 取消所有挂单 / Cancel all open orders |
| `20_allOrders.js` | `GET /api/v3/allOrders` | 查询所有订单 / All orders (including history) |
| `21_transactionHistory.js` | `GET /api/v3/transactionHistory` | 查询交易流水 / Transaction history |
| `22_transfer.js` | `POST /api/v3/asset/wallet/transfer` | 期货现货互转 / Spot ↔ Futures transfer |
| `23_estimateWithdrawFee.js` | `GET /api/v3/aster/withdraw/estimateFee` | 提现手续费估算 / Estimate withdraw fee |
| `24_withdraw.js` | `POST /api/v3/aster/user-withdraw` | 现货提现 / Spot withdraw |
| `25_account.js` | `GET /api/v3/account` | 账户信息 / Account information |
| `26_userTrades.js` | `GET /api/v3/userTrades` | 账户成交历史 / Account trade list |

---

## 🔧 工具函数 / Utility Functions

### utils.js

提供 EIP-712 签名及查询字符串构建功能 / Provides EIP-712 signing and query string building:

```javascript
const { signParamsWeb3, buildQueryString } = require('./utils');

// 生成 EIP-712 签名（自动注入 nonce、user、signer）
// Generate EIP-712 signature (auto-injects nonce, user, signer)
const signedParams = await signParamsWeb3(
    params,                    // 业务参数 / Business parameters
    config.USER_ADDRESS,       // 主账户地址 / Main account address
    config.SIGNER_ADDRESS,     // API 钱包地址 / API wallet address
    config.PRIVATE_KEY         // API 钱包私钥 / API wallet private key
);

// 构建 URL 编码的查询字符串（用于 HTTP 请求）
// Build URL-encoded query string (for HTTP requests)
const queryString = buildQueryString(signedParams);
```

---

## ⚠️ 提现注意事项 / Withdraw Notice

`24_withdraw.js` 需要**两套独立签名** / `24_withdraw.js` requires **two independent signatures**:

| 签名 / Signature | Domain name | 使用的私钥 / Key Used |
|---|---|---|
| `userSignature` | `Aster` | 用户**主钱包**私钥 / User's **main wallet** private key |
| `signature` | `AsterSignTransaction` | API signer 私钥 / API signer private key |

提现签名的 `nonce` 使用 `Date.now() * 1000`（与 API 鉴权 nonce 相互独立）。

The withdrawal signature `nonce` uses `Date.now() * 1000` (independent of the API auth nonce).

---

## 🆚 与旧版 Spot API 的区别 / Difference from Legacy Spot API

| 特性 / Feature | Spot API（旧）/ Legacy | Spot V3 API |
|---|---|---|
| 认证方式 / Auth | HMAC SHA256 | EIP-712 Typed Data |
| 所需参数 / Params | `timestamp`, `signature` | `user`, `signer`, `nonce`, `signature` |
| API Key | 字符串 Key + Secret | API 钱包地址 + 私钥 |
| 签名工具 / Signing | `crypto` (Node.js) | `ethers` (EIP-712) |
| 防重放机制 / Anti-replay | `recvWindow`（时间窗口）| Nonce（唯一值列表）|
| 钱包兼容 / Wallet | ❌ 不支持 / No | ✅ 支持 MetaMask / Yes |
| Base URL | `https://sapi.asterdex.com` | `https://sapi.asterdex.com` |

---

## ❓ 常见问题 / FAQ

### Q1: USER_ADDRESS 和 SIGNER_ADDRESS 有什么区别？/ What's the difference between USER_ADDRESS and SIGNER_ADDRESS?

**中文**: `USER_ADDRESS` 是您登录 AsterDEX 的主钱包地址；`SIGNER_ADDRESS` 是在 API 管理页面专门创建的 API 钱包地址，私钥用于签名请求，更安全。

**English**: `USER_ADDRESS` is your main wallet address used to log in to AsterDEX. `SIGNER_ADDRESS` is an API-dedicated wallet created on the API management page; its private key is used to sign requests, making it more secure.

### Q2: 如何获取 SIGNER_ADDRESS 和 PRIVATE_KEY？/ How to get SIGNER_ADDRESS and PRIVATE_KEY?

**中文**: 访问 https://www.asterdex.com/zh-CN/api-wallet，切换到顶部的**专业API**，按提示创建 API 钱包即可获取。

**English**: Visit https://www.asterdex.com/en/api-wallet, switch to **Pro API** at the top, and follow the instructions to create an API wallet.

### Q3: chainId 应该设置多少？/ What should chainId be?

| 环境 / Environment | chainId |
|---|---|
| 生产主网 / Production | `1666` |
| 测试网 / Testnet | `714` |

### Q4: nonce 超时了怎么办？/ What if the nonce expires?

**中文**: nonce 与服务端时间偏差不超过 ±10 秒即可。如果报 nonce 相关错误，请检查本地系统时间是否准确，或通过 `02_time.js` 查询服务器时间进行对比。

**English**: The nonce must not deviate from server time by more than ±10 seconds. If you get a nonce-related error, check that your local system time is accurate, or use `02_time.js` to query server time for comparison.

### Q5: 签名失败怎么排查？/ How to debug signature failures?

**中文**: 检查以下几点：
1. `SIGNER_ADDRESS` 与 `PRIVATE_KEY` 是否配对
2. `USER_ADDRESS` 是否为正确的主账户地址
3. `EIP712_DOMAIN.chainId` 是否与环境匹配（主网 `1666`）
4. 参数中是否有 `null` 或 `undefined` 值

**English**: Check the following:
1. `SIGNER_ADDRESS` and `PRIVATE_KEY` are a matching pair
2. `USER_ADDRESS` is the correct main account address
3. `EIP712_DOMAIN.chainId` matches the environment (mainnet `1666`)
4. No `null` or `undefined` values in parameters

### Q6: 提现接口报错怎么办？/ What if the withdraw endpoint returns an error?

**中文**: `24_withdraw.js` 需要两套独立签名。`userSignature` 必须使用**主钱包私钥**签名（不是 API signer 私钥），且 `receiver` 必须是账户注册地址。

**English**: `24_withdraw.js` requires two independent signatures. `userSignature` must be signed with the **main wallet private key** (not the API signer private key), and `receiver` must be the account's registered address.

---

## 🔗 相关链接 / Related Links

- [AsterDEX 官网 / Official Website](https://www.asterdex.com)
- [API 管理页面 / API Management](https://www.asterdex.com/zh-CN/api-wallet)
- [Spot V3 API 文档 / Documentation](https://asterdex.github.io/aster-api-website/zh/spot-v3/general-info/)
- [EIP-712 标准 / Standard](https://eips.ethereum.org/EIPS/eip-712)
- [Ethers.js 文档 / Documentation](https://docs.ethers.org/v6/)

---
