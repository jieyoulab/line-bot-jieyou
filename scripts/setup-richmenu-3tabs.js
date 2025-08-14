// scripts/setup-richmenu-3tabs.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
if (!TOKEN) {
  console.error('❌ Missing LINE_CHANNEL_ACCESS_TOKEN in env');
  process.exit(1);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function isReadableStream(x) { return x && typeof x === 'object' && typeof x.pipe === 'function'; }

// ✅ 這裡改：/content 走 api-data，其餘走 api
function pickBase(p) {
  return p.includes('/richmenu/') && p.endsWith('/content')
    ? 'https://api-data.line.me'
    : 'https://api.line.me';
}

async function api(p, init = {}) {
  const base = pickBase(p);
  const full = base + p;
  const opts = {
    ...init,
    ...(isReadableStream(init.body) ? { duplex: 'half' } : {}),
    headers: { Authorization: `Bearer ${TOKEN}`, ...(init.headers || {}) }
  };
  const res = await fetch(full, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(`${full} ${res.status} ${text}`);
  try { return { res, json: JSON.parse(text), text }; } catch { return { res, json: null, text }; }
}

// ---- Layout config ----
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

function areasTab2() { // 解憂服務
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
  ];
}

async function waitUntilExists(richMenuId, tries = 8) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await api(`/v2/bot/richmenu/${richMenuId}`, { method: 'GET' });
      console.log('🔎 verify richmenu exists:', richMenuId, 'status', r.res.status);
      return;
    } catch (e) {
      const is404 = String(e.message).includes('404');
      const wait = 500 + i * 1500; // 0.5s, 2.0s, 3.5s, 5.0s, ...
      console.log(`⏳ wait ${wait}ms (GET richmenu ${is404 ? '404' : 'err'}, retry ${i + 1}/${tries})`);
      await sleep(wait);
      if (!is404 && i >= 2) throw e; // 連續非 404 的錯誤就別等了
    }
  }
  throw new Error(`richmenu ${richMenuId} still 404 after retries`);
}

async function uploadImageWithRetry(richMenuId, imagePath, tries = 8) {
  const imgPath = path.resolve(imagePath);
  if (!fs.existsSync(imgPath)) throw new Error(`Image not found: ${imgPath}`);
  const buf = fs.readFileSync(imgPath);

  for (let i = 0; i < tries; i++) {
    try {
      const r = await api(`/v2/bot/richmenu/${richMenuId}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'image/png', 'Content-Length': String(buf.length) },
        body: buf,
      });
      console.log('🖼️  uploaded image status', r.res.status, '→', richMenuId);
      return;
    } catch (e) {
      if (String(e.message).includes('404') && i < tries - 1) {
        const wait = 800 + i * 2000;
        console.log(`⏳ wait ${wait}ms (content 404, retry ${i + 1}/${tries})`);
        await sleep(wait);
        continue;
      }
      throw e;
    }
  }
  throw new Error(`content upload still 404 after ${tries} tries`);
}

// ---- Core ops ----
async function createMenu(name, areas, imagePath) {
  // 1) 建立
  const created = await api('/v2/bot/richmenu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ size: SIZE, selected: true, name, chatBarText: '功能選單', areas }),
  });
  const richMenuId = created.json?.richMenuId;
  if (!richMenuId) throw new Error(`No richMenuId returned for ${name}. raw=${created.text}`);
  console.log('🆕 created:', name, richMenuId);

  // 2) 等到 LINE 端能讀到
  await waitUntilExists(richMenuId);

  // 3) 上傳圖片（拉長退避）
  await uploadImageWithRetry(richMenuId, imagePath);

  return richMenuId;
}

async function setAlias(richMenuId, alias) {
  try {
    await api('/v2/bot/richmenu/alias', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ richMenuAliasId: alias, richMenuId })
    });
    console.log('🏷️ alias created', alias, '→', richMenuId);
  } catch (e) {
    if (String(e.message).includes('409')) {
      console.log('♻️ alias exists, replace:', alias);
      await api(`/v2/bot/richmenu/alias/${alias}`, { method:'DELETE' });
      await api('/v2/bot/richmenu/alias', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ richMenuAliasId: alias, richMenuId })
      });
      console.log('🔁 alias replaced', alias, '→', richMenuId);
    } else {
      throw e;
    }
  }
}

async function setDefault(richMenuId) {
  await api('/v2/bot/user/all/richmenu/' + richMenuId, { method:'POST' });
  console.log('⭐ default set to', richMenuId);
}

// ---- Run all ----
(async () => {
  try {
    const tab1Id = await createMenu('tab1_友誼推廣', areasTab1(), './public/richmenu/tab1.png');
    await setAlias(tab1Id, 'tab1');

    const tab2Id = await createMenu('tab2_解憂服務', areasTab2(), './public/richmenu/tab2.png');
    await setAlias(tab2Id, 'tab2');

    const tab3Id = await createMenu('tab3_案例展示', areasTab3(), './public/richmenu/tab3.png');
    await setAlias(tab3Id, 'tab3');

    await setDefault(tab2Id); // 先讓 tab2 出現在所有用戶

    console.log('✅ rich menus ready:', { tab1Id, tab2Id, tab3Id, default: 'tab2(解憂服務)' });
    console.log('👉 在手機與 Bot 的一對一聊天發一句話，關掉再打開/下拉刷新，就會看到上方可切換的三個分頁。');
  } catch (e) {
    console.error('❌ setup failed:', e.message || e);
    process.exit(1);
  }
})();
