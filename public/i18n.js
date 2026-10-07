// 此檔由 scripts/build.js 產生，請勿直接修改（來源：locales/*.js）
// 頁面語言由網址決定（/<lang>/），這裡只提供 script.js 執行時需要的動態文字
const i18n = (() => {
  const MESSAGES = {
  "zh-tw": {
    "btn_download": "下載",
    "btn_remove": "移除",
    "status_pending": "等待中",
    "status_processing": "處理中",
    "status_error": "失敗",
    "error_max_size": "「{name}」超過 50 MB 限制，已跳過。",
    "error_crop_required": "裁切模式需要同時填寫寬度與高度",
    "error_cannot_read": "無法讀取圖片",
    "error_cannot_load": "無法載入圖片",
    "error_cannot_output": "無法輸出圖片",
    "error_no_canvas": "瀏覽器不支援圖片處理",
    "error_dimension": "{label} 必須介於 1 到 10000 px",
    "error_packing": "打包失敗：{error}",
    "error_packing_title": "打包中…",
    "label_crop_width": "裁切寬度",
    "label_crop_height": "裁切高度"
  },
  "en": {
    "btn_download": "Download",
    "btn_remove": "Remove",
    "status_pending": "Pending",
    "status_processing": "Processing",
    "status_error": "Failed",
    "error_max_size": "\"{name}\" exceeds the 50 MB limit and was skipped.",
    "error_crop_required": "Crop mode requires both width and height",
    "error_cannot_read": "Unable to read image",
    "error_cannot_load": "Unable to load image",
    "error_cannot_output": "Unable to export image",
    "error_no_canvas": "Your browser does not support image processing",
    "error_dimension": "{label} must be between 1 and 10000 px",
    "error_packing": "Packing failed: {error}",
    "error_packing_title": "Packing…",
    "label_crop_width": "Crop Width",
    "label_crop_height": "Crop Height"
  },
  "ja": {
    "btn_download": "ダウンロード",
    "btn_remove": "削除",
    "status_pending": "待機中",
    "status_processing": "処理中",
    "status_error": "失敗",
    "error_max_size": "「{name}」は 50 MB を超えているためスキップしました。",
    "error_crop_required": "トリミングには幅と高さの両方が必要です",
    "error_cannot_read": "画像を読み込めません",
    "error_cannot_load": "画像を表示できません",
    "error_cannot_output": "画像を書き出せません",
    "error_no_canvas": "お使いのブラウザは画像処理に対応していません",
    "error_dimension": "{label}は 1〜10000 px で入力してください",
    "error_packing": "ZIP の作成に失敗しました：{error}",
    "error_packing_title": "ZIP 作成中…",
    "label_crop_width": "切り抜き幅",
    "label_crop_height": "切り抜き高さ"
  },
  "ko": {
    "btn_download": "다운로드",
    "btn_remove": "삭제",
    "status_pending": "대기 중",
    "status_processing": "처리 중",
    "status_error": "실패",
    "error_max_size": "\"{name}\" 파일이 50 MB를 초과하여 건너뛰었습니다.",
    "error_crop_required": "자르기에는 너비와 높이가 모두 필요합니다",
    "error_cannot_read": "이미지를 읽을 수 없습니다",
    "error_cannot_load": "이미지를 불러올 수 없습니다",
    "error_cannot_output": "이미지를 저장할 수 없습니다",
    "error_no_canvas": "이 브라우저는 이미지 처리를 지원하지 않습니다",
    "error_dimension": "{label}은(는) 1~10000 px 사이여야 합니다",
    "error_packing": "ZIP 생성 실패: {error}",
    "error_packing_title": "ZIP 생성 중…",
    "label_crop_width": "자를 너비",
    "label_crop_height": "자를 높이"
  },
  "es": {
    "btn_download": "Descargar",
    "btn_remove": "Quitar",
    "status_pending": "En espera",
    "status_processing": "Procesando",
    "status_error": "Error",
    "error_max_size": "\"{name}\" supera el límite de 50 MB y se omitió.",
    "error_crop_required": "Para recortar necesitas indicar ancho y alto",
    "error_cannot_read": "No se puede leer la imagen",
    "error_cannot_load": "No se puede cargar la imagen",
    "error_cannot_output": "No se puede exportar la imagen",
    "error_no_canvas": "Tu navegador no admite el procesamiento de imágenes",
    "error_dimension": "{label} debe estar entre 1 y 10000 px",
    "error_packing": "No se pudo crear el ZIP: {error}",
    "error_packing_title": "Creando ZIP…",
    "label_crop_width": "Ancho de recorte",
    "label_crop_height": "Alto de recorte"
  },
  "pt": {
    "btn_download": "Baixar",
    "btn_remove": "Remover",
    "status_pending": "Aguardando",
    "status_processing": "Processando",
    "status_error": "Falhou",
    "error_max_size": "\"{name}\" ultrapassa o limite de 50 MB e foi ignorado.",
    "error_crop_required": "Para recortar, informe a largura e a altura",
    "error_cannot_read": "Não foi possível ler a imagem",
    "error_cannot_load": "Não foi possível carregar a imagem",
    "error_cannot_output": "Não foi possível exportar a imagem",
    "error_no_canvas": "Seu navegador não suporta processamento de imagens",
    "error_dimension": "{label} deve estar entre 1 e 10000 px",
    "error_packing": "Falha ao criar o ZIP: {error}",
    "error_packing_title": "Criando ZIP…",
    "label_crop_width": "Largura do recorte",
    "label_crop_height": "Altura do recorte"
  }
};
  const locale = document.documentElement.dataset.locale;
  const dict = MESSAGES[locale] || MESSAGES.en;

  // 記住使用者選擇的語言，之後造訪 / 時由伺服器導向該語言
  document.addEventListener('click', e => {
    const link = e.target.closest('a[data-lang]');
    if (link) document.cookie = `tinyimage_lang=${link.dataset.lang}; path=/; max-age=31536000; SameSite=Lax`;
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
        text = text.replaceAll(`{${k}}`, v);
      }
      return text;
    },
  };
})();
