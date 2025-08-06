const customSystem = {
  type: "carousel",
  contents: [
    {
      type: "bubble",
      hero: {
        type: "image",
        url: "https://i.imgur.com/SYY48E1.jpg",
        size: "full",
        aspectRatio: "3:2",
        aspectMode: "cover"
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        position: "relative",
        contents: [
          {
            type: "text",
            text: "「植牙」顧名思義就是「植入牙齒」的意思，只是這個牙齒並不是真正的牙齒，而是「人工牙根(植體)」加上假牙牙冠形成的牙齒。\n植牙手術過程在牙科治療中屬於較複雜、困難的手術...",
            wrap: true
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        flex: 0,
        spacing: "sm",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "✧ 一起認識植牙療程優缺點！",
              uri: "https://blog.dentco.tw/dentist-teeth-treatment/dental-implant-1/"
            },
            color: "#CCCDCD",
            height: "sm",
            style: "secondary",
            margin: "md"
          },
          {
            type: "button",
            action: {
              type: "uri",
              label: "✧ 植牙風險大解析！",
              uri: "https://blog.dentco.tw/dentist-teeth-treatment/dental-implant-fail/"
            },
            color: "#CCCDCD",
            height: "sm",
            style: "secondary",
            margin: "md"
          },
          {
            type: "button",
            action: {
              type: "message",
              label: "植牙治療 👉 術前術後衛教 👀",
              text: "[牙周植牙相關手術衛教]"
            },
            color: "#99b9d7",
            height: "sm",
            style: "primary",
            margin: "md"
          },
          {
            type: "text",
            text: "Powered by Dent&Co",
            size: "sm",
            color: "#C1C1C1",
            align: "center",
            gravity: "center",
            contents: [],
            margin: "md"
          }
        ]
      },
      styles: {
        header: {
          backgroundColor: "#2fb9ad"
        }
      }
    }
  ]
};

module.exports = customSystem;
