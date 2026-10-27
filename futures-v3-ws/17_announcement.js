/**
 * Futures V3 Announcement Events / 期货V3 公告事件
 * Stream: <listenKey>  (user data stream)
 *
 * Receives two types of announcement events pushed via the user data stream:
 * 通过用户数据流接收两种公告事件推送：
 *
 *   Public Announcement  (公共公告)  — category != "DIRECT"
 *     e.g. NEW_LISTING, ACTIVITY, UPDATES, DELISTING
 *
 *   Direct Announcement  (个人消息)  — category == "DIRECT"
 *     Targeted messages sent directly to the current user
 *     发送给当前用户的定向消息
 *
 * Payload fields / 消息字段:
 *   e       — 事件类型: announcement
 *   en      — 英文公告内容 / English content
 *   zh      — 中文公告内容 / Chinese content
 *   *.i     — 公告 ID
 *   *.t     — 标题
 *   *.s     — 副标题
 *   *.c     — 分类 (NEW_LISTING / ACTIVITY / UPDATES / DELISTING / DIRECT)
 *   *.d     — 发布时间戳 (ms)
 *   *.S     — 是否已读 (false=未读)
 *   *.j     — 跳转链接 URL
 *   *.C     — 公告正文 (HTML)
 */

const WebSocket = require('ws');
const axios     = require('axios');
const path      = require('path');

const futuresV3Config = require(path.join(__dirname, '../futures-v3-demo/config.js'));
const { signParamsWeb3, buildQueryString } = require(path.join(__dirname, '../futures-v3-demo/utils.js'));

const config = {
    baseUrl:    'wss://fstream.asterdex.com/ws',
    restApiUrl: futuresV3Config.BASE_URL,
};

async function createListenKey() {
    try {
        console.log('Creating listenKey... / 创建 listenKey 中...\n');

        const signedParams = await signParamsWeb3(
            {},
            futuresV3Config.USER_ADDRESS,
            futuresV3Config.SIGNER_ADDRESS,
            futuresV3Config.PRIVATE_KEY
        );
        const qs = buildQueryString(signedParams);

        const res = await axios.post(
            `${config.restApiUrl}/fapi/v3/listenKey`,
            qs,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (res.data && res.data.listenKey) {
            console.log('✓ ListenKey created / ListenKey 创建成功');
            console.log(`ListenKey: ${res.data.listenKey}\n`);
            return res.data.listenKey;
        }
        throw new Error('No listenKey in response / 响应中无 listenKey');
    } catch (error) {
        console.error('Error creating listenKey / 创建 listenKey 失败:',
            error.response ? JSON.stringify(error.response.data) : error.message);
        throw error;
    }
}

async function connectAnnouncementStream() {
    try {
        const listenKey = await createListenKey();
        const streamUrl = `${config.baseUrl}/${listenKey}`;

        console.log(`Connecting to ${streamUrl}...\n`);
        console.log('Listening for announcement events... / 监听公告事件中...\n');

        const ws = new WebSocket(streamUrl);

        ws.on('open', () => console.log('✓ Connected / 已连接\n'));

        ws.on('message', (data) => {
            const msg = JSON.parse(data.toString());

            // Only process announcement events / 只处理公告事件
            if (msg.e !== 'announcement') return;

            const isDirect = msg.en?.c === 'DIRECT' || msg.zh?.c === 'DIRECT';
            const label    = isDirect ? '📩 Direct Announcement / 个人消息' : '📢 Public Announcement / 公共公告';

            console.log('─────────────────────────────────────────');
            console.log(label);
            console.log(`ID       : ${msg.en?.i}`);
            console.log(`Category / 分类   : ${msg.en?.c}`);
            console.log(`Title EN / 英文标题: ${msg.en?.t}`);
            console.log(`Title ZH / 中文标题: ${msg.zh?.t}`);
            console.log(`Subtitle / 副标题  : ${msg.zh?.s}`);
            console.log(`Link     / 链接    : ${msg.en?.j}`);
            console.log(`Time     / 时间    : ${new Date(msg.en?.d).toISOString()}`);
            console.log(`Read     / 已读    : ${msg.en?.S}`);
            console.log('Full payload / 完整数据:');
            console.log(JSON.stringify(msg, null, 2));
            console.log('─────────────────────────────────────────\n');
        });

        ws.on('error', (err) => console.error('Error / 错误:', err.message));
        ws.on('close', () => console.log('Closed / 已关闭'));

        // Keep listenKey alive every 30 minutes / 每30分钟保活 listenKey
        const keepAlive = setInterval(async () => {
            try {
                const sp = await signParamsWeb3(
                    { listenKey },
                    futuresV3Config.USER_ADDRESS,
                    futuresV3Config.SIGNER_ADDRESS,
                    futuresV3Config.PRIVATE_KEY
                );
                await axios.put(
                    `${config.restApiUrl}/fapi/v3/listenKey`,
                    buildQueryString(sp),
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                );
                console.log('✓ ListenKey kept alive / ListenKey保持活跃');
            } catch (e) {
                console.error('Keep-alive error / 保活错误:', e.message);
            }
        }, 30 * 60 * 1000);

        ws.on('close', () => clearInterval(keepAlive));

        process.on('SIGINT', () => { ws.close(); process.exit(0); });

    } catch (error) {
        console.error('Failed to connect / 连接失败:', error.message);
        process.exit(1);
    }
}

if (require.main === module) connectAnnouncementStream();
module.exports = connectAnnouncementStream;
