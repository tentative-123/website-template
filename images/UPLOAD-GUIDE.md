# 圖片上傳與檔名對應（做法 A）

本專案已改成每個圖框直接讀取固定檔名圖片：

- 路徑：`/images/*.jpg`
- 命名規則：`<欄位代號>.jpg`，把 `.` 改成 `-`
  - 例如：`home.hero_image_title` → `images/home-hero_image_title.jpg`

> 建議先用 `.jpg`，尺寸大圖可壓到 250KB~600KB（品質 70~82）以兼顧清晰與載入速度。

## 1) 首頁（Home）
- `images/home-hero_image_title.jpg`
- `images/home-featured_card_1_image_title.jpg`
- `images/home-featured_card_2_image_title.jpg`
- `images/home-featured_card_3_image_title.jpg`
- `images/home-about_image_title.jpg`

## 2) 關於我們（About）
- `images/about-hero_image_title.jpg`
- `images/about-factory_image_title.jpg`
- `images/about-team_image_title.jpg`

## 3) 產品服務（Products）
- `images/products-hero_image_title.jpg`
- `images/products-product_1_image_title.jpg`
- `images/products-product_2_image_title.jpg`
- `images/products-product_3_image_title.jpg`
- `images/products-detail_image_title.jpg`

## 4) 設備技術（Technology）
- `images/technology-hero_image_title.jpg`
- `images/technology-equipment_image_a_title.jpg`
- `images/technology-equipment_image_b_title.jpg`
- `images/technology-process_image_title.jpg`

## 5) 品質認證（Quality）
- `images/quality-hero_image_title.jpg`
- `images/quality-cert_image_title.jpg`
- `images/quality-measure_image_title.jpg`

## 6) 聯絡我們（Contact）
- `images/contact-hero_image_title.jpg`
- `images/contact-map_image_title.jpg`

---

## 上傳方式（GitHub）

1. 進入 repo 的 `images/` 資料夾。
2. Upload files，把對應檔名的圖片拖進去。
3. 若要替換圖片，直接上傳同檔名覆蓋即可。
4. Commit 之後，GitHub Pages 重新部署完成就會生效。

## 常見問題

- 圖片沒更新：請強制重新整理（`Ctrl + F5` / `Cmd + Shift + R`）。
- 比例怪怪的：目前使用 `object-fit: cover`，建議先裁成相近比例再上傳。
