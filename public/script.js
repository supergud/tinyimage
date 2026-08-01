/* ── State ── */
const state = {
  mode: 'compress',  // 'compress' | 'crop'
  files: [],         // FileEntry[]
};

/* ── DOM ── */
const tabBtns         = document.querySelectorAll('.tab-btn');
const compressSettings = document.getElementById('compress-settings');
const cropSettings     = document.getElementById('crop-settings');
const dropZone         = document.getElementById('drop-zone');
const fileInput        = document.getElementById('file-input');
const fileListSection  = document.getElementById('file-list-section');
const fileListEl       = document.getElementById('file-list');
const fileCountEl      = document.getElementById('file-count');
const processAllBtn    = document.getElementById('process-all');
const clearAllBtn      = document.getElementById('clear-all');
const downloadAllBar   = document.getElementById('download-all-bar');
const downloadAllBtn   = document.getElementById('download-all');

/* ── Tab Switching ── */
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    state.mode = btn.dataset.mode;

    if (state.mode === 'compress') {
      compressSettings.classList.remove('hidden');
      cropSettings.classList.add('hidden');
    } else {
      compressSettings.classList.add('hidden');
      cropSettings.classList.remove('hidden');
    }
  });
});

/* ── Drag & Drop ── */
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
['dragleave', 'dragend'].forEach(evt =>
  dropZone.addEventListener(evt, () => dropZone.classList.remove('drag-over'))
);
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (files.length) addFiles(files);
});
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('keydown', e => {
  if (e.key === ' ') e.preventDefault(); // 防止空白鍵捲動頁面
});

/* ── File Input ── */
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) addFiles(Array.from(fileInput.files));
  fileInput.value = '';
});

/* ── Utilities ── */
function uid() { return crypto.randomUUID(); }

function formatBytes(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

// 取得圖片原始尺寸
async function getImageDimensions(file) {
  try {
    const bmp = await createImageBitmap(file);
    const { width, height } = bmp;
    bmp.close();
    return { width, height };
  } catch {
    return { width: null, height: null };
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('無法讀取圖片'));
    reader.readAsDataURL(file);
  });
}

function releasePreviewUrl(url) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

/* ── File Management ── */
async function addFiles(files) {
  const MAX_SIZE = 50 * 1024 * 1024;
  for (const file of files) {
    if (file.size > MAX_SIZE) {
      alert(`「${file.name}」超過 50 MB 限制，已跳過。`);
      continue;
    }
    const dims = await getImageDimensions(file);
    const previewUrl = await readFileAsDataUrl(file);
    state.files.push({
      id:            uid(),
      file,
      status:        'pending',
      originalSize:  file.size,
      origWidth:     dims.width,
      origHeight:    dims.height,
      outWidth:      null,
      outHeight:     null,
      processedSize: null,
      processedBlob: null,
      processedName: null,
      error:         null,
      previewUrl,
    });
  }
  render();
}

function removeFile(id) {
  const entry = state.files.find(f => f.id === id);
  releasePreviewUrl(entry?.previewUrl);
  state.files = state.files.filter(f => f.id !== id);
  render();
}

/* ── Render ── */
function render() {
  const count = state.files.length;
  if (count === 0) { fileListSection.hidden = true; return; }

  fileListSection.hidden = false;
  fileCountEl.textContent = count;

  // Rebuild list
  fileListEl.innerHTML = '';
  state.files.forEach(entry => fileListEl.appendChild(buildItem(entry)));

  // Download-all bar
  downloadAllBar.hidden = !state.files.some(f => f.status === 'done');
}

/* ── Item HTML Builders ── */
function buildDimHtml(entry) {
  if (!entry.origWidth || !entry.origHeight) return '';
  let html = `<span class="size-dim">${entry.origWidth}×${entry.origHeight}</span>`;
  if (entry.status === 'done' && entry.outWidth && entry.outHeight) {
    html += `<span class="size-arrow">→</span><span class="size-dim-out">${entry.outWidth}×${entry.outHeight}</span>`;
  }
  return html;
}

