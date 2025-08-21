//把 demo 的 parser 與 queue 相關程式移除，改為在事件處理時先讓 demo 模組嘗試處理；如果 demo 回傳 false，再跑你原本的商務邏輯（方案卡片等）
require("dotenv").config();
const express = require("express");
const { Client, middleware } = require("@line/bot-sdk");

// ❶ 引入 demo 模組（取代你原本內嵌的 parser/queue）
const { handleDemoEvent } = require('./demo');


//Carousel為主 比較好擴充(Carousel 中可以有多個Bubble卡片)
const plansMenuCarousel   = require("./flex/carousel/plansMenuCarousel");

//Bubble 基礎方案
const basicOverviewBubble = require("./flex/basicOverviewBubble");
const basicDetailBubble = require("./flex/basicDetailBubble");

//Bubble 進階方案
const proOverviewBubble = require("./flex/proOverviewBubble");
const proDetailBubble   = require("./flex/proDetailBubble"); 

// 模組：首次加入好友：（品牌卡片 → 文字歡迎 → 快速導引需求選單）三連發所需模組
const welcomeBrandBubble  = require("./flex/welcomeBrandBubble"); //品牌slogan
const buildWelcomeText    = require("./flex/messages/welcomeText");//加入好友文字訊息
const needsVerticalBubble = require("./flex/needsVerticalBubble");//首次加入好友快速導引需求

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
  //  A) 先給 demo 模組嘗試處理
  const isDemoHandled = await handleDemoEvent(event, client);
  if (isDemoHandled) return; // demo 已處理，結束

  // B) 好友加入（或解除封鎖後再加入）→ 三連發
  if (event.type === "follow") {
    return handleFollow(event, client);
  }

  //C) Postback 分流
  // 1) 先處理 postback（不顯示文字、切換卡片）
  // Postback
  if (event.type === "postback") {
    const data = event.postback.data || "";
    console.log("POSTBACK:", data); 
    const p = new URLSearchParams(data);
    const action = p.get("action");
    const need   = p.get("need"); //剛加入好友，快速導引需求
    const plan = p.get("plan");

      // 保險：demo 相關一律交給 demo 模組
  //   if (action === "case_demo" || action === "query_land") {
  //     const handled = await handleDemoEvent(event, client);
  //     if (handled) return;
  //     await client.replyMessage(event.replyToken, { type: "text", text: "DEMO 僅限特定商家內測🙏" });
  //     return;
  // }

    // ①快速導引需求 need => 需求入口（新做的直式選單）
    if (action === "need") {
      if (need === "startup") {
        // 導到你既有的 LINE 方案總覽
        return client.replyMessage(event.replyToken, {
          type: "flex",
          altText: "LINE 官方帳號建置",
          contents: plansMenuCarousel
        });
      }
      if (need === "automation") {
        return client.replyMessage(event.replyToken, [
          { type: "text", text: "了解！我們可先初步討論目前貴公司繁瑣工作流程的痛點，將提供不同成本方案來導入流程自動化。" },
          { type: "text", text: "若方便，請先填寫需求表單，我們將盡快與您聯繫：\nhttps://docs.google.com/forms/d/e/1FAIpQLSdIWw7vChsH5jhvUPhjmOLotBqqwqu8zcoZJEc80zek_t-ARw/viewform" }
        ]);
      }
      if (need === "web_maintenance") {
        return client.replyMessage(event.replyToken, [
          { type: "text", text: "OK！我們支援您現有網站的維護與升級。" },
          { type: "text", text: "請提供目前網站連結與想改善的重點:\nhttps://docs.google.com/forms/d/e/1FAIpQLSdIWw7vChsH5jhvUPhjmOLotBqqwqu8zcoZJEc80zek_t-ARw/viewform🙏" }
        ]);
      }
      return Promise.resolve(null);
    }

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
  // D) 文字訊息（可手動觸發或接圖文選單「傳送訊息」）
  if (event.type === "message" && event.message.type === "text") {
    const msg = event.message.text || ""
    const lower = msg.toLowerCase();
    const trimmed = msg.trim();


    // 手動觸發三連發（中英都支援）
    if (["hi", "hello", "start"].includes(lower) || ["開始", "歡迎"].includes(trimmed)) {
      return handleFollow(event, client);
    }

    // 固定關鍵字
    if (trimmed === "LINE 官方帳號建置") {
      return client.replyMessage(event.replyToken, {
        type: "flex",
        altText: "LINE 官方帳號建置",
        contents: plansMenuCarousel
      });
    }

    // 沒匹配到
    return Promise.resolve(null);
  }
}
// ＝＝＝＝ Welcome Flow ＝＝＝＝

async function handleFollow(event, client) {
  const nickname = await getDisplayNameSafe(event, client);
  const accountName = process.env.ACCOUNT_NAME || "解憂工程";

  const messages = [
    // Step 1: 品牌卡片（Flex）
    {
      type: "flex",
      altText: "歡迎加入解憂工程所",
      contents: welcomeBrandBubble
    },
    // Step 2: 文字歡迎（帶暱稱）
    buildWelcomeText({ nickname, accountName }),
    // Step 3: 直式需求選單（Flex）
    {
      type: "flex",
      altText: "需求導引選單",
      contents: needsVerticalBubble
    }
  ];

  return client.replyMessage(event.replyToken, messages);
}

async function getDisplayNameSafe(event, client) {
  try {
    if (event.source && event.source.userId) {
      const profile = await client.getProfile(event.source.userId);
      return profile.displayName || "朋友";
    }
    return "朋友";
  } catch {
    return "朋友";
  }
}


const port = process.env.PORT || 3006;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
