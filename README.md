# 行銷網站模板（含簡易 CMS 後台）

這是一套可直接上線的**企業形象網站模板**，內建：

- 多頁式靜態前台（首頁 / 關於 / 產品服務 / 設備技術 / 品質認證 / 聯絡我們）
- 中英文內容切換（`zh` / `en`）
- 可編輯文字內容的後台（`admin-mockup.html`）
- 兩種儲存模式：
  - 本機模式：JSON + `localStorage`
  - 雲端模式：Supabase（登入後可寫入）
- Vercel API 設定端點（提供前端 Supabase 公開設定）

---

## 1. 專案定位

此專案適合：

- 想快速交付一個可改文案的公司官網
- 前期先用靜態頁，後期再接雲端內容管理
- 不想先引入大型框架（如 React / Vue）

技術上採用「**原生 HTML/CSS/JS + 可選 Supabase**」：

- 前台渲染由 `content-loader.js` 將欄位值寫入 `data-field` 標記元素
- 內容來源統一由 `content-store.js` 管理（本機 / 雲端切換與 fallback）
- 後台由 `admin.js` 動態產生編輯表單與儲存流程

---

## 2. 專案結構

```text
.
├─ index.html / about.html / products.html / technology.html / quality.html / contact.html
├─ admin-mockup.html             # 後台頁面
├─ styles.css                    # 前後台共用樣式
├─ script.js                     # 前台互動（選單、表單提示等）
├─ content-loader.js             # 將內容資料套用到頁面 DOM
├─ content-store.js              # 內容載入/儲存核心（local + Supabase）
├─ admin.js                      # 後台邏輯（欄位渲染、儲存、匯入匯出、登入）
├─ content-fields.json           # 中文預設內容
├─ content-fields-en.json        # 英文預設內容
├─ api/public-config.js          # Vercel Serverless API（回傳 Supabase 設定）
├─ supabase-schema.sql           # Supabase 資料表與 policy
├─ vercel.json                   # Vercel 設定
└─ DEPLOY-VERCEL-SUPABASE.md     # 快速部署說明
```

---

## 3. 本機啟動

> 這是靜態網站，請用本機 HTTP server 啟動，避免直接用 `file://` 開啟造成 `fetch` 失敗。

### 方式 A：Python

```bash
python3 -m http.server 8080
```

### 方式 B：Node

```bash
npx serve .
```

啟動後可開啟：

- 前台：`http://localhost:8080/index.html`
- 後台：`http://localhost:8080/admin-mockup.html`

---

## 4. 內容系統運作方式

### 前台讀取順序

`content-store.js` 的內容解析流程：

1. 嘗試讀取 Supabase（若有設定且可連線）
2. 若雲端不可用，讀取 `content-fields*.json`
3. 再套用本機 `localStorage` override（若存在）

### 後台儲存邏輯

在 `admin-mockup.html` 編輯內容後：

1. 若有 Supabase 設定且已登入 → 寫入 `site_content`
2. 若雲端不可用 / 寫入失敗 → 回退儲存至 `localStorage`

### 語言切換

- 支援 `zh` / `en`
- 透過 query string `?lang=zh` 或 `?lang=en` 指定
- 未指定時，使用 `localStorage` 的 `site-language`，預設 `zh`

---

## 5. 後台功能清單

`admin-mockup.html` + `admin.js` 目前提供：

- 依頁面分組編輯欄位（含 SEO 欄位）
- 中文 / 英文分語言編輯
- 即時 iframe 預覽
- 匯出 JSON
- 匯入 JSON
- 還原當前語言內容
- Supabase Auth 登入 / 登出

---

## 6. Supabase 資料結構

請先執行 `supabase-schema.sql`。

核心資料表：`site_content`

建議欄位結構（依 SQL 檔為準）：

- `language`（語言）
- `page`（頁面群組）
- `key`（欄位鍵值）
- `value`（文字內容）

前台以 `page + key` 組回巢狀 JSON 後套用。

---

## 7. 部署（Vercel + Supabase）

1. 建立 Supabase 專案並執行 `supabase-schema.sql`
2. 到 Vercel 匯入本 repo
3. 設定環境變數：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. 重新部署

`api/public-config.js` 會把上述環境變數提供給前端初始化 Supabase。

更完整流程請看：

- `DEPLOY-VERCEL-SUPABASE.md`
- `README-DEPLOY-FULL.md`

---

## 8. 部署（GitHub Pages，純靜態模式）

如果你只需要先上前台（不依賴 Vercel API），可用 GitHub Pages 快速部署。

### 8.1 建立與推送 repo

1. 將專案推到 GitHub（例如 `main` branch）
2. 確認根目錄包含 `index.html`

### 8.2 開啟 GitHub Pages

1. 進入 GitHub 專案頁 → `Settings` → `Pages`
2. `Source` 選 `Deploy from a branch`
3. Branch 選 `main`（或你的部署分支）/ Folder 選 `/ (root)`
4. 儲存後等待 GitHub 完成部署

部署完成後可用網址通常是：

- `https://<你的帳號>.github.io/<repo-name>/`

### 8.3 GitHub Pages 模式的行為

- 前台可正常讀取 `content-fields.json` / `content-fields-en.json`
- 後台可用，但內容會走本機 `localStorage`
- `/api/public-config` 在 GitHub Pages 不存在，因此不會啟用 Vercel 的環境變數注入流程

> 若你要使用 Supabase 的雲端設定端點（`/api/public-config`）與完整雲端模式，建議使用 Vercel 部署。

---

## 9. 常見調整方式

### 新增可編輯欄位

1. 在某頁 HTML 加上 `data-field="page.key"`（或 placeholder / href 類型）
2. 在 `content-fields.json` 與 `content-fields-en.json` 新增對應欄位
3. 後台會自動讀出該欄位並提供編輯

### 修改預設文案

直接編輯：

- `content-fields.json`（中文）
- `content-fields-en.json`（英文）

### 更換品牌與樣式

- 視覺與版面：`styles.css`
- 互動行為：`script.js`
- 圖片檔名與上傳對應：`images/UPLOAD-GUIDE.md`

---

## 10. 已知限制

- 目前重點是文字內容管理，尚未完成圖片上傳流程
- 後台網址可被訪問，但雲端寫入需登入（依 RLS 與 Auth 控制）
- 若未設 Supabase，資料只存在該裝置瀏覽器

---

## 11. 建議下一步

- 導入圖片上傳（Supabase Storage）
- 新增更正式的後台路由（例如 `/admin`）
- 增加欄位驗證與版本回復機制
- 補齊自動化檢查（例如 HTML/Lighthouse）

---

## License

若此模板用於商業專案，建議在交付前補上正式 License 與授權條款。
