const express = require('express');
const path = require('node:path');

const app = express();
app.disable('x-powered-by'); // 避免揭露伺服器框架版本資訊

// 圖片處理全部在瀏覽器端完成，伺服器只提供靜態檔案
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TinyImage 已啟動：http://localhost:${PORT}`);
});
