# 第一版網站驗收證據

2026-10-15，本地 Chromium 實際建置頁面。桌機 1280 × 900、手機 375 × 812。主代理逐一檢視下列 26 張視窗截圖：詩句、長來源與完整標籤可讀，本站觀點虛線可辨識，未發現橫向裁切。截圖記錄指定區塊的視窗，不是全文快照；所有段落、來源與回答的完整性由 Playwright 逐項比對。

[完整 verify 輸出](verify.log)：Astro check 0 錯誤、313 篇目／3 篇教材、44 Node 測試、2 組詩瀏覽器測試、27 正式瀏覽器測試通過。正式建置共 6 頁（首頁、目錄、3 作品、舊網址轉址）。[22 個主要畫面的視窗測量](viewport-checks.json)均無水平溢出；另補拍圖例及提問 4 張。

| 畫面 | 桌機 | 手機 |
| --- | --- | --- |
| 首頁 | [查看](home-desktop.png) | [查看](home-mobile.png) |
| 系列目錄 | [查看](catalog-desktop.png) | [查看](catalog-mobile.png) |
| 遊子吟・原文 | [查看](040-original-desktop.png) | [查看](040-original-mobile.png) |
| 遊子吟・深入賞析 | [查看](040-analysis-desktop.png) | [查看](040-analysis-mobile.png) |
| 遊子吟・親子共學 | [查看](040-family-desktop.png) | [查看](040-family-mobile.png) |
| 春望・原文 | [查看](098-original-desktop.png) | [查看](098-original-mobile.png) |
| 春望・深入賞析 | [查看](098-analysis-desktop.png) | [查看](098-analysis-mobile.png) |
| 春望・親子共學 | [查看](098-family-desktop.png) | [查看](098-family-mobile.png) |
| 靜夜思・原文 | [查看](226-original-desktop.png) | [查看](226-original-mobile.png) |
| 靜夜思・深入賞析 | [查看](226-analysis-desktop.png) | [查看](226-analysis-mobile.png) |
| 靜夜思・親子共學 | [查看](226-family-desktop.png) | [查看](226-family-mobile.png) |
| 遊子吟・圖例與頁內導覽 | [查看](040-legend-desktop.png) | [查看](040-legend-mobile.png) |
| 遊子吟・提問與接話 | [查看](040-questions-desktop.png) | [查看](040-questions-mobile.png) |

這些結果證明軟體呈現與導覽，不代表來源補證、疑字、授權／12 字重疊檢查或實際親子試讀完成。公開前待辦見[閱讀頁交接](../../reading-page-handoff.md)。本次未公開部署。

重跑方式：依[工具鏈說明](../../toolchain.md)安裝，再執行 `pnpm run verify`。畫面取自 `pnpm exec astro preview --ignore-lock --host 127.0.0.1 --port 43158` 的正式 `dist/`；作品區塊依 `#original`、`#analysis`、`#family` 定位後截取上述尺寸的視窗。
