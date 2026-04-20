/**
 * Futures V3 User Data Streams / 期货V3 用户数据流
 * Stream: <listenKey>
 * 
 * Provides account updates and order updates
 * 提供账户更新和订单更新
 * 
 * This script automatically creates a listenKey before connecting
 * 此脚本会在连接前自动创建listenKey
 */

const WebSocket = require('ws');
const axios = require('axios');
const path = require('path');

/**
 * Load config and utils from futures-v3-demo (EIP-712 auth required)
 * 从 futures-v3-demo 加载配置和工具函数（需要 EIP-712 鉴权）
 */
const futuresV3Config = require(path.join(__dirname, '../futures-v3-demo/config.js'));
const { signParamsWeb3, buildQueryString } = require(path.join(__dirname, '../futures-v3-demo/utils.js'));

/**
 * Configuration / 配置
 */
const config = {
    baseUrl: 'wss://fstream.asterdex.com/ws',    // Base WebSocket URL / WebSocket基础URL
    restApiUrl: futuresV3Config.BASE_URL,         // REST API URL / REST API地址
};

/**
 * Create listenKey with EIP-712 authentication / 使用 EIP-712 鉴权创建 listenKey
 */
async function createListenKey() {
    try {
        console.log('Creating listenKey (EIP-712 auth)... / 创建 listenKey（EIP-712 鉴权）中...\n');

        const signedParams = await signParamsWeb3(
            {},
            futuresV3Config.USER_ADDRESS,
            futuresV3Config.SIGNER_ADDRESS,
            futuresV3Config.PRIVATE_KEY
        );
        const queryString = buildQueryString(signedParams);

        const response = await axios.post(
            `${config.restApiUrl}/fapi/v3/listenKey`,
            queryString,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (response.data && response.data.listenKey) {
            console.log('✓ ListenKey created successfully / ListenKey创建成功');
            console.log(`ListenKey: ${response.data.listenKey}\n`);
            return response.data.listenKey;
        } else {
            throw new Error('Invalid response from listenKey API / listenKey API响应无效');
        }
    } catch (error) {
        console.error('Error creating listenKey / 创建listenKey错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * Connect to user data stream / 连接用户数据流
 */
async function connectUserDataStream() {
    try {
        // Automatically create listenKey / 自动创建listenKey
        const listenKey = await createListenKey();
        
        const streamUrl = `${config.baseUrl}/${listenKey}`;
        
        console.log('Connecting to Futures V3 User Data Stream... / 连接期货V3用户数据流中...\n');
        console.log(`URL: ${streamUrl}\n`);
        
        const ws = new WebSocket(streamUrl);
        
        ws.on('open', () => {
            console.log('✓ Connected to Futures V3 User Data Stream! / 已连接到期货V3用户数据流！\n');
            console.log('Listening for account and order updates... / 监听账户和订单更新中...\n');
        });
        
        ws.on('message', (data) => {
            // Output raw data / 输出原始数据
            const rawData = data.toString();
            console.log('─────────────────────────────────────────');
            console.log('Raw Data / 原始数据:');
            console.log(rawData);
            
            try {
                const msg = JSON.parse(rawData);
                console.log('\nParsed Data / 解析数据:');
                console.log(JSON.stringify(msg, null, 2));
            } catch (e) {
                // If not JSON, already displayed as raw / 如果不是JSON，已显示原始数据
            }
            console.log('─────────────────────────────────────────\n');
        });
        
        ws.on('error', (error) => {
            console.error('WebSocket Error / WebSocket错误:', error.message);
        });
        
        ws.on('close', () => {
            console.log('Connection closed / 连接已关闭');
            console.log('ℹ️  ListenKey will expire automatically / ListenKey会自动过期');
        });
        
        // Handle Ctrl+C gracefully / 优雅处理Ctrl+C
        process.on('SIGINT', () => {
            console.log('\nClosing connection... / 关闭连接中...');
            ws.close();
            process.exit(0);
        });
        
        // Keep listenKey alive every 30 minutes / 每30分钟保活 listenKey
        const keepAliveInterval = setInterval(async () => {
            try {
                const signedParams = await signParamsWeb3(
                    { listenKey },
                    futuresV3Config.USER_ADDRESS,
                    futuresV3Config.SIGNER_ADDRESS,
                    futuresV3Config.PRIVATE_KEY
                );
                const qs = buildQueryString(signedParams);
                await axios.put(
                    `${config.restApiUrl}/fapi/v3/listenKey`,
                    qs,
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                );
                console.log('✓ ListenKey kept alive / ListenKey保持活跃');
            } catch (error) {
                console.error('Error keeping listenKey alive / 保持listenKey活跃错误:', error.message);
            }
        }, 30 * 60 * 1000); // 30 minutes / 30分钟
        
        // Clean up interval on close / 关闭时清理定时器
        ws.on('close', () => {
            clearInterval(keepAliveInterval);
        });
        
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

