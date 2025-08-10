module.exports = {
    type: "bubble",
    size: "mega",
    hero: {
      type: "image",
      url: "https://i.postimg.cc/pr7KhM5y/2.png",
      size: "full",
      aspectRatio: "3:2",
      aspectMode: "cover"
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        { type: "text", text: "🌱 基礎方案", weight: "bold", size: "lg", color: "#4e7699" },
        { type: "text", text: "LINE OA 開設 + 機器人 + 圖文選單設計", size: "sm", wrap: true, color: "#444444" },
        { type: "separator", margin: "md" },
        {
          type: "box",
          layout: "vertical",
          spacing: "xs",
          margin: "md",
          contents: [
            { type: "text", text: "• 官方帳號註冊 / 認證 / 歡迎訊息", size: "sm", wrap: true },
            { type: "text", text: "• 自動回覆機器人（基本回覆 / 關鍵字）", size: "sm", wrap: true },
            { type: "text", text: "• 圖文選單設計（6 格可客製）", size: "sm", wrap: true }
          ]
        }
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
            label: "查看內容明細",
            data: "action=view_plan&plan=basic"
            // 不設定 displayText → 聊天室不會出字
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
  