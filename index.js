//把 demo 的 parser 與 queue 相關程式移除，改為在事件處理時先讓 demo 模組嘗試處理；如果 demo 回傳 false，再跑你原本的商務邏輯（方案卡片等）
require("dotenv").config();
const express = require("express");
const { Client, middleware } = require("@line/bot-sdk");

// ❶ 引入 demo 模組（取代你原本內嵌的 parser/queue）
const { handleDemoEvent } = require('./demo');

//const { crawlQueue } = require('./queue'); // 引入 queue 連 Upstash
        //立即函式 爬蟲worker
        // (async () => {
        //     await crawlQueue.add('test-job', { message: 'Hello from Line Bot!' });
        //     console.log('✅ Job queued');
        // })();


//Carousel為主 比較好擴充
const plansMenuCarousel   = require("./flex/carousel/plansMenuCarousel");

//基礎方案
const basicOverviewBubble = require("./flex/basicOverviewBubble");
const basicDetailBubble = require("./flex/basicDetailBubble");

//進階方案
const proOverviewBubble = require("./flex/proOverviewBubble");
const proDetailBubble   = require("./flex/proDetailBubble"); 

const app = express();

//LINE 的 SDK middleware 會自己解析 req.body 並驗證簽章
//別在全域 app.use(express.json())，避免影響 /webhook 的簽章驗證；若有自訂 API 再針對單一路由掛上 express.json()
//app.use(express.json()); // 不需要，middleware 已處理

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};


const client = new Client(config);

//API 區
// 首頁 
// health check
app.get("/", (req, res) => {
    res.send("Jieyou LINE Bot is running!");
  });

  
// webhook 接收與處理 ==> 就像一個「總路由器 (router)」
app.post("/webhook", middleware(config), (req, res) => {
    // 加入這段處理 LINE 的空事件驗證請求
    if (!req.body.events || req.body.events.length === 0) {
      return res.status(200).send("OK (ping check)");
    }
  
    Promise.all(req.body.events.map(handleEvent))
      .then((result) => res.json(result))
      .catch((err) => {
        console.error("webhook error", err);
        res.status(500).end();
      });
  });

// // ---- utils: robust parser ----
// function toHalfWidthDigits(s = '') {
//     // 全形數字轉半形：０-９ -> 0-9
//     return s.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFF10 + 0x30));
// }
  
// function parseSectionAndLandNo(raw = '') {
//     const msg = toHalfWidthDigits(String(raw).trim());
  
//     // 允許：空白(含全形)、各種連字號、波浪等；段名允許「段」「小段」「…小段」等結尾形式
//     // 盡量把「第一個數字」當作段名與地號的分界
//     const re = /^(.+?段(?:[^\d０-９]*)?)\s*([0-9]{1,4})(?:[ \u3000\-–—~～]*([0-9]{1,4}))?$/;
  
//     const m = msg.match(re);
//     if (!m) return null;
  
//     const section = m[1].trim();     // e.g. "大利段"
//     const no1 = m[2];                // e.g. "1300"
//     const no2 = (m[3] || '').trim(); // e.g. "0000" or ''
  
//     const landNo = no2 ? `${no1}-${no2}` : no1; // 統一傳給 worker，worker 再二次 normalize 也OK
//     return { section, landNo };
// }  