function buildSizeHtml(entry) {
  let html = `<span class="size-original">${formatBytes(entry.originalSize)}</span>`;
  if (entry.status === 'done' && entry.processedSize != null) {
    const saved      = Math.round((1 - entry.processedSize / entry.originalSize) * 100);
    const badgeClass = saved > 0 ? 'badge-saved' : 'badge-bigger';
    const badgeLabel = saved > 0 ? `-${saved}%` : `+${Math.abs(saved)}%`;
    html += `<span class="size-arrow">→</span><span class="size-new">${formatBytes(entry.processedSize)}</span><span class="${badgeClass}">${badgeLabel}</span>`;
  }
  if (entry.status === 'error') {
    html += `<span class="error-msg">${escHtml(entry.error)}</span>`;
  }
  return html;
}

function buildActionHtml(entry) {
  const dlBtn = `<button class="btn-dl" data-action="download" data-id="${entry.id}">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>下載</button>`;
  const map = {
    pending:    `<span class="status-tag pending">等待中</span>`,
    processing: `<span class="status-tag processing"><span class="spinner"></span>處理中</span>`,
    done:       dlBtn,
    error:      `<span class="status-tag error">失敗</span>`,
  };
  return map[entry.status] ?? '';
}

function buildItem(entry) {
  const div = document.createElement('div');
  div.className = `file-item ${entry.status}`;
  div.id = `fi-${entry.id}`;

  const dimHtml = buildDimHtml(entry);
  div.innerHTML = `
    <div class="file-thumb">
      <img src="${entry.previewUrl}" alt="" loading="lazy">
    </div>
    <div class="file-info">
      <div class="file-name" title="${escHtml(entry.file.name)}">${escHtml(entry.file.name)}</div>
      ${dimHtml ? `<div class="file-dims">${dimHtml}</div>` : ''}
      <div class="file-sizes">${buildSizeHtml(entry)}</div>
    </div>
    <div class="file-actions">
      ${buildActionHtml(entry)}
      <button class="btn-remove" data-action="remove" data-id="${entry.id}" title="移除">×</button>
    </div>`;

  return div;
}

function updateItem(entry) {
  const existing = document.getElementById(`fi-${entry.id}`);
  if (existing) existing.replaceWith(buildItem(entry));
  downloadAllBar.hidden = !state.files.some(f => f.status === 'done');
}

/* ── Event Delegation on File List ── */
fileListEl.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === 'remove')   removeFile(id);
  if (action === 'download') downloadFile(id);
});

/* ── Download Single File ── */
function downloadFile(id) {
  const entry = state.files.find(f => f.id === id);
  if (!entry?.processedBlob) return;
  triggerDownload(entry.processedBlob, entry.processedName);
}

function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ── Clear All ── */
clearAllBtn.addEventListener('click', () => {
  state.files.forEach(f => releasePreviewUrl(f.previewUrl));
  state.files = [];
  render();
});

/* ── Process All ── */
processAllBtn.addEventListener('click', async () => {
  // Validate crop settings before starting
  if (state.mode === 'crop') {
    const w = document.getElementById('crop-width').value.trim();
    const h = document.getElementById('crop-height').value.trim();
    if (!w || !h) {
      alert('裁切模式需要同時填寫寬度與高度');
      return;
    }
  }

  const targets = state.files.filter(f => f.status === 'pending' || f.status === 'error');
  if (!targets.length) return;

  processAllBtn.disabled = true;

  for (const entry of targets) {
    await processEntry(entry);
  }

  processAllBtn.disabled = false;
});

