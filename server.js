const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('node:path');

const app = express();
app.disable('x-powered-by'); // 避免揭露伺服器框架版本資訊

// 檔案上傳設定（記憶體儲存，最大 50MB）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff', 'image/avif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支援的圖片格式，請使用 JPG、PNG 或 WebP'));
    }
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// 修正 multer 將 UTF-8 檔名位元組誤以 Latin-1 解碼的問題
function decodeName(name) {
  try {
    const decoded = Buffer.from(name, 'latin1').toString('utf8');
    // 若解碼後有有效的多位元組字元則採用，否則保留原值
    return decoded !== name ? decoded : name;
  } catch {
    return name;
  }
}

// 清除檔名中不安全或不友善的特殊符號
// 保留：中文、英數、空白、底線、連字號、小數點
function sanitizeName(name) {
  let s = name
    .replaceAll(/[^\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef\w\s.-]/g, '') // 移除特殊符號
    .replaceAll(/\s+/g, '_')   // 空白換成底線
    .replaceAll(/_+/g, '_');   // 合併連續底線

  // 去頭尾的底線與點（用迴圈，避免 regex 回溯問題）
  let i = 0;
  while (i < s.length && (s[i] === '_' || s[i] === '.')) i++;
  let j = s.length;
  while (j > i && (s[j - 1] === '_' || s[j - 1] === '.')) j--;

  return s.slice(i, j) || 'image'; // 若清完全空則給預設名
}

// 取得 MIME 類型
function getMimeType(ext) {
  const map = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

// 設定通用回應 headers（dims: { origW, origH, outW, outH }）
function setResponseHeaders(res, fileName, originalSize, compressedSize, dims = {}) {
  const encoded = encodeURIComponent(fileName);
  const expose = ['X-File-Name', 'X-Original-Size', 'X-Compressed-Size',
                  'X-Original-Width', 'X-Original-Height', 'X-Output-Width', 'X-Output-Height'];
  res.set({
    'Content-Type': getMimeType(path.extname(fileName).toLowerCase()),
    'Content-Disposition': `attachment; filename*=UTF-8''${encoded}`,
    'X-File-Name':        encoded,
    'X-Original-Size':    originalSize.toString(),
    'X-Compressed-Size':  compressedSize.toString(),
    'X-Original-Width':   (dims.origW ?? '').toString(),
    'X-Original-Height':  (dims.origH ?? '').toString(),
    'X-Output-Width':     (dims.outW  ?? '').toString(),
    'X-Output-Height':    (dims.outH  ?? '').toString(),
    'Access-Control-Expose-Headers': expose.join(', ')
  });
}

// 壓縮並輸出，回傳 { buffer, width, height }
async function compressSharp(sharpInstance, ext) {
  let pipeline;
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      pipeline = sharpInstance.jpeg({ quality: 82, mozjpeg: true, progressive: true });
      break;
    case '.png':
      pipeline = sharpInstance.png({ compressionLevel: 9, adaptiveFiltering: true });
      break;
    case '.webp':
      pipeline = sharpInstance.webp({ quality: 80 });
      break;
    default:
      pipeline = sharpInstance.jpeg({ quality: 82, mozjpeg: true, progressive: true });
  }
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height };
}

// POST /api/compress — 壓縮 / 縮小
app.post('/api/compress', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未收到圖片' });
    }

    const { width, height } = req.body;
    // 修正中文檔名
    const originalName = decodeName(req.file.originalname);
    const originalExt = path.extname(originalName).toLowerCase();
    const baseName = sanitizeName(path.basename(originalName, path.extname(originalName)));

    // 輸出副檔名：支援格式保留，否則轉 jpg
    const outputExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(originalExt)
      ? originalExt
      : '.jpg';

    const w = width  ? Number.parseInt(width,  10) : null;
    const h = height ? Number.parseInt(height, 10) : null;

    // 縮放邏輯：只給一邊時，以該值作為「最大邊」限制
    // fit:'inside' + 相同 w/h → 最長邊 ≤ 指定值，另一邊等比例
    let resizeW = null, resizeH = null;
    if (w && h)      { resizeW = w; resizeH = h; }
    else if (w)      { resizeW = resizeH = w; }
    else if (h)      { resizeW = resizeH = h; }

    // 取得原始尺寸
    const meta = await sharp(req.file.buffer).metadata();
    const origW = meta.width;
    const origH = meta.height;

    // Sharp 處理
    let img = sharp(req.file.buffer).rotate();
    if (resizeW || resizeH) {
      img = img.resize({
        width:  resizeW ?? undefined,
        height: resizeH ?? undefined,
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    const { buffer: outputBuffer, width: outW, height: outH } = await compressSharp(img, outputExt);

    // 檔名後綴：用實際輸出尺寸，而非輸入參數
    const suffix = (resizeW || resizeH) ? `_縮小_${outW}x${outH}` : '_compressed';
    const fileName = `${baseName}${suffix}${outputExt}`;

    setResponseHeaders(res, fileName, req.file.size, outputBuffer.length, { origW, origH, outW, outH });
    res.send(outputBuffer);

  } catch (err) {
    console.error('[compress]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/crop — 裁切並壓縮
app.post('/api/crop', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未收到圖片' });
    }

    const { width, height, position } = req.body;

    if (!width || !height) {
      return res.status(400).json({ error: '裁切模式需要同時指定寬度與高度' });
    }

    const w = Number.parseInt(width, 10);
    const h = Number.parseInt(height, 10);

    if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0 || w > 10000 || h > 10000) {
      return res.status(400).json({ error: '尺寸無效，請輸入 1–10000 的整數' });
    }

    // 修正中文檔名
    const originalName = decodeName(req.file.originalname);
    const originalExt = path.extname(originalName).toLowerCase();
    const baseName = sanitizeName(path.basename(originalName, path.extname(originalName)));

    const outputExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(originalExt)
      ? originalExt
      : '.jpg';

    // 驗證裁切位置
    const validPositions = [
      'centre', 'center',
      'north', 'south', 'east', 'west',
      'northeast', 'northwest', 'southeast', 'southwest',
      'attention', 'entropy'
    ];
    const pos = validPositions.includes(position) ? position : 'centre';

    // 取得原始尺寸
    const meta = await sharp(req.file.buffer).metadata();
    const origW = meta.width;
    const origH = meta.height;

    const img = sharp(req.file.buffer)
      .rotate()
      .resize(w, h, { fit: 'cover', position: pos });

    const { buffer: outputBuffer, width: outW, height: outH } = await compressSharp(img, outputExt);
    const fileName = `${baseName}_裁切_${w}x${h}${outputExt}`;

    setResponseHeaders(res, fileName, req.file.size, outputBuffer.length, { origW, origH, outW, outH });
    res.send(outputBuffer);

  } catch (err) {
    console.error('[crop]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 錯誤處理 middleware
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: '檔案過大，最大支援 50MB' });
  }
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TinyImage 已啟動：http://localhost:${PORT}`);
});
