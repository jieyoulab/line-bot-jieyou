require("dotenv").config();
const express = require("express");
const { Client, middleware } = require("@line/bot-sdk");

//// flex bubbles
//const flexMessages = require("./flex/caseTypeMessages")
// const customSystem = require("./flex/customSystem");
// const productPlanCarousel = require("./flex/productPlanCarousel");
const basicOverviewBubble = require("./flex/basicOverviewBubble");
const basicDetailBubble = require("./flex/basicDetailBubble");

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

  

//
// --- handlers ---
// 回覆邏輯
function handleEvent(event) {
  // 1) 先處理 postback（不顯示文字、切換卡片）（切換 總覽 <-> 詳細；不顯示文字）
  if (event.type === "postback") {
    const p = new URLSearchParams(event.postback.data || "");
    const action = p.get("action");
    const plan = p.get("plan");

    if (plan === "basic") {
      if (action === "view_plan") {
        return client.replyMessage(event.replyToken, {
          type: "flex",
          altText: "🌱 基礎啟動包（詳細）",
          contents: basicDetailBubble
        });
      }
      if (action === "view_plan_overview") {
        return client.replyMessage(event.replyToken, {
          type: "flex",
          altText: "🌱 基礎啟動包（總覽）",
          contents: basicOverviewBubble
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

  const msg = event.message.text.trim();

  // 點圖文選單（傳訊息：客製化系統）→ 送出總覽卡
  if (msg === "客製化系統") {
    return client.replyMessage(event.replyToken, {
      type: "flex",
      altText: "客製化介紹",
      contents: basicOverviewBubble, //flex msg檔案 
    });
  }


  // 其他可以自己加更多分流條件

//   return client.replyMessage(event.replyToken, {
//     type: "text",
//     text: `您傳來的是：${event.message.text}`,
//   });
 
  return Promise.resolve(null);

}


const port = process.env.PORT || 3006;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
