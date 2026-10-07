const express = require('express');
const path = require('node:path');

const app = express();
app.disable('x-powered-by'); // 避免揭露伺服器框架版本資訊

// 支援的語言頁面（對應 public/<slug>/index.html）
const LOCALES = ['zh-tw', 'en', 'ja', 'ko', 'es', 'pt'];
const DEFAULT_LOCALE = 'en';

// 將 Accept-Language 的語言標籤對應到網站語言
function matchLocale(tag) {
  const t = tag.toLowerCase();
  if (t.startsWith('zh')) return 'zh-tw';
  const base = t.split('-')[0];
  return LOCALES.includes(base) ? base : null;
}

function localeFromAcceptLanguage(header = '') {
  const tags = header.split(',')
    .map(part => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find(p => p.trim().startsWith('q='));
      return { tag, q: q ? Number.parseFloat(q.split('=')[1]) : 1 };
    })
    .filter(x => x.tag && x.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tags) {
    const loc = matchLocale(tag);
    if (loc) return loc;
  }
  return null;
}

function localeFromCookie(header = '') {
  const m = /(?:^|;\s*)tinyimage_lang=([\w-]+)/.exec(header);
  return m && LOCALES.includes(m[1]) ? m[1] : null;
}

// 首頁：依使用者選過的語言或瀏覽器語言導向，無法判斷時預設為英文
app.get('/', (req, res) => {
  res.set('Vary', 'Accept-Language, Cookie');
  const loc = localeFromCookie(req.headers.cookie)
    || localeFromAcceptLanguage(req.headers['accept-language'])
    || DEFAULT_LOCALE;
  res.redirect(302, `/${loc}/`);
});

// 圖片處理全部在瀏覽器端完成，伺服器只提供靜態檔案
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TinyImage 已啟動：http://localhost:${PORT}`);
});
