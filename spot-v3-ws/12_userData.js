/**
 * User Data Streams / 用户数据流
 * Stream: <listenKey>
 *
 * Provides account updates and order updates via EIP-712 signed listenKey
 * 通过 EIP-712 签名的 listenKey 提供账户更新和订单更新
 *
 * Spot V3 listenKey endpoints (different from legacy /api/v1/):
 *   POST   /api/v3/listenKey  - Create / 创建
 *   PUT    /api/v3/listenKey  - Extend (keep-alive) / 续期（保活）
 *   DELETE /api/v3/listenKey  - Close / 关闭
 *
 * All listenKey operations require EIP-712 authentication (USER_STREAM type)
 * 所有 listenKey 操作均需要 EIP-712 鉴权（USER_STREAM 类型）
 */

const WebSocket = require('ws');
const axios = require('axios');
const path = require('path');

/**
 * Load config and utils from spot-v3-demo
 * 从 spot-v3-demo 加载配置和工具函数
 */
const spotV3Config = require(path.join(__dirname, '../spot-v3-demo/config.js'));
const { signParamsWeb3, buildQueryString } = require(path.join(__dirname, '../spot-v3-demo/utils.js'));

/**
 * Configuration / 配置
 */
const config = {
    baseUrl: 'wss://sstream.asterdex.com/ws',  // Base WebSocket URL / WebSocket基础URL
    restApiUrl: spotV3Config.BASE_URL,           // REST API URL / REST API地址
};

/**
 * Create a listenKey using EIP-712 authentication / 使用 EIP-712 鉴权创建 listenKey
 */
async function createListenKey() {
    try {
        console.log('Creating listenKey (EIP-712 auth)... / 创建 listenKey（EIP-712 鉴权）中...\n');

        const signedParams = await signParamsWeb3(
            {},
            spotV3Config.USER_ADDRESS,
            spotV3Config.SIGNER_ADDRESS,
            spotV3Config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);

        const response = await axios.post(
            `${config.restApiUrl}/api/v3/listenKey`,
            queryString,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (response.data && response.data.listenKey) {
            console.log('✓ ListenKey created successfully / ListenKey 创建成功');
            console.log(`ListenKey: ${response.data.listenKey}\n`);
            return response.data.listenKey;
        } else {
            throw new Error('Invalid response from listenKey API / listenKey API 响应无效');
        }
    } catch (error) {
        console.error('Error creating listenKey / 创建 listenKey 错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * Extend listenKey validity / 续期 listenKey
 */
async function keepAliveListenKey(listenKey) {
    const signedParams = await signParamsWeb3(
        { listenKey },
        spotV3Config.USER_ADDRESS,
        spotV3Config.SIGNER_ADDRESS,
        spotV3Config.PRIVATE_KEY
    );
    const queryString = buildQueryString(signedParams);
    await axios.put(
        `${config.restApiUrl}/api/v3/listenKey`,
        queryString,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
}

/**
 * Connect to user data stream / 连接用户数据流
 */
async function connectUserDataStream() {
    try {
        // Step 1: Create listenKey / 第一步：创建 listenKey
        const listenKey = await createListenKey();

        const streamUrl = `${config.baseUrl}/${listenKey}`;

        console.log('Connecting to User Data Stream... / 连接用户数据流中...\n');
        console.log(`URL: ${streamUrl}\n`);

        const ws = new WebSocket(streamUrl);

        ws.on('open', () => {
            console.log('✓ Connected to User Data Stream! / 已连接到用户数据流！\n');
            console.log('Listening for account/order updates... / 监听账户/订单更新中...\n');
        });

        ws.on('message', (data) => {
            // Output raw data / 输出原始数据
            const rawData = data.toString();
            console.log('Raw Data / 原始数据:');
            console.log(rawData);
            console.log('');
        });

        ws.on('error', (error) => {
            console.error('WebSocket Error / WebSocket错误:', error.message);
        });

        ws.on('close', () => {
            console.log('Connection closed / 连接已关闭');
            console.log('ℹ️  ListenKey will expire automatically / ListenKey 会自动过期');
            clearInterval(keepAliveTimer);
        });

        // Handle Ctrl+C gracefully / 优雅处理Ctrl+C
        process.on('SIGINT', () => {
            console.log('\nClosing connection... / 关闭连接中...');
            ws.close();
            process.exit(0);
        });

        // Keep listenKey alive every 30 minutes / 每30分钟保活 listenKey
        const keepAliveTimer = setInterval(async () => {
            try {
                await keepAliveListenKey(listenKey);
                console.log('✓ ListenKey kept alive / ListenKey 保活成功');
            } catch (error) {
                console.error('Error keeping listenKey alive / 保活 ListenKey 错误:', error.message);
            }
        }, 30 * 60 * 1000);

    } catch (error) {
        console.error('Failed to connect / 连接失败:', error.message);
        process.exit(1);
    }
}

// Execute / 执行
if (require.main === module) {
    connectUserDataStream();
}

module.exports = connectUserDataStream;
