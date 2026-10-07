# AGENTS.md

給 AI 代理（Claude Code、Codex 等）的專案指引。

## 專案概述
TinyImage：圖片壓縮與裁切網站，正式網址 https://tinyimage.eat2die.com 。
圖片處理 100% 在瀏覽器端完成（Canvas API），伺服器不接收、不處理任何圖片。
Node.js + Express 只提供靜態檔案，以及 `/` 的語言導向。前端為純 HTML/CSS/JS，各語言頁面由 `npm run build` 預先產生並提交進 repo，部署時不需建置。

## 多國語言與 SEO
- 語言與網址：繁中 `/zh-tw/`、English `/en/`、日本語 `/ja/`、한국어 `/ko/`、Español `/es/`、Português `/pt/`。
- 每個語言頁面都有自己的 title、meta description、H1、功能說明、在地使用情境、FAQ（含 FAQPage JSON-LD）、在地常用裁切尺寸，以及完整的 hreflang（含 `x-default` → `/`）。
- `/`：依 `tinyimage_lang` cookie 或 `Accept-Language` 302 導向對應語言；無法判斷時（如搜尋引擎爬蟲）顯示 `public/index.html` 語言選擇頁（x-default）。
- 語言由網址決定，不在頁面內以 JS 切換文字，搜尋引擎能直接讀到各語言內容。

## 目錄結構
- `server.js`：Express 靜態檔案伺服器與 `/` 語言導向（沒有任何圖片 API）
- `locales/<lang>.js`：各語言的 SEO 文案、UI 文字、動態訊息（`messages`）、在地常用尺寸（`presets`）、功能說明、使用情境、FAQ
- `templates/page.html`：語言頁面模板（`{{key}}` 會跳脫，`{{{key}}}` 原樣輸出）
- `scripts/build.js`：產生 `public/<lang>/index.html`、`public/index.html`、`public/sitemap.xml`、`public/i18n.js`；CSS／JS 版本參數 `VERSION` 也在這裡
- `public/script.js`：前端邏輯，含 Canvas 壓縮／縮放／裁切（`processInBrowser`）與 JSZip 打包
- `public/style.css`：樣式
- `public/robots.txt`：SEO 檔案
- 頁面內含 GA4（`G-7Z28EXGCYH`）與 AdSense 標籤（在模板中）

## 指令
```bash
npm install
npm run build  # 修改 locales/ 或 templates/ 後重新產生頁面
npm start      # http://localhost:3000
npm run dev    # nodemon
```
目前沒有測試與 lint 設定。

## 開發慣例
- 不要直接修改產生的檔案（`public/index.html`、`public/<lang>/index.html`、`public/sitemap.xml`、`public/i18n.js`），改 `locales/`、`templates/` 或 `scripts/build.js` 後執行 `npm run build`，並把產生的檔案一起提交。
- 新增 UI 文字時，六個 `locales/*.js` 都要補上；`script.js` 執行時用到的文字放在 `messages`，以 `i18n.t()` 取得。
- 程式註解以繁體中文為主。
- 修改 `style.css` 或 `script.js` 後，更新 `scripts/build.js` 的 `VERSION` 並重新 build，以避開快取。
- 新增第三方 script／圖片來源時，注意既有 CSP 設定（曾因 CSP 導致圖片預覽失效）。
- 圖片處理只能在瀏覽器端進行：不要新增後端圖片 API、不要把圖片送到伺服器或第三方服務，也不要加回 API fallback。
- 單檔上限 50MB（`addFiles` 檢查）；裁切尺寸限制 1–10000 px。
- 輸出格式：JPEG（q0.82）／PNG／WebP（q0.8）維持原格式，其他格式轉 JPEG。
- 瀏覽器端沒有 Sharp 的 `attention`／`entropy` 智慧裁切，裁切錨點只支援置中、四邊與四角。
- 不要在 repo 提交金鑰、token 等機密。

## Git Flow
- 長期分支：`master`（正式）、`develop`（整合）。
- 功能：`feature/<名稱>` 從 `develop` 切出，完成後 `--no-ff` 合併回 `develop`。
- 修正：`fix/<名稱>`，同 feature 流程；線上緊急修復用 `hotfix/<名稱>` 從 `master` 切出，合併回 `master` 與 `develop`。
- 發版：`release/<版本>` 從 `develop` 切出，合併回 `master` 並打 tag，再回合併 `develop`。
- Commit 訊息採 Conventional Commits 風格（`feat:`、`fix:`、`docs:` 等）。
- 未經使用者要求，不要 push 或直接在 `master` 上提交。