//
// --- handlers ---
// 回覆邏輯
async function handleEvent(event) {
  // ❷ 先交給 demo 模組處理
  const isDemoHandled = await handleDemoEvent(event, client);
  if (isDemoHandled) return; // demo 已處理，結束


  // 1) 先處理 postback（不顯示文字、切換卡片）
  // Postback
  if (event.type === "postback") {
    const data = event.postback.data || "";
    console.log("POSTBACK:", data); 
    const p = new URLSearchParams(data);
    const action = p.get("action");
    const plan = p.get("plan");

    // ===DEMO 功能入口：跳出 Quick Reply ===
    // if (action === "case_demo") {
    //   return client.replyMessage(event.replyToken, {
    //     type: "text",
    //     text: "💬以下DEMO功能清單，請選擇：⤵️",
    //     quickReply: {//最多可以13個
    //       items: [
    //         // A) 正式路徑：引導使用者輸入（postback）=>
    //         {
    //           type: "action",
    //           action: {
    //             type: "postback",
    //             label: "「查詢圖資」",
    //             data: "action=query_land",
    //             displayText: "查詢圖資"
    //           }
    //         },
    //         // B) 其他懸浮按鈕服務 
    //         {
    //           type: "action",
    //           action: { type: "message", label: "DEMO：服務二", text: "服務二" }
    //         },
    //         {
    //           type: "action",
    //           action: { type: "message", label: "DEMO：服務三", text: "服務三" }
    //         }
    //       ]
    //     }
    //   });
    // }
    // const data = event.postback.data || "";
    // const p = new URLSearchParams(data);
    // const action = p.get("action");
    // const plan = p.get("plan");

    // // === DEMO 功能入口：跳出 Quick Reply ===
    // //地段地號

    // // ★ from Rich Menu Tab2 內容區：開查詢指引（Flex + Quick Reply）
    // if (action === "open_query_intro") {
    //     const introFlex = {
    //     type: "flex",
    //     altText: "地段查詢指引",
    //     contents: {
    //         type: "bubble",
    //         body: {
    //         type: "box",
    //         layout: "vertical",
    //         contents: [
    //             { type: "text", text: "地段查詢指引", weight: "bold", size: "lg" },
    //             { type: "text", text: "目前只開放：桃園市・復興區", size: "sm", color: "#888888", margin: "sm" },
    //             { type: "separator", margin: "md" },
    //             { type: "text", text: "請輸入：地段 + 地號", size: "sm", margin: "md" },
    //             { type: "text", text: "範例：大灣段 0000 或 大利段 0000-0000", size: "sm", color: "#555555", wrap: true }
    //         ]
    //         }
    //     },
    //     quickReply: {
    //         items: [
    //         {
    //             type: "action",
    //             action: {
    //             type: "postback",
    //             label: "查詢復興區地段",
    //             data: "action=query_land",
    //             displayText: "查詢復興區地段"
    //             }
    //         }
    //         ]
    //     }
    //     };
    //     return client.replyMessage(event.replyToken, introFlex);
    // }

    // ★ 點「查詢圖資」→ 立即要求使用者輸入
    // if (action === "query_land") {
    //     return client.replyMessage(event.replyToken, {
    //     type: "text",
    //     text:
    // `📢 目前只有：桃園市 復興區圖資查詢
    // 請輸入「地段 地號」，例如：
    // ・美麗段 0000
    // ・美麗段 0000-0000
    // `
    //     });
    // }

    //方案列表（兩張總覽）
    if (action === 'line_oa_build') {
        return client.replyMessage(event.replyToken, {
          type: "flex",
          altText: "LINE 官方帳號建置",
          contents: plansMenuCarousel
        });
      }


    // 回方案列表（兩張總覽）
    // if (action === "view_plan_list") {
    //     return client.replyMessage(event.replyToken, {
    //       type: "flex",
    //       altText: "方案列表（基礎／進階）",
    //       contents: plansMenuCarousel
    //     });
    //   }

    // 基礎方案
    if (plan === "basic") {
      if (action === "view_plan") {
        return client.replyMessage(event.replyToken, {
          type: "flex",
          altText: "🌱 基礎方案（內容明細）",
          contents: basicDetailBubble
        });
      }
      if (action === "view_plan_overview") {
        return client.replyMessage(event.replyToken, {
          type: "flex",
          altText: "🌱  基礎方案（總覽）",
          contents: basicOverviewBubble
        });
      }
    }

    // ★ 進階方案 postback
    if (plan === "pro") {
        if (action === "view_plan") {
          return client.replyMessage(event.replyToken, {
            type: "flex",
            altText: "🔄 進階方案（內容明細）",
            contents: proDetailBubble
          });
        }
        if (action === "view_plan_overview") {
          return client.replyMessage(event.replyToken, {
            type: "flex",
            altText: "🔄 進階方案（總覽）",
            contents: proOverviewBubble
          });
        }
      }
    // 其他未定義的 postback 就先忽略
    return Promise.resolve(null);
  }

  // 2) 再處理文字訊息（給你測試或接圖文選單「傳送訊息」）
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  const msg = event.message.text;

  // 先處理你的固定關鍵字
  if (msg.trim() === "LINE 官方帳號建置") {
    return client.replyMessage(event.replyToken, {
        type: "flex",
        altText: "LINE 官方帳號建置",
        contents: plansMenuCarousel,
    });
  }


  // 解析「段名 + 地號」：空白可無、可全形、可含後四碼
  /// ★ 新：用穩健解析器
//   const parsed = parseSectionAndLandNo(msg);
//   if (parsed) {
//     const { section, landNo } = parsed;

//     await crawlQueue.add('crawl-land-info', {
//         city: '桃園市',       // 你目前只開放復興區
//         district: '復興區',
//         section,             // e.g. "段"
//         landNo,              // e.g. "1111" 或 "1111-0000"
//         userId: event.source.userId //重要
//     });

//     return client.replyMessage(event.replyToken, {
//         type: 'text',
//         text: `🔍已收到您的查詢：【${section} ${landNo}】，稍後回覆結果，請您耐心等候🔜🔜⤵️⤵️`
//   });
// }
// 沒匹配到就回個提示（避免使用者以為壞掉）
  return Promise.resolve(null);
}


const port = process.env.PORT || 3006;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
