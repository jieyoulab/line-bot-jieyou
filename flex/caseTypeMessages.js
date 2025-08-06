// flexMessages.js

module.exports = {
    featureSelection: {
      type: "flex",
      altText: "請選擇您需要的功能！",
      contents: {
        type: "bubble",
        size: "mega",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            {
              type: "text",
              text: "請問您需要哪些功能？",
              weight: "bold",
              size: "md",
              wrap: true,
            },
            {
              type: "text",
              text: "（可多選，點一下就會紀錄）",
              size: "sm",
              color: "#888888",
              wrap: true,
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              action: {
                type: "message",
                label: "✔️ 建立報名表單",
                text: "我需要報名表單"
              },
              style: "secondary"
            },
            {
              type: "button",
              action: {
                type: "message",
                label: "💳 整合 LINE Pay",
                text: "我需要 LINE Pay"
              },
              style: "secondary"
            },
            {
              type: "button",
              action: {
                type: "message",
                label: "🔔 自動通知客人",
                text: "我需要自動通知"
              },
              style: "secondary"
            }
          ]
        }
      }
    }
  };
  