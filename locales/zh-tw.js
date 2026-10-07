// 繁體中文（台灣）
module.exports = {
  slug: 'zh-tw',
  htmlLang: 'zh-TW',
  hreflang: 'zh-TW',
  ogLocale: 'zh_TW',
  name: '繁體中文',

  meta: {
    title: '免費線上圖片壓縮與裁切工具｜TinyImage 不上傳、保護隱私',
    description: 'TinyImage 是免費的線上圖片壓縮與裁切工具，支援 JPG、PNG、WebP 批次壓縮，一鍵裁成 FB、IG、Threads、LINE、蝦皮適用尺寸。所有處理都在瀏覽器完成，圖片不會上傳。',
    keywords: '圖片壓縮,線上圖片壓縮,照片壓縮,圖片縮小,圖片裁切,JPG 壓縮,PNG 壓縮,WebP,IG 尺寸,FB 尺寸,蝦皮商品圖尺寸',
  },
  h1: '免費線上圖片壓縮與裁切，不上傳更安心',

  ui: {
    language_switcher: '語言選擇',
    tab_compress: '壓縮 / 縮小',
    tab_crop: '裁切並壓縮',
    label_width: '縮小寬度',
    label_height: '縮小高度',
    label_crop_width: '裁切寬度',
    label_crop_height: '裁切高度',
    label_crop_position: '裁切錨點',
    label_crop_preset: '常用尺寸',
    badge_optional: '選填',
    badge_required: '必填',
    hint_resize: '留空則維持原始比例，僅做高效壓縮；填寫後等比縮小至指定邊長內',
    hint_crop: '圖片將裁切為精確的指定尺寸，超出部分依錨點方向裁去',
    placeholder_unlimited: '不限',
    placeholder_crop_width: '如 800',
    placeholder_crop_height: '如 600',
    drop_title: '拖曳圖片到此處',
    drop_or: '— 或 —',
    drop_btn: '選擇圖片',
    drop_hint: '支援 JPG · PNG · WebP · GIF · AVIF　　單檔最大 50 MB',
    crop_centre: '⊙ 置中',
    crop_north: '↑ 上方',
    crop_south: '↓ 下方',
    crop_east: '→ 右側',
    crop_west: '← 左側',
    crop_northwest: '↖ 左上',
    crop_northeast: '↗ 右上',
    crop_southwest: '↙ 左下',
    crop_southeast: '↘ 右下',
    file_list_header_prefix: '處理清單',
    btn_clear_all: '清除全部',
    btn_process_all: '開始處理',
    btn_download_all: '全部下載（ZIP）',
    footer: 'TinyImage — 本地圖片壓縮，檔案不會上傳至任何伺服器',
    copyright: '© 2026 Bruce Lee · TinyImage。版權所有。',
    coffee_link: '☕ 買杯咖啡',
  },

  // 執行時由 script.js 使用的動態文字
  messages: {
    btn_download: '下載',
    btn_remove: '移除',
    status_pending: '等待中',
    status_processing: '處理中',
    status_error: '失敗',
    error_max_size: '「{name}」超過 50 MB 限制，已跳過。',
    error_crop_required: '裁切模式需要同時填寫寬度與高度',
    error_cannot_read: '無法讀取圖片',
    error_cannot_load: '無法載入圖片',
    error_cannot_output: '無法輸出圖片',
    error_no_canvas: '瀏覽器不支援圖片處理',
    error_dimension: '{label} 必須介於 1 到 10000 px',
    error_packing: '打包失敗：{error}',
    error_packing_title: '打包中…',
  },

  // 在地常用裁切尺寸：[寬, 高, 名稱]
  presets: [
    { platform: 'Facebook', items: [
      [1080, 1080, '方形 1:1'], [1080, 1350, '直式 4:5'], [1200, 630, '連結分享圖'],
      [851, 315, '粉專封面'], [1080, 1920, '限時動態'],
    ] },
    { platform: 'Instagram', items: [
      [1080, 1080, '方形 1:1'], [1080, 1350, '直式 4:5'], [1080, 566, '橫式 1.91:1'],
      [1080, 1920, '限動／Reels'], [320, 320, '大頭貼'],
    ] },
    { platform: 'Threads・LINE・蝦皮', items: [
      [1080, 1440, 'Threads 直式 3:4'], [1040, 1040, 'LINE 圖文訊息'],
      [1024, 1024, '蝦皮商品圖'], [1280, 720, 'YouTube 縮圖'],
    ] },
  ],

  features: {
    title: '功能說明',
    intro: 'TinyImage 是一款免安裝、免註冊的線上圖片壓縮工具。不論是要縮小照片檔案大小、調整圖片尺寸，或是把照片裁切成社群貼文需要的比例，打開網頁就能完成，而且所有圖片都只在你的瀏覽器內處理。',
    items: [
      { title: '圖片壓縮', text: '重新編碼 JPG、PNG、WebP，在維持清晰畫質的前提下大幅縮小檔案大小，加快網頁載入與傳送速度。' },
      { title: '等比例縮小', text: '輸入最大寬度或高度，照片會等比例縮小，不會變形，也不會放大造成模糊。' },
      { title: '精準裁切', text: '指定寬高與裁切錨點，一次裁出 FB、IG、Threads、LINE、蝦皮需要的尺寸。' },
      { title: '批次處理與 ZIP 下載', text: '一次拖曳多張圖片，處理完成後可以逐張下載，或打包成 ZIP 一次帶走。' },
      { title: '不上傳、保護隱私', text: '壓縮與裁切都在瀏覽器端完成，圖片不會傳到任何伺服器，身分證件、合約照片也能安心處理。' },
      { title: '中文檔名友善', text: '自動清除檔名中的特殊符號，下載檔名會附上實際輸出尺寸，方便整理。' },
    ],
  },

  useCases: {
    title: '在地使用情境',
    items: [
      { title: '蝦皮、露天賣家上架', text: '把手機拍的商品照裁成 1:1 方形並壓縮，上架更快、買家瀏覽也更順。' },
      { title: 'LINE 傳照片不糊', text: '先縮小再傳，避免原圖太大傳送失敗，LINE 官方帳號的圖文訊息也能直接裁成 1040×1040。' },
      { title: 'FB 粉專、IG、Threads 經營', text: '用常用尺寸按鈕一鍵套用貼文、限動、封面比例，小編不用再查尺寸表。' },
      { title: '政府網站、學校報名上傳', text: '報名表或線上申辦常限制檔案大小，先壓縮證件照與文件照片，就能順利通過上傳限制。' },
    ],
  },

  faq: {
    title: '常見問題',
    items: [
      { q: 'TinyImage 是免費的嗎？', a: '完全免費，不需要註冊或安裝軟體，也沒有每日張數限制。' },
      { q: '我的圖片會被上傳到伺服器嗎？', a: '不會。所有壓縮與裁切都在你的瀏覽器內完成，圖片不會離開你的電腦或手機。' },
      { q: '支援哪些圖片格式？', a: '可以匯入 JPG、PNG、WebP、GIF、AVIF 等瀏覽器能開啟的格式。JPG、PNG、WebP 會維持原格式輸出，其他格式會轉成 JPG。' },
      { q: '壓縮後畫質會變差嗎？', a: 'JPG 與 WebP 採用高品質設定，肉眼幾乎看不出差異；PNG 為無損格式，若想要更小的檔案，可以搭配縮小尺寸一起使用。' },
      { q: 'IG、FB 貼文的最佳尺寸是多少？', a: 'IG 方形貼文建議 1080×1080、直式 1080×1350，限時動態與 Reels 為 1080×1920；FB 連結分享圖為 1200×630。在「裁切並壓縮」分頁點選常用尺寸按鈕即可套用。' },
      { q: '一次可以處理幾張？檔案大小有限制嗎？', a: '可以一次拖曳多張圖片批次處理，單檔上限為 50 MB。' },
    ],
  },
};
