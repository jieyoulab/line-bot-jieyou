//切換頁籤

const fs = require('fs');
const path = require('path');


const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

async function api(p, init = {}) {
  // 自動為 ReadableStream body 補上 duplex: 'half'
  const needsDuplex =
    init.body &&
    typeof init.body === 'object' &&
    typeof init.body.pipe === 'function'; // 簡單判斷 Node Readable

  const res = await fetch('https://api.line.me' + p, {
    ...init,
    ...(needsDuplex ? { duplex: 'half' } : {}),
    headers: { Authorization: `Bearer ${TOKEN}`, ...(init.headers || {}) }
  });
  if (!res.ok) throw new Error(p + ' ' + res.status + ' ' + (await res.text()));
  return res;
}

const SIZE = { width: 2500, height: 1686 };
const TAB_H = 300, SP = 24, G = 24;
const COLW = [801, 801, 802];
const COLX = [24, 849, 1674];


const topTabs = () => ([
  { bounds: { x: 0,    y: 0, width: 833, height: TAB_H }, action: { type:'richmenuswitch', richMenuAliasId:'tab1', data:'switch=tab1' } },
  { bounds: { x: 833,  y: 0, width: 833, height: TAB_H }, action: { type:'richmenuswitch', richMenuAliasId:'tab2', data:'switch=tab2' } },
  { bounds: { x: 1666, y: 0, width: 834, height: TAB_H }, action: { type:'richmenuswitch', richMenuAliasId:'tab3', data:'switch=tab3' } },
]);

function areasTab1() { // 友誼推廣
  const row1Y = TAB_H + SP; const row1H = 540;
  const row2Y = row1Y + row1H + G; const row2W = 2500 - 2*SP; const row2H = 774;
  return [
    ...topTabs(),
    { bounds: { x: COLX[0], y: row1Y, width: COLW[0], height: row1H }, action: { type:'postback', data:'action=cooperate',   label:'長期合作洽談', displayText:'長期合作洽談' } },
    { bounds: { x: COLX[1], y: row1Y, width: COLW[1], height: row1H }, action: { type:'uri',      uri:'https://github.com/', label:'GitHub 作品集' } },
    { bounds: { x: COLX[2], y: row1Y, width: COLW[2], height: row1H }, action: { type:'postback', data:'action=qrcode',      label:'建置中(QRcode)', displayText:'建置中(QRcode)' } },
    { bounds: { x: SP,      y: row2Y, width: row2W,   height: row2H }, action: { type:'postback', data:'action=community',   label:'社群與評價', displayText:'社群與評價' } },
  ];
}


function areasTab2() { // 解憂服務（含地段查詢入口）
    const heroY = TAB_H + SP; const heroH = 720;
    const rowY  = heroY + heroH + G; const rowH  = 594; const heroW = 2500 - 2*SP;
    return [
      ...topTabs(),
      { bounds: { x: SP,      y: heroY, width: heroW,   height: heroH }, action: { type:'postback', data:'action=line_oa_build', label:'LINE OA 建置', displayText:'LINE 官方帳號建置' } },
      { bounds: { x: COLX[0], y: rowY,  width: COLW[0], height: rowH  }, action: { type:'postback', data:'action=site_build',     label:'形象網站建置', displayText:'形象網站建置' } },
      { bounds: { x: COLX[1], y: rowY,  width: COLW[1], height: rowH  }, action: { type:'postback', data:'action=site_maintain',  label:'現有網站維護', displayText:'現有網站維護' } },
    ];
}

function areasTab3() { // 案例展示
    const rowH = 657; const row1Y = TAB_H + SP; const row2Y = row1Y + rowH + G;
    return [
      ...topTabs(),
      { bounds: { x: COLX[0], y: row1Y, width: COLW[0], height: rowH }, action: { type:'postback', data:'action=case_crm',    label:'客戶數據', displayText:'客戶數據建置' } },
      { bounds: { x: COLX[1], y: row1Y, width: COLW[1], height: rowH }, action: { type:'postback', data:'action=case_booking', label:'預約系統', displayText:'預約系統建置' } },
      { bounds: { x: COLX[2], y: row1Y, width: COLW[2], height: rowH }, action: { type:'postback', data:'action=case_cart',    label:'購物車&金流', displayText:'購物車&金流' } },
      { bounds: { x: COLX[0], y: row2Y, width: COLW[0], height: rowH }, action: { type:'postback', data:'action=case_bizsite', label:'商家網站', displayText:'商家網站建置' } },
      { bounds: { x: COLX[1], y: row2Y, width: COLW[1], height: rowH }, action: { type:'postback', data:'action=case_ai',      label:'AI/自動化', displayText:'AI/自動化流程' } },
      { bounds: { x: COLX[2], y: row2Y, width: COLW[2], height: rowH }, action: { type:'postback', data:'action=case_demo',    label:'DEMO功能', displayText:'臨時功能測試區' } },
      { bounds: { x: COLX[2], y: row1Y,  width: COLW[2], height: rowH  }, action: { type:'postback', data:'action=open_query_intro', label:'桃園復興地段查詢', displayText:'查詢復興區地段' } },
    ];
}

async function createMenu(name, areas, imagePath) {
  const res = await api('/v2/bot/richmenu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ size: SIZE, selected: true, name, chatBarText: '功能選單', areas })
  });
  const { richMenuId } = await res.json();

  // 這裡 body 是 ReadableStream，api() 會自動補 duplex:'half'
  await api(`/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'image/png' },
    body: fs.createReadStream(path.resolve(imagePath))
  });
  return richMenuId;
}

async function setAlias(richMenuId, alias) {
  await api('/v2/bot/richmenu/alias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ richMenuAliasId: alias, richMenuId })
  });
}

async function setDefault(richMenuId) {
  await api('/v2/bot/user/all/richmenu/' + richMenuId, { method: 'POST' });
}

(async () => {
  try {
    const tab1Id = await createMenu('tab1_友誼推廣', areasTab1(), './public/richmenu/tab1.png'); await setAlias(tab1Id, 'tab1');
    const tab2Id = await createMenu('tab2_解憂服務', areasTab2(), './public/richmenu/tab2.png'); await setAlias(tab2Id, 'tab2');
    const tab3Id = await createMenu('tab3_案例展示', areasTab3(), './public/richmenu/tab3.png'); await setAlias(tab3Id, 'tab3');

    // 設 tab2 為預設
    await setDefault(tab2Id);

    console.log('✅ rich menus ready:', { tab1Id, tab2Id, tab3Id, default: 'tab2(解憂服務)' });
  } catch (e) {
    console.error('❌ setup failed:', e.message || e);
  }
})();