/* ── Process One File ── */
async function processEntry(entry) {
  entry.status = 'processing';
  updateItem(entry);

  try {
    const request = buildProcessingRequest(entry);
    let result;

    try {
      result = await processInBrowser(request);
    } catch (browserErr) {
      console.warn('Browser image processing failed; trying API.', browserErr);
      try {
        result = await processViaApi(request);
      } catch (apiErr) {
        if (apiErr.fallbackToBrowser) throw browserErr;
        throw apiErr;
      }
    }

    entry.status        = 'done';
    entry.processedBlob = result.blob;
    entry.processedSize = result.processedSize;
    entry.processedName = result.processedName;
    entry.originalSize  = result.originalSize;
    entry.outWidth      = result.outWidth;
    entry.outHeight     = result.outHeight;

  } catch (err) {
    entry.status = 'error';
    entry.error  = err.message;
  }

  updateItem(entry);
}

function buildProcessingRequest(entry) {
  const formData = new FormData();
  formData.append('image', entry.file);

  if (state.mode === 'compress') {
    const width = document.getElementById('compress-width').value.trim();
    const height = document.getElementById('compress-height').value.trim();
    if (width) formData.append('width', width);
    if (height) formData.append('height', height);
    return { entry, formData, apiUrl: '/api/compress', mode: 'compress', width, height };
  }

  const width = document.getElementById('crop-width').value.trim();
  const height = document.getElementById('crop-height').value.trim();
  const position = document.getElementById('crop-position').value;
  formData.append('width', width);
  formData.append('height', height);
  formData.append('position', position);
  return { entry, formData, apiUrl: '/api/crop', mode: 'crop', width, height, position };
}

async function processViaApi(request) {
  let resp;
  try {
    resp = await fetch(request.apiUrl, { method: 'POST', body: request.formData });
  } catch (err) {
    err.fallbackToBrowser = true;
    throw err;
  }

  if (!resp.ok) {
    const err = new Error(await readResponseError(resp));
    err.fallbackToBrowser = resp.status === 404 || resp.status === 405;
    throw err;
  }

  const contentType = resp.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    const err = new Error('API 沒有回傳圖片');
    err.fallbackToBrowser = true;
    throw err;
  }

  const blob = await resp.blob();
  const rawName = resp.headers.get('X-File-Name') || '';

  return {
    blob,
    originalSize: Number.parseInt(resp.headers.get('X-Original-Size') || request.entry.file.size, 10),
    processedSize: Number.parseInt(resp.headers.get('X-Compressed-Size') || blob.size, 10),
    processedName: rawName ? decodeURIComponent(rawName) : request.entry.file.name,
    outWidth: Number.parseInt(resp.headers.get('X-Output-Width') || '0', 10) || null,
    outHeight: Number.parseInt(resp.headers.get('X-Output-Height') || '0', 10) || null,
  };
}

async function readResponseError(resp) {
  let msg = `HTTP ${resp.status}`;
  try {
    msg = (await resp.json()).error || msg;
  } catch (parseErr) {
    console.debug('無法解析錯誤回應', parseErr);
  }
  return msg;
}

async function processInBrowser(request) {
  const image = await loadImage(request.entry.file);
  const output = getBrowserOutput(request.entry.file);
  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;

  if (!originalWidth || !originalHeight) throw new Error('無法讀取圖片尺寸');

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: output.mime !== 'image/jpeg' });
  if (!ctx) throw new Error('瀏覽器不支援圖片處理');

  let outWidth;
  let outHeight;

  if (request.mode === 'crop') {
    outWidth = readPositiveInt(request.width, '裁切寬度');
    outHeight = readPositiveInt(request.height, '裁切高度');
    canvas.width = outWidth;
    canvas.height = outHeight;

    const scale = Math.max(outWidth / originalWidth, outHeight / originalHeight);
    const drawWidth = Math.round(originalWidth * scale);
    const drawHeight = Math.round(originalHeight * scale);
    const anchor = getCropAnchor(request.position);
    const dx = Math.round((outWidth - drawWidth) * anchor.x);
    const dy = Math.round((outHeight - drawHeight) * anchor.y);
    ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
  } else {
    const box = getResizeBox(request.width, request.height, originalWidth, originalHeight);
    outWidth = box.width;
    outHeight = box.height;
    canvas.width = outWidth;
    canvas.height = outHeight;
    ctx.drawImage(image, 0, 0, outWidth, outHeight);
  }

  const blob = await canvasToBlob(canvas, output.mime, output.quality);
  const suffix = request.mode === 'crop' ? `_crop_${outWidth}x${outHeight}` :
    (outWidth === originalWidth && outHeight === originalHeight ? '_compressed' : `_resized_${outWidth}x${outHeight}`);

  return {
    blob,
    originalSize: request.entry.file.size,
    processedSize: blob.size,
    processedName: `${sanitizeDownloadName(request.entry.file.name)}${suffix}${output.ext}`,
    outWidth,
    outHeight,
  };
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('無法載入圖片'));
    readFileAsDataUrl(file)
      .then(url => { image.src = url; })
      .catch(reject);
  });
}

