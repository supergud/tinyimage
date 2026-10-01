# AGENTS.md

給 AI 代理（Claude Code、Codex 等）的專案指引。

## 專案概述
TinyImage：圖片壓縮與裁切網站，正式網址 https://tinyimage.eat2die.com 。
Node.js + Express 後端，Sharp 處理圖片，前端為純靜態 HTML/CSS/JS（無建置步驟）。

## 目錄結構
- `server.js`：Express 伺服器與圖片處理 API（multer 記憶體上傳，上限 50MB）
- `public/index.html`：單頁前端，內含 GA4（`G-7Z28EXGCYH`）與 AdSense 標籤
- `public/script.js`、`public/style.css`：前端邏輯與樣式
- `public/i18n.js`：繁中／英文語系切換
- `public/robots.txt`、`public/sitemap.xml`：SEO 檔案

## 指令
```bash
npm install
npm start      # http://localhost:3000
npm run dev    # nodemon
```
目前沒有測試與 lint 設定。

## 開發慣例
- 語言：程式註解與 UI 以繁體中文為主，新增 UI 文字須同步補進 `public/i18n.js` 的中英文。
- 修改 `style.css` 或 `script.js` 後，更新 `index.html` 中的 `?v=` 版本參數以避開快取。
- 新增第三方 script／圖片來源時，注意既有 CSP 設定（曾因 CSP 導致圖片預覽失效）。
- 上傳檔案只在記憶體處理，不寫入磁碟，不要引入檔案持久化。
- 不要在 repo 提交金鑰、token 等機密。

## Git Flow
- 長期分支：`master`（正式）、`develop`（整合）。
- 功能：`feature/<名稱>` 從 `develop` 切出，完成後 `--no-ff` 合併回 `develop`。
- 修正：`fix/<名稱>`，同 feature 流程；線上緊急修復用 `hotfix/<名稱>` 從 `master` 切出，合併回 `master` 與 `develop`。
- 發版：`release/<版本>` 從 `develop` 切出，合併回 `master` 並打 tag，再回合併 `develop`。
- Commit 訊息採 Conventional Commits 風格（`feat:`、`fix:`、`docs:` 等）。
- 未經使用者要求，不要 push 或直接在 `master` 上提交。
