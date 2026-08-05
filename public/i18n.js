// ── i18n Translation System ──
const i18n = {
  currentLang: localStorage.getItem('tinyimage_lang') || 'zh-TW',
  
  translations: {
    'zh-TW': {
      // Header & Footer
      'tagline': '智慧圖片壓縮與裁切工具',
      'footer': 'TinyImage — 本地圖片壓縮，檔案不會上傳至任何伺服器',
      
      // Tabs
      'tab_compress': '壓縮 / 縮小',
      'tab_crop': '裁切並壓縮',
      
      // Labels
      'label_width': '縮小寬度',
      'label_height': '縮小高度',
      'label_crop_width': '裁切寬度',
      'label_crop_height': '裁切高度',
      'label_crop_position': '裁切錨點',
      
      // Badges
      'badge_optional': '選填',
      'badge_required': '必填',
      
      // Hints
      'hint_resize': '留空則維持原始比例，僅做高效壓縮；填寫後等比縮小至指定邊長內',
      'hint_crop': '圖片將裁切為精確的指定尺寸，超出部分依錨點方向裁去',
      
      // Upload area
      'drop_title': '拖曳圖片到此處',
      'drop_or': '— 或 —',
      'drop_btn': '選擇圖片',
      'drop_hint': '支援 JPG · PNG · WebP · GIF · AVIF 　　單檔最大 50 MB',
      
      // File list header
      'file_list_header_prefix': '處理清單',
      'file_list_header_suffix': '個檔案',
      
      // Crop positions
      'crop_centre': '⊙ 置中',
      'crop_north': '↑ 上方',
      'crop_south': '↓ 下方',
      'crop_east': '→ 右側',
      'crop_west': '← 左側',
      'crop_northwest': '↖ 左上',
      'crop_northeast': '↗ 右上',
      'crop_southwest': '↙ 左下',
      'crop_southeast': '↘ 右下',
      'crop_attention': '🔍 智慧辨識',
      
      // File list
      'file_list_header': '處理清單（{count} 個檔案）',
      'btn_clear_all': '清除全部',
      'btn_process_all': '開始處理',
      'btn_download_all': '全部下載（ZIP）',
      'btn_download': '下載',
      
      // Status
      'status_pending': '等待中',
      'status_processing': '處理中',
      'status_done': '完成',
      'status_error': '失敗',
      
      // Messages
      'error_max_size': '「{name}」超過 50 MB 限制，已跳過。',
      'error_crop_required': '裁切模式需要同時填寫寬度與高度',
      'error_cannot_read': '無法讀取圖片',
      'error_cannot_load': '無法載入圖片',
      'error_cannot_output': '無法輸出圖片',
      'error_no_canvas': '瀏覽器不支援圖片處理',
      'error_dimension': '{label} 必須介於 1 到 10000 px',
      'error_packing': '打包失敗：{error}',
      'error_api_no_image': 'API 沒有回傳圖片',
      'error_packing_title': '打包中…',
      
      // Coffee link
      'coffee_link': '☕ 買杯咖啡',
    },
    'en': {
      // Header & Footer
      'tagline': 'Smart Image Compression & Crop Tool',
      'footer': 'TinyImage — Image compression locally, files are never uploaded to any server',
      
      // Tabs
      'tab_compress': 'Compress / Resize',
      'tab_crop': 'Crop & Compress',
      
      // Labels
      'label_width': 'Reduce Width',
      'label_height': 'Reduce Height',
      'label_crop_width': 'Crop Width',
      'label_crop_height': 'Crop Height',
      'label_crop_position': 'Crop Anchor',
      
      // Badges
      'badge_optional': 'Optional',
      'badge_required': 'Required',
      
      // Hints
      'hint_resize': 'Leave empty to maintain original aspect ratio with efficient compression; fill in to scale down proportionally to specified edge length',
      'hint_crop': 'Image will be cropped to exact specified dimensions, overflow will be cropped based on anchor direction',
      
      // Upload area
      'drop_title': 'Drag images here',
      'drop_or': '— or —',
      'drop_btn': 'Choose Images',
      'drop_hint': 'Supports JPG · PNG · WebP · GIF · AVIF　　Max 50 MB per file',
      
      // Crop positions
      'crop_centre': '⊙ Center',
      'crop_north': '↑ Top',
      'crop_south': '↓ Bottom',
      'crop_east': '→ Right',
      'crop_west': '← Left',
      'crop_northwest': '↖ Top-left',
      'crop_northeast': '↗ Top-right',
      'crop_southwest': '↙ Bottom-left',
      'crop_southeast': '↘ Bottom-right',
      'crop_attention': '🔍 Smart Detect',
      
      // File list
      'file_list_header': 'Processing Queue ({count} files)',
      'btn_clear_all': 'Clear All',
      'btn_process_all': 'Start Processing',
      'btn_download_all': 'Download All (ZIP)',
      'btn_download': 'Download',
      
      // Status
      'status_pending': 'Pending',
      'status_processing': 'Processing',
      'status_done': 'Done',
      'status_error': 'Failed',
      
      // Messages
      'error_max_size': '"{name}" exceeds 50 MB limit, skipped.',
      'error_crop_required': 'Crop mode requires both width and height',
      'error_cannot_read': 'Unable to read image',
      'error_cannot_load': 'Unable to load image',
      'error_cannot_output': 'Unable to output image',
      'error_no_canvas': 'Browser does not support image processing',
      'error_dimension': '{label} must be between 1 and 10000 px',
      'error_packing': 'Packing failed: {error}',
      'error_api_no_image': 'API did not return an image',
      'error_packing_title': 'Packing…',
      
      // Coffee link
      'coffee_link': '☕ Buy me a coffee',
    }
  },

  t(key, replacements = {}) {
    let text = this.translations[this.currentLang]?.[key] || 
               this.translations['zh-TW'][key] || 
               key;
    
    // Replace placeholders like {name}, {error}, {label}, {count}
    for (const [k, v] of Object.entries(replacements)) {
      text = text.replace(new RegExp(String.raw`\{${k}\}`, 'g'), v);
    }
    
    return text;
  },

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('tinyimage_lang', lang);
      this.updateUI();
    }
  },

  updateUI() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = this.t(key);
    });

    // Update html lang attribute
    document.documentElement.lang = this.currentLang === 'en' ? 'en' : 'zh-TW';
    
    // Update language button active state
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });
  },

  init() {
    // Set up language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setLanguage(btn.dataset.lang);
      });
    });

    // Initial UI update
    this.updateUI();
  }
};

// Initialize i18n when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
  i18n.init();
}
