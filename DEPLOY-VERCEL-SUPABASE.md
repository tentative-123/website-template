# Vercel + Supabase 部署說明

這個版本已支援：
- 前台網站部署到 Vercel
- 後台 `admin-mockup.html`
- Supabase Auth 登入
- Supabase `site_content` 資料表讀寫
- 若尚未設定 Supabase，會自動退回本機 JSON / localStorage 模式

## 1. 建立 Supabase 專案

1. 到 Supabase 建立新專案
2. 進入 SQL Editor
3. 貼上 [supabase-schema.sql](/D:/codex/industrial-corporate-site/supabase-schema.sql) 內容後執行
4. 到 `Authentication > Users` 建立一個管理員帳號

## 2. 取得 Supabase 金鑰

到 `Project Settings > API` 取得：
- `Project URL`
- `anon public key`

## 3. 部署到 Vercel

1. 把整個 `industrial-corporate-site` 資料夾上傳到 GitHub
2. 到 Vercel 匯入這個 repo
3. Framework 選 `Other`
4. Root Directory 指到這個專案資料夾

## 4. 在 Vercel 設定環境變數

新增兩個環境變數：

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

這兩個值會由 [api/public-config.js](/D:/codex/industrial-corporate-site/api/public-config.js) 提供給前端使用。

## 5. 重新部署

環境變數加完之後重新部署一次。

部署完成後：
- 前台：`https://你的網址/`
- 後台：`https://你的網址/admin-mockup.html`

## 6. 登入後台

1. 打開後台頁
2. 若右上角顯示 `Supabase 雲端模式`，代表已連上資料庫
3. 輸入你在 Supabase Auth 建立的帳號密碼
4. 登入後即可編輯內容並儲存

## 7. 運作方式

- 前台會優先讀 Supabase `site_content`
- 後台儲存時會直接寫入 Supabase
- 若尚未設定 Supabase，系統會退回本機模式

## 8. 注意事項

- 目前後台網址仍是公開可見，但只有登入後才能寫入資料
- 如果你要更正式，可再加：
  - 自訂 `/admin` 路由
  - 只允許特定 email 登入
  - 後台首頁改名
  - 圖片上傳功能

## 9. 建議你下一步做的事

1. 先照這份文件把版本部署起來
2. 確認後台可登入與儲存
3. 接著再補：
   - 圖片上傳
   - 權限限制
   - 正式後台網址與品牌化