function getResizeBox(widthValue, heightValue, originalWidth, originalHeight) {
  const width = Number.parseInt(widthValue, 10);
  const height = Number.parseInt(heightValue, 10);
  const hasWidth = Number.isFinite(width) && width > 0;
  const hasHeight = Number.isFinite(height) && height > 0;

  if (!hasWidth && !hasHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  const boxWidth = hasWidth && hasHeight ? width : (hasWidth ? width : height);
  const boxHeight = hasWidth && hasHeight ? height : (hasHeight ? height : width);
  const scale = Math.min(boxWidth / originalWidth, boxHeight / originalHeight, 1);

  return {
    width: Math.max(1, Math.round(originalWidth * scale)),
    height: Math.max(1, Math.round(originalHeight * scale)),
  };
}

function readPositiveInt(value, label) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0 || n > 10000) {
    throw new Error(`${label} 必須介於 1 到 10000 px`);
  }
  return n;
}

function getCropAnchor(position) {
  const map = {
    north: { x: 0.5, y: 0 },
    south: { x: 0.5, y: 1 },
    east: { x: 1, y: 0.5 },
    west: { x: 0, y: 0.5 },
    northeast: { x: 1, y: 0 },
    northwest: { x: 0, y: 0 },
    southeast: { x: 1, y: 1 },
    southwest: { x: 0, y: 1 },
  };
  return map[position] || { x: 0.5, y: 0.5 };
}

function getBrowserOutput(file) {
  const lowerName = file.name.toLowerCase();
  if (file.type === 'image/png' || lowerName.endsWith('.png')) {
    return { mime: 'image/png', ext: '.png' };
  }
  if (file.type === 'image/webp' || lowerName.endsWith('.webp')) {
    return { mime: 'image/webp', ext: '.webp', quality: 0.8 };
  }
  if (file.type === 'image/jpeg' || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
    return { mime: 'image/jpeg', ext: lowerName.endsWith('.jpeg') ? '.jpeg' : '.jpg', quality: 0.82 };
  }
  return { mime: 'image/jpeg', ext: '.jpg', quality: 0.82 };
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('無法輸出圖片'));
    }, mime, quality);
  });
}

function sanitizeDownloadName(name) {
  const withoutExt = name.replace(/\.[^.]+$/, '');
  return (withoutExt || 'image')
    .replace(/[^\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef\w\s.-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[_ .]+|[_ .]+$/g, '') || 'image';
}

/* ── Download All as ZIP ── */
downloadAllBtn.addEventListener('click', async () => {
  const done = state.files.filter(f => f.status === 'done');
  if (!done.length) return;

  downloadAllBtn.disabled = true;
  const originalLabel = downloadAllBtn.innerHTML;
  downloadAllBtn.textContent = '打包中…';

  try {
    const zip = new JSZip();
    done.forEach(f => zip.file(f.processedName, f.processedBlob));
    const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    triggerDownload(content, 'tinyimage_output.zip');
  } catch (err) {
    alert('打包失敗：' + err.message);
  } finally {
    downloadAllBtn.disabled = false;
    downloadAllBtn.innerHTML = originalLabel;
  }
});

/* ── Helper: escape HTML ── */
function escHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
