// 產生各語言靜態頁面、x-default 語言選擇頁、sitemap.xml 與執行期 i18n.js
// 用法：npm run build（修改 templates/ 或 locales/ 後執行，並一併提交產生的檔案）
const fs = require('node:fs');
const path = require('node:path');

const SITE = 'https://tinyimage.eat2die.com';
const VERSION = '20261007-5'; // CSS／JS 快取版本參數，修改 style.css 或 script.js 時一併更新
const LOCALE_ORDER = ['zh-tw', 'en', 'ja', 'ko', 'es', 'pt'];

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const locales = LOCALE_ORDER.map(slug => require(path.join(root, 'locales', `${slug}.js`)));
const template = fs.readFileSync(path.join(root, 'templates', 'page.html'), 'utf8');

const pageUrl = loc => `${SITE}/${loc.slug}/`;
// x-default 指向預設語言（英文）頁面；/ 會 302 導向，不能作為 hreflang 目標
const X_DEFAULT_URL = `${SITE}/en/`;

function esc(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function lookup(data, keyPath) {
  const value = keyPath.split('.').reduce((obj, k) => obj?.[k], data);
  if (value === undefined) throw new Error(`模板變數不存在：${keyPath}`);
  return value;
}

// {{{key}}} 原樣輸出 HTML，{{key}} 做 HTML 跳脫
function render(tpl, data) {
  return tpl
    .replaceAll(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, k) => lookup(data, k))
    .replaceAll(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => esc(lookup(data, k)));
}

const indent = (n, lines) => lines.map(l => ' '.repeat(n) + l).join('\n');

function hreflangLinks() {
  return indent(4, [
    ...locales.map(l => `<link rel="alternate" hreflang="${l.hreflang}" href="${pageUrl(l)}">`),
    `<link rel="alternate" hreflang="x-default" href="${X_DEFAULT_URL}">`,
  ]);
}

function langLinks(current) {
  return indent(24, locales.map(l => {
    const attrs = l === current ? ' aria-current="page"' : '';
    return `<li><a href="/${l.slug}/" hreflang="${l.hreflang}" lang="${l.htmlLang}" data-lang="${l.slug}"${attrs}>${esc(l.name)}</a></li>`;
  }));
}

function presetGroups(loc) {
  return indent(24, loc.presets.flatMap(group => [
    '<div class="preset-group">',
    `    <span class="preset-platform">${esc(group.platform)}</span>`,
    ...group.items.map(([w, h, label]) =>
      `    <button type="button" class="preset-btn" data-width="${w}" data-height="${h}"><span>${esc(label)}</span><small>${w}×${h}</small></button>`),
    '</div>',
  ]));
}

const cards = items => indent(20, items.map(it =>
  `<article class="seo-card"><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></article>`));

const faqItems = items => indent(20, items.map(it =>
  `<details class="faq-item"><summary>${esc(it.q)}</summary><p>${esc(it.a)}</p></details>`));

