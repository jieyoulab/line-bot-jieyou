module.exports = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        { type: "text", text: "🌱 基礎方案｜內容明細", weight: "bold", size: "lg", color: "#4e7699" },
        { type: "text", text: "內容明細與加購項目", size: "xs", color: "#888888" },
        { type: "separator", margin: "md" },
  
        { type: "text", text: "1️⃣ LINE 官方帳號開設", weight: "bold", size: "sm", margin: "md" },
        {
          type: "box",
          layout: "vertical",
          spacing: "xs",
          contents: [
            { type: "text", text: "✅ 協助註冊 / 認證 / 歡迎訊息設定", size: "sm", wrap: true },
            { type: "text", text: "建議價格：NT$1,500 起", size: "xs", align: "end", color: "#4e7699" }
          ]
        },
  
        { type: "separator", margin: "md" },
        { type: "text", text: "2️⃣ LINE 自動回覆機器人", weight: "bold", size: "sm", margin: "md" },
        {
          type: "box",
          layout: "vertical",
          spacing: "xs",
          contents: [
            { type: "text", text: "✅ 建置與部署：串接 API、雲端部署", size: "sm", wrap: true },
            { type: "text", text: "✅ 功能串接與測試：第三方整合 / 穩定測試", size: "sm", wrap: true },
            { type: "text", text: "建置：NT$3,000～8,000｜串接：NT$2,000", size: "xs", align: "end", color: "#4e7699" }
          ]
        },
  
        { type: "separator", margin: "md" },
        { type: "text", text: "3️⃣ 圖文選單 / 訊息卡片", weight: "bold", size: "sm", margin: "md" },
        {
          type: "box",
          layout: "vertical",
          spacing: "xs",
          contents: [
            { type: "text", text: "✅ 圖文選單設計：圖示、點擊區域", size: "sm", wrap: true },
            { type: "text", text: "➕ 加購格數：+2格 / +4格 / +6格", size: "sm", wrap: true },
            { type: "text", text: "✅ 訊息卡片設計：訊息 / 商品方案卡", size: "sm", wrap: true },
            { type: "text", text: "選單：NT$3,000（基本）", size: "xs", align: "end", color: "#4e7699" },
            { type: "text", text: "加購：+$500 / +$1,000 / +$1,500", size: "xs", align: "end", color: "#4e7699" },
            { type: "text", text: "卡片：NT$2,500～5,000/張", size: "xs", align: "end", color: "#4e7699" }
          ]
        },
  
        { type: "separator", margin: "md" },
        { type: "text", text: "方案參考價：NT$12,000 起（不含伺服器費用）", size: "sm", align: "end", color: "#4e7699", wrap: true }
      ]
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      paddingAll: "12px",
      contents: [
        {
          type: "button",
          style: "primary",
          color: "#9db0c1",
          action: {
            type: "postback",
            label: "⬅️ 回方案列表",
            data: "action=view_plan_list"
          }
        },
        {
          type: "button",
          style: "primary",
          color: "#4e7699",
          action: {
            type: "uri",
            label: "📝 填寫需求表單",
            uri: "https://docs.google.com/forms/d/e/1FAIpQLSdIWw7vChsH5jhvUPhjmOLotBqqwqu8zcoZJEc80zek_t-ARw/viewform"
          }
        }
      ]
    },
    styles: { footer: { separator: true } }
  };
  