# 完整部署流程說明

這份文件整理了目前這個網站從本機版本部署到 `Vercel + Supabase` 的完整流程，包含：
- Supabase 建立與設定
- GitHub 上傳
- Vercel 部署
- 後台登入
- 上線後的注意事項

對應專案位置：
- 專案根目錄：[D:\codex\industrial-corporate-site](D:\codex\industrial-corporate-site)
- 後台頁面：[admin-mockup.html](/D:/codex/industrial-corporate-site/admin-mockup.html)
- SQL 檔案：[supabase-schema.sql](/D:/codex/industrial-corporate-site/supabase-schema.sql)

## 架構說明

目前這個版本採用：
- `Vercel`：部署前台網站與後台頁面
- `Supabase`：儲存網站內容、後台登入帳號

運作方式：
- 前台網站會優先讀取 Supabase 的內容
- 後台登入後可直接編輯 Supabase 資料
- 若尚未設定 Supabase，系統會退回本機 JSON / localStorage 模式

## 一、建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com)
2. 登入後按 `New project`
3. 輸入專案名稱，例如：`industrial-corporate-site`
4. 設定一組資料庫密碼，請自己另外保存
5. Region 建議選離你近的，例如 `Singapore`
6. 等待專案建立完成

## 二、建立資料表

1. 進入 Supabase 專案
2. 左側點 `SQL Editor`
3. 建立新查詢
4. 打開 [supabase-schema.sql](/D:/codex/industrial-corporate-site/supabase-schema.sql)
5. 把整段 SQL 貼進去
6. 點 `Run`

執行後會建立：
- `site_content` 資料表
- 基本的 Row Level Security
- 匿名可讀、登入者可寫的 policy

## 三、建立後台登入帳號

1. 左側點 `Authentication`
2. 點 `Users`
3. 按 `Add user`
4. 建立一組管理員 email 與密碼

這組帳密之後會用來登入：
- `https://你的網站網址/admin-mockup.html`

## 四、取得 Supabase API 資訊

1. 左側點 `Project Settings`
2. 點 `API`
3. 記下以下兩個值：

- `Project URL`
- `anon public key`

之後在 Vercel 會用到：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 五、把專案上傳到 GitHub

如果你的專案還沒上 GitHub，請在專案資料夾執行：

```powershell
cd D:\codex\industrial-corporate-site
git init
git add .
git commit -m "Initial site deploy setup"
```

然後：
1. 到 GitHub 建立新 repo
2. 把 repo URL 複製起來
3. 回到本機執行：

```powershell
git remote add origin 你的GitHub倉庫網址
git branch -M main
git push -u origin main
```

## 六、部署到 Vercel

1. 前往 [Vercel](https://vercel.com)
2. 登入後點 `Add New Project`
3. 匯入剛剛的 GitHub repo
4. Framework Preset 選 `Other`
5. Root Directory 設成這個專案資料夾
6. 先不要急著部署，先設定環境變數

## 七、在 Vercel 設定環境變數

在 Vercel Project Settings 裡新增：

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

對應填入：
- Supabase 的 `Project URL`
- Supabase 的 `anon public key`

設定完成後重新部署。

## 八、部署完成後的網址

部署完成後通常會有：

- 前台首頁：
  - `https://你的網址/`
- 後台頁面：
  - `https://你的網址/admin-mockup.html`

## 九、如何登入後台

1. 打開後台頁面
2. 如果右上方看到 `Supabase 雲端模式`
   代表 Vercel 已經正確讀到 Supabase 設定
3. 輸入你在 Supabase Auth 建立的管理員帳號密碼
4. 登入成功後即可直接修改網站內文
5. 按右上角 `儲存全部變更`

## 十、網站內容更新邏輯

### 正式模式
- 後台儲存後會直接寫進 Supabase
- 前台重新整理後會讀到最新內容
- 所有訪客看到的是同一份內容

### 本機備援模式
如果 Vercel 或本地沒有 Supabase 設定：
- 後台仍可編輯
- 但只會存到瀏覽器 localStorage
- 不會同步給所有訪客

## 十一、部署前要檢查的檔案

重要檔案如下：

- [admin-mockup.html](/D:/codex/industrial-corporate-site/admin-mockup.html)
- [admin.js](/D:/codex/industrial-corporate-site/admin.js)
- [content-store.js](/D:/codex/industrial-corporate-site/content-store.js)
- [content-loader.js](/D:/codex/industrial-corporate-site/content-loader.js)
- [content-fields.json](/D:/codex/industrial-corporate-site/content-fields.json)
- [content-fields-en.json](/D:/codex/industrial-corporate-site/content-fields-en.json)
- [api/public-config.js](/D:/codex/industrial-corporate-site/api/public-config.js)
- [vercel.json](/D:/codex/industrial-corporate-site/vercel.json)

## 十二、重要注意事項

### 1. `anon key` 可以放前端嗎
可以。

這是 Supabase 設計上的公開 key，但前提是：
- 資料表要開好 RLS
- 沒登入的人只能讀，不能寫

所以真正保護資料的是：
- Row Level Security
- Auth 登入規則

### 2. 後台網址目前是公開可見的
目前任何人都能打開後台頁網址，但：
- 沒登入不能寫入雲端內容

如果你要更正式，可以之後再做：
- 自訂 `/admin`
- 中介登入頁
- 僅允許特定 email 登入

### 3. 目前文字可編輯，圖片還沒完整接雲端
目前後台主要是文字欄位管理。

如果你接下來要：
- 圖片上傳
- 圖片網址儲存
- 多圖管理

可以再擴充：
- Supabase Storage
- 後台圖片欄位

### 4. Vercel 環境變數改完要重新部署
如果你新增或修改：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

請記得重新部署，不然前台抓不到新的設定。

### 5. 請避免直接刪掉 Supabase 裡的 policy
如果把 policy 刪錯，可能會出現：
- 前台讀不到資料
- 後台無法儲存

## 十三、建議上線後的驗收清單

部署完成後，建議逐項確認：

1. 前台首頁可以正常開啟
2. 中英文切換正常
3. 後台頁可以正常開啟
4. 能用管理員帳號登入
5. 修改一個欄位後可以成功儲存
6. 前台重新整理後能看到更新內容
7. 換另一台裝置打開前台，也能看到相同更新

## 十四、如果你之後要做得更正式

下一步可考慮補：

- 把 `admin-mockup.html` 改成正式 `admin.html`
- 限制只有指定 email 可登入
- 圖片上傳到 Supabase Storage
- 增加產品列表管理
- 增加更新紀錄或版本回復

## 十五、目前最適合你的使用方式

如果你現在目標是：
- 先上線
- 先有可用後台
- 客戶可以改文案

那你就照這份文件部署即可。

等你真的開始正式上線使用後，再決定要不要補：
- 圖片管理
- 更完整權限控制
- 更正式的後台網址與版型
