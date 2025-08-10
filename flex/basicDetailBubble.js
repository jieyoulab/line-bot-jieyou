module.exports = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        { type: "text", text: "🌱 基礎啟動包｜詳細內容", weight: "bold", size: "lg", color: "#4e7699" },
        { type: "text", text: "分段明細與加購項目", size: "xs", color: "#888888" },
        { type: "separator", margin: "md" },
  
        { type: "text", text: "1) LINE 官方帳號開設", weight: "bold", size: "sm", margin: "md" },
        {
          type: "box",
          layout: "vertical",
          spacing: "xs",
          contents: [
            { type: "text", text: "✅ 協助註冊 / 認證 / 歡迎訊息設定", size: "sm", wrap: true },
            { type: "text", text: "建議價格：NT$1,500 起", size: "xs", align: "end", color: "#4e7699" }
          ]
        },
  
        { type: "text", text: "2) LINE 自動回覆機器人", weight: "bold", size: "sm", margin: "md" },
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
  
        { type: "text", text: "3) 圖文選單 / 訊息卡片", weight: "bold", size: "sm", margin: "md" },
        {
          type: "box",
          layout: "vertical",
          spacing: "xs",
          contents: [
            { type: "text", text: "✅ 圖文選單設計：圖示、點擊區域、風格一致", size: "sm", wrap: true },
            { type: "text", text: "➕ 加購格數：+2格 / +4格 / +6格", size: "sm", wrap: true },
            { type: "text", text: "✅ 訊息卡片設計：商品 / 方案卡", size: "sm", wrap: true },
            { type: "text", text: "選單：NT$3,000（基本）｜加購：+$500 / +$1,000 / +$1,500｜卡片：NT$2,500～5,000/張", size: "xs", align: "end", color: "#4e7699" }
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
          style: "secondary",
          action: {
            type: "postback",
            label: "⬅️ 回總覽",
            data: "action=view_plan_overview&plan=basic",
            displayText: "回：🌱 基礎啟動包"
          }
        },
        {
          type: "button",
          style: "primary",
          action: { type: "uri", label: "📝 立即填單", uri: "https://docs.google.com/forms/..." },
          color: "#4e7699"
        }
      ]
    },
    styles: { footer: { separator: true } }
  };
  