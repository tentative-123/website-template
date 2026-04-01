# 網站文案後台欄位清單

這份清單是給未來後台、CMS 或管理介面使用的文案對照表。

對應檔案：
- JSON 欄位來源：[content-fields.json](/D:/codex/industrial-corporate-site/content-fields.json)
- 網站首頁：[index.html](/D:/codex/industrial-corporate-site/index.html)

## 建議使用方式

1. 後台直接以 `page + field_key` 方式管理文字。
2. 每次修改文字時，只要更新對應欄位值，就能同步改網站內文。
3. 圖片欄位也已一併列出，可延伸成圖片上傳欄位。

## 頁面欄位分類

### 全站共用
- `site.company_name`
- `site.company_name_full`
- `site.english_name`
- `site.footer_text`

### 導覽列
- `navigation.home`
- `navigation.about`
- `navigation.products`
- `navigation.technology`
- `navigation.quality`
- `navigation.contact`

### 首頁
- `home.*`
  - Hero 標語、按鈕文字、三大優勢、主打產品卡片、企業簡介區

### 關於我們
- `about.*`
  - 公司簡介、經營理念、工廠規模、里程碑

### 產品服務
- `products.*`
  - 頁首文案、產品分類、應用領域、客製化能力

### 設備技術
- `technology.*`
  - 設備清單、生產工藝、研發實力

### 品質認證
- `quality.*`
  - 認證證書、檢驗流程、量測儀器

### 聯絡我們
- `contact.*`
  - 聯絡資料、表單欄位名稱、placeholder、送出按鈕、提示訊息

## 後續如果要真的接後台

最適合的做法是把網站改成由這份 JSON 讀取資料。這樣你之後只改資料，不用再手動改 HTML。
