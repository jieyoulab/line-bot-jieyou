require("dotenv").config();
const express = require("express");
const { Client, middleware } = require("@line/bot-sdk");

const { crawlQueue } = require('./queue'); // 引入 queue 連 Upstash

        // (async () => {
        //     await crawlQueue.add('test-job', { message: 'Hello from Line Bot!' });
        //     console.log('✅ Job queued');
        // })();

//// flex bubbles
//const flexMessages = require("./flex/caseTypeMessages")
// const customSystem = require("./flex/customSystem");
// const productPlanCarousel = require("./flex/productPlanCarousel");

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

// 首頁 
// health check
app.get("/", (req, res) => {
    res.send("Jieyou LINE Bot is running!");
  });

// webhook 接收與處理
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

// ---- utils: robust parser ----
function toHalfWidthDigits(s = '') {
    // 全形數字轉半形：０-９ -> 0-9
    return s.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFF10 + 0x30));
}
  
function parseSectionAndLandNo(raw = '') {
    const msg = toHalfWidthDigits(String(raw).trim());
  
    // 允許：空白(含全形)、各種連字號、波浪等；段名允許「段」「小段」「…小段」等結尾形式
    // 盡量把「第一個數字」當作段名與地號的分界
    const re = /^(.+?段(?:[^\d０-９]*)?)\s*([0-9]{1,4})(?:[ \u3000\-–—~～]*([0-9]{1,4}))?$/;
  
    const m = msg.match(re);
    if (!m) return null;
  
    const section = m[1].trim();     // e.g. "大利段"
    const no1 = m[2];                // e.g. "1306"
    const no2 = (m[3] || '').trim(); // e.g. "0000" or ''
  
    const landNo = no2 ? `${no1}-${no2}` : no1; // 統一傳給 worker，worker 再二次 normalize 也OK
    return { section, landNo };
}  

//
// --- handlers ---
// 回覆邏輯
async function handleEvent(event) {
  // 1) 先處理 postback（不顯示文字、切換卡片）
  // Postback：切換明細 / 回總覽 / 回列表
  if (event.type === "postback") {
    const p = new URLSearchParams(event.postback.data || "");
    //// view_plan / view_plan_overview / view_plan_list
    const action = p.get("action");
    const plan = p.get("plan");

    // 回方案列表（兩張總覽）
    if (action === "view_plan_list") {
        return client.replyMessage(event.replyToken, {
          type: "flex",
          altText: "方案列表（基礎／進階）",
          contents: plansMenuCarousel
        });
      }

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
  if (msg.trim() === "客製化系統") {
    return client.replyMessage(event.replyToken, {
        type: "flex",
        altText: "方案列表（基礎／進階）",
        contents: plansMenuCarousel,
    });
  }


  // 解析「段名 + 地號」：空白可無、可全形、可含後四碼
  /// ★ 新：用穩健解析器
  const parsed = parseSectionAndLandNo(msg);
  if (parsed) {
    const { section, landNo } = parsed;

    await crawlQueue.add('crawl-land-info', {
        city: '桃園市',       // 你目前只開放復興區
        district: '復興區',
        section,             // e.g. "大利段"
        landNo,              // e.g. "1306" 或 "1306-0000"
        userId: event.source.userId //重要
    });

    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `🔍收到您的查詢：【${section} ${landNo}】，稍後會回覆結果🔜🔜⤵️⤵️`
  });
}
// 沒匹配到就回個提示（避免使用者以為壞掉）
return client.replyMessage(event.replyToken, {
    type: 'text',
    text: '請輸入想查詢的地段地號格式：\n「大利段 0000」或「大利段0000-0000」'
  });
//   return client.replyMessage(event.replyToken, {
//     type: "text",
//     text: `您傳來的是：${event.message.text}`,
//   });
 
  //return Promise.resolve(null);
}


const port = process.env.PORT || 3006;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
