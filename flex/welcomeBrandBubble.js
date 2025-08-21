// flex/welcomeBrandBubble.js
module.exports = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      justifyContent: "center",
      contents: [
        {
          type: "text",
          text: "🌿 解憂工程所 Jieyou Lab",
          weight: "bold",
          size: "lg",
          align: "center",
          color: "#2C4A52"
        },
        {
          type: "text",
          text: "Code to calm. Build to heal.",
          size: "sm",
          color: "#4E7699",
          margin: "sm",
          align: "center"
        },
        {
          type: "text",
          text: "- 技術因需求而活，需求因想像而生 -",
          size: "sm",
          color: "#4e7699",
          wrap: true,
          margin: "sm",
          align: "center"
        }
      ],
      paddingAll: "20px"
    }
  };
  