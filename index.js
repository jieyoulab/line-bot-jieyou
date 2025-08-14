//把 demo 的 parser 與 queue 相關程式移除，改為在事件處理時先讓 demo 模組嘗試處理；如果 demo 回傳 false，再跑你原本的商務邏輯（方案卡片等）
require("dotenv").config();
const express = require("express");
const { Client, middleware } = require("@line/bot-sdk");

// ❶ 引入 demo 模組（取代你原本內嵌的 parser/queue）
const { handleDemoEvent } = require('./demo');


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



    //方案列表（兩張總覽）
    if (action === 'line_oa_build') {
        return client.replyMessage(event.replyToken, {
          type: "flex",
          altText: "LINE 官方帳號建置",
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
  if (msg.trim() === "LINE 官方帳號建置") {
    return client.replyMessage(event.replyToken, {
        type: "flex",
        altText: "LINE 官方帳號建置",
        contents: plansMenuCarousel,
    });
  }


// 沒匹配到就回個提示（避免使用者以為壞掉）
  return Promise.resolve(null);
}


const port = process.env.PORT || 3006;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