function jsonLd(loc) {
  const graph = [
    {
      '@type': 'WebApplication',
      name: 'TinyImage',
      url: pageUrl(loc),
      description: loc.meta.description,
      inLanguage: loc.htmlLang,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript and HTML5 Canvas',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: loc.features.items.map(f => f.title),
    },
    {
      '@type': 'FAQPage',
      inLanguage: loc.htmlLang,
      mainEntity: loc.faq.items.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];
  // 避免 JSON 內容提前結束 <script>
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', String.raw`<`);
}

function buildPage(loc) {
  return render(template, {
    ...loc,
    url: pageUrl(loc),
    version: VERSION,
    hreflangLinks: hreflangLinks(),
    ogAlternates: indent(4, locales.filter(l => l !== loc)
      .map(l => `<meta property="og:locale:alternate" content="${l.ogLocale}">`)),
    jsonLd: jsonLd(loc),
    langLinks: langLinks(loc),
    presetGroups: presetGroups(loc),
    featureItems: cards(loc.features.items),
    useCaseItems: cards(loc.useCases.items),
    faqItems: faqItems(loc.faq.items),
  });
}

// 靜態主機（沒有 server.js 導向）時的前端導向：cookie → 瀏覽器語言 → 預設英文
function rootRedirectScript() {
  const slugs = JSON.stringify(locales.map(l => l.slug));
  return `
        (function () {
            var slugs = ${slugs};
            var m = document.cookie.match(/(?:^|;\\s*)tinyimage_lang=([\\w-]+)/);
            var loc = m && slugs.indexOf(m[1]) !== -1 ? m[1] : null;
            var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
            for (var i = 0; !loc && i < langs.length; i++) {
                var tag = String(langs[i]).toLowerCase();
                var base = tag.split('-')[0];
                if (base === 'zh') loc = 'zh-tw';
                else if (slugs.indexOf(base) !== -1) loc = base;
            }
            location.replace('/' + (loc || 'en') + '/');
        })();
    `;
}

// x-default：首頁會依瀏覽器語言導向（預設英文），此頁內容只在導向前或停用 JS 時顯示
function buildRootPage() {
  const items = locales.map(l =>
    `<li><a class="picker-link" href="/${l.slug}/" hreflang="${l.hreflang}" lang="${l.htmlLang}" data-lang="${l.slug}">` +
    `<strong>${esc(l.name)}</strong><span>${esc(l.h1)}</span></a></li>`);
  return `<!DOCTYPE html>
<!-- 此檔由 scripts/build.js 產生，請勿直接修改 -->
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TinyImage — Free Online Image Compressor &amp; Cropper</title>
    <meta name="description" content="Free online image compressor and cropper that runs entirely in your browser. Available in 繁體中文, English, 日本語, 한국어, Español and Português.">
    <link rel="canonical" href="${X_DEFAULT_URL}">
${hreflangLinks()}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="stylesheet" href="/style.css?v=${VERSION}">
    <script>${rootRedirectScript()}</script>
</head>

<body>
    <header class="header">
        <div class="header-inner">
            <div class="header-top header-top-center">
                <span class="logo"><span class="logo-text">TinyImage</span></span>
            </div>
            <h1 class="tagline">Free Online Image Compressor &amp; Cropper</h1>
        </div>
    </header>

    <main class="main">
        <div class="container">
            <ul class="picker-list">
${indent(16, items)}
            </ul>
        </div>
    </main>

    <footer class="footer">
        <p class="footer-copyright">© 2026 Bruce Lee · TinyImage</p>
    </footer>
    <script src="/i18n.js?v=${VERSION}"></script>
</body>

</html>
`;
}

function buildSitemap() {
  const today = new Date().toLocaleDateString('sv-SE'); // 本地日期 YYYY-MM-DD
  const alternates = indent(4, [
    ...locales.map(l => `<xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${pageUrl(l)}"/>`),
    `<xhtml:link rel="alternate" hreflang="x-default" href="${X_DEFAULT_URL}"/>`,
  ]);
  // / 會自動導向，不列入 sitemap
  const urls = locales.map(pageUrl).map(loc => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
${alternates}
  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

function buildRuntimeI18n() {
  const messages = Object.fromEntries(locales.map(l => [l.slug, {
    ...l.messages,
    label_crop_width: l.ui.label_crop_width,
    label_crop_height: l.ui.label_crop_height,
  }]));
  return `// 此檔由 scripts/build.js 產生，請勿直接修改（來源：locales/*.js）
// 頁面語言由網址決定（/<lang>/），這裡只提供 script.js 執行時需要的動態文字
const i18n = (() => {
  const MESSAGES = ${JSON.stringify(messages, null, 2)};
  const locale = document.documentElement.dataset.locale;
  const dict = MESSAGES[locale] || MESSAGES.en;

  // 記住使用者選擇的語言，之後造訪 / 時由伺服器導向該語言
  document.addEventListener('click', e => {
    const link = e.target.closest('a[data-lang]');
    if (link) document.cookie = \`tinyimage_lang=\${link.dataset.lang}; path=/; max-age=31536000; SameSite=Lax\`;
  });

  // 點選選單以外的地方時關閉語言選單
  document.addEventListener('click', e => {
    document.querySelectorAll('details.lang-menu[open]').forEach(menu => {
      if (!menu.contains(e.target)) menu.removeAttribute('open');
    });
  });

  return {
    locale,
    t(key, replacements = {}) {
      let text = dict[key] ?? MESSAGES.en[key] ?? key;
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replaceAll(\`{\${k}}\`, v);
      }
      return text;
    },
  };
})();
`;
}

function write(rel, content) {
  const file = path.join(publicDir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log('  ✓', path.posix.join('public', rel.split(path.sep).join('/')));
}

console.log('Building TinyImage pages…');
for (const loc of locales) write(path.join(loc.slug, 'index.html'), buildPage(loc));
write('index.html', buildRootPage());
write('sitemap.xml', buildSitemap());
write('i18n.js', buildRuntimeI18n());
