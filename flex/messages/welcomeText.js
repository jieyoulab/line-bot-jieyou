// messages/welcomeText.js
module.exports = function buildWelcomeText({ nickname, accountName }) {
    return {
      type: "text",
      text: `${nickname} 您好 👋
  我是 ${accountName}，專門協助品牌、團隊與創業者
  快速打造 LINE 報名／收單系統。
  
  感謝您加入我們的官方帳號 🌿
  這裡可以：
  📋 收集報名表單
  📥 自動存進 Google 試算表
  🔔 即時通知客人 & 管理者
  💰 整合 LINE Pay 安心收款
  
  👇 請選擇最符合您的需求！`
    };
  };
  