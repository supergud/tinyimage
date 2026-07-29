# TinyImage 🖼️

本地圖片壓縮與裁切服務，支援批次處理、智慧縮放、中文檔名清理。

## 功能

### 壓縮 / 縮小
- 高效壓縮圖片（JPEG mozjpeg q82、PNG level-9 無損、WebP q80）
- 設定最大邊長後等比縮放，不超過指定像素
- 同時設定寬高則縮放至符合框內（`fit: inside`）
- 不設定尺寸則只做壓縮，維持原始比例

### 裁切並壓縮
- 指定寬度與高度，裁切為精確尺寸（`fit: cover`）
- 可選裁切錨點：置中、四角、四方向、AI 智慧辨識焦點

### 其他特點
- 支援批次上傳，顯示原始與輸出尺寸對比
- 下載檔名自動帶入實際輸出尺寸（如 `photo_縮小_2000x1333.jpg`）
- 自動清除中文檔名中的特殊符號
- 全部下載打包成 ZIP
- 檔案不離開本機，零隱私疑慮

## 安裝

```bash
npm install
npm start
```

開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000)

## 技術棧

| 項目 | 說明 |
|------|------|
| [Express](https://expressjs.com/) | Web 伺服器 |
| [Sharp](https://sharp.pixelplumbing.com/) | 圖片處理（libvips） |
| [Multer](https://github.com/expressjs/multer) | 多檔上傳 |
| [JSZip](https://stuk.github.io/jszip/) | 前端 ZIP 打包 |

## API

### `POST /api/compress`

壓縮或縮小圖片。

| 參數 | 類型 | 說明 |
|------|------|------|
| `image` | File | 圖片檔案（必填） |
| `width` | number | 最大寬度（選填） |
| `height` | number | 最大高度（選填） |

### `POST /api/crop`

裁切並壓縮圖片。

| 參數 | 類型 | 說明 |
|------|------|------|
| `image` | File | 圖片檔案（必填） |
| `width` | number | 裁切寬度（必填） |
| `height` | number | 裁切高度（必填） |
| `position` | string | 錨點，預設 `centre` |

回應 Header 包含：`X-Original-Size`、`X-Compressed-Size`、`X-Original-Width/Height`、`X-Output-Width/Height`

## 支援格式

JPEG · PNG · WebP · GIF · AVIF · TIFF（輸出統一為原格式，不支援者轉 JPEG）

## License

MIT
