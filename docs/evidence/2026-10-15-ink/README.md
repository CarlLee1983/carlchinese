# 書法與水墨改版

使用者否決前版，明確要求「書法、水墨化的美感」。本次以這項指示取代前版青綠書頁與館藏縮圖方向，不再以圖片數量或抽籤分數作為設計成功的主張。

首頁採手寫筆勢、飛白與暈墨山水，題字為「一起讀懂中文」。題字為圖片，`h1` 內的圖片 alt 提供相同可存取名稱。閱讀入口及說明維持 HTML；手機在主視覺下方顯示，不覆蓋題字。三篇樣章以直排詩句預覽，保留鍵盤、片段網址、歷史導覽與無 JavaScript fallback。

目錄及作品頁採楷體標題、清楚的明體正文，墨梅圖像置於右下側，不改動原文、賞析、共學或來源資料。正文語意色條保留。字體使用本機 Kaiti TC／STKaiti／KaiTi 與宋體 fallback，各平台外觀可能不同。動態遵守 reduced-motion。

## 新資產

使用內建 image_gen 工具生成，沒有使用 API CLI。這些圖像不是古籍原件或史實證據，首頁頁尾明示 AI 生成。

- [calligraphy-ink.webp](../../../public/art/calligraphy-ink.webp)：書法主視覺，約 204 KB。
- [plum-ink.webp](../../../public/art/plum-ink.webp)：水墨梅枝及遠山，約 61 KB。

原始 PNG 保存在本機 `.scratch/design/ink/source-assets/`；WebP 只做編碼壓縮，未改變內容。前版館藏圖及來源記錄移到歷史證據 `../2026-10-15-design/superseded-art/`，不再進入正式網站。

生成提示：

> 主視覺：Create a premium Chinese literati ink-wash website hero artwork, wide landscape 3:2 ratio, for Traditional Chinese reading site CarlChinese. Finished raster artwork, not website screenshot. Near-white xuan rice paper #f7f7f2 with subtle fibres. Left 52%: expressive hand-brushed running-script, exact Traditional Chinese text 一起讀懂 on upper line and 中文 on lower line. Authentic xingshu, visible dry-brush flying-white, wet pools, legible characters. Right half and bottom: ethereal layered shanshui mountains, distant pavilion, diluted gray ink and dark pine lower right. Natural ink diffusion, no rectangular bounds. Bottom-left beneath calligraphy largely empty for HTML text. One tiny vermilion abstract seal. Black, gray, white; no green panels, cards, UI, photographs, aged yellow paper, gold or frame.

> 梅枝：An exquisite Chinese ink wash painting on near-white xuan paper #f7f7f2, wide horizontal composition. No text, calligraphy or stamp. Slender plum branch from lower right, rich black dry-brush strokes and sparse pale ink blossoms; bottom left low misty mountains. Upper 65% empty paper, centre 65% almost blank for live poetry. Natural diffusion and flying-white, sparse asymmetry, grayscale only. No border, mockup, aged paper.

## 驗證與限制

第一輪完整 verify 中，原文區增加的底部留白導致春望桌機跳轉測試失敗；已恢復原本 padding，將墨梅背景移到右側，未改測試斷言。最終結果見 [verify.log](verify.log)。

手機、平板、桌機 390／768／1440px 檢視無水平溢出；reduced-motion 下動畫數量為零。原有閱讀功能另由完整瀏覽器測試確認。

技能 lint 無禁止模式。技能 inspector 的圖片數量門檻不通過：本次只採兩張完整主視覺，依使用者要求的水墨留白，不再堆疊四張配圖。它亦將相鄰詩作作者誤判為眉題，並提醒三種字體、紙色、無影片；這些保留為具體偏離項，不宣稱技能全數通過。使用者對前版的否決優先於前版自評分數，本輪不把主觀自評當作使用者驗收。

畫面：[桌機](home-1440.jpg)、[平板](home-768.jpg)、[手機](home-390.jpg)。底部開發工具列是 Astro dev UI，不進正式產物。公開發布與內容來源補證仍依原交接條件，未提交或部署。
