> 此版已被使用者否決；以下為歷史證據。目前介面改採書法與水墨，見 [水墨改版](../2026-10-15-ink/README.md)。

# 中國風閱讀介面改版

設計範圍為首頁、系列目錄、作品閱讀頁與共用導覽。正文、313 首篇目、來源登錄、前後篇順序及組詩關係未改動。新增本地圖片約 620 KB，沒有新增套件、外部字體請求、後端或部署設定。回復本次介面檔案即可回退，不需資料遷移。

## 方向與取捨

採用 design-taste-frontend 的 **The page is the object**，seed `1323771328`。概念：CarlChinese 的三篇完整樣章成為可翻閱的詩箋，讓讀者先選一句，再進入原文、深入賞析與親子共學。

字體抽籤曾重抽一次：原 heavy grotesk 不適合繁體中文書卷，最後將 serif／sans 角色映射為本機宋體與系統字體。色彩保留分區比例，改以紙白、墨黑、青綠呈現。About 從 founder letter 改抽 side facts / wide paragraph，因本站沒有創辦人書信或肖像，不能編造。頁尾保留書頁背面的收束方式，不添加假地址、郵票裝飾或客戶證言。

互動為三首樣章預覽，支援點選、Enter、片段網址與瀏覽器上一頁／下一頁。無 JavaScript 時全部樣章和閱讀連結直接呈現。動態只在首頁，含圖像展開與分段進場；減少動態效果設定關閉動畫。目錄及長篇閱讀頁維持靜態，保留真實底本序號與四種語意色條，不將這些閱讀契約當成裝飾刪除。

使用本機中文字體，實際外觀會依裝置字體而異。沒有虛構樣章或待替換的示例文案。新增館藏圖像只提供閱讀氛圍，不宣稱畫作描繪詩作本事或唐代實景。

## 圖像來源

四張均由 The Metropolitan Museum of Art 提供，公有領域／[CC0](https://creativecommons.org/publicdomain/zero/1.0/)。首頁頁尾「畫作來源與授權」逐張列名及連結，原始下載資訊保存在 [credits.json](superseded-art/credits.json)。本地縮圖與 CSS 裁切用於顯示，未使用技能附帶照片或自行繪製的代替圖片。

| 畫作 | 作者／年代 | 使用位置 |
| --- | --- | --- |
| [River and landscape](https://www.metmuseum.org/art/collection/search/931206) | Huang Yue（黃鉞） | 首屏長卷 |
| [Gentlemen gazing at a waterfall](https://www.metmuseum.org/art/collection/search/40196) | 佚名，13 世紀 | 遊子吟預覽 |
| [Landscape after Hua Yan](https://www.metmuseum.org/art/collection/search/904034) | Liu Yanchong（劉彥沖），1843 | 春望預覽 |
| [Moonlit terrace](https://www.metmuseum.org/art/collection/search/51392) | 佚名，17 世紀 | 靜夜思預覽 |

已搜尋 Chinese calligraphy ink 影片，未找到可用素材，因此不放影片；採短暫圖像縮放，不循環播放。

## 驗證

- [完整 verify 記錄](verify.log)：Astro check 無錯誤／警告／提示；313 首篇目與三篇作品驗證；44 項 Node 測試、2 項組詩測試、30 項正式瀏覽器測試通過。
- 新測試涵蓋鍵盤操作、無 JavaScript、直接片段網址與前後歷史。獨立審查找到的片段網址問題已修正，複審無剩餘實質問題。
- 首頁技能 lint 為 0 FAIL／0 WARN；瀏覽器 inspector 在 1440、768、390px 為 0 FAIL，只有無影片警告，理由見上。
- 另檢視目錄與春望閱讀頁於 390、768、1440px 的首屏，六個 viewport 都無水平溢出。原有測試涵蓋三篇原文、來源、賞析、共學、層次色條、缺篇及私有 fixture 隔離。
- 這是軟體與視覺驗證；不變更[閱讀頁交接](../../reading-page-handoff.md)所列來源補證、授權及實際親子試讀的待辦狀態。

## 視覺評估

ROUND 1
Seen in one second: 青綠書頁上的「一起讀懂中文」。
Idea (one sentence): 三篇樣章成為可翻閱的詩箋。
Live thing: 點選樣章看原文並進入閱讀。
Layout words by section: hero=book-cover / classics=index-and-leaf / areas=columns / footer=back-cover。
Scores: design 6.5 · usability 8 · creativity 7 · content 8 → overall 6.0（技能失敗上限）。
Caps applied: 圖像數量與動態檢查未通過。
Top three problems: 桌機畫作索引過小；手機的段末短句被判為眉題；字級過多。調整為可辨識畫作索引、合併準備狀態文案、統一五級文字。

ROUND 2
Seen in one second: 書卷與大字。
Idea (one sentence): 三篇完整樣章構成可翻閱的閱讀入口。
Live thing: 點選／鍵盤切換詩箋。
Layout words by section: hero=book-cover / classics=index-and-leaf / areas=columns / footer=back-cover。
Scores: design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.6。
Caps applied: 概念仍屬已知書卷手法，創意評分不超過 7。
Top three problems: 桌機詩箋下方空白偏多；平板第三個選項換行；長卷原檔黑邊較重。前兩項以自適應 grid 與獨立提問列修正；原檔黑邊保留，維持畫卷裝裱邊界。

ROUND 3
Seen in one second: 青綠書頁與水墨長卷。
Idea (one sentence): 三篇真實樣章作為可翻閱的閱讀入口。
Live thing: 可分享網址、可鍵盤操作的詩箋預覽。
Layout words by section: hero=book-cover / classics=index-and-leaf / areas=columns / footer=back-cover。
Scores: design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.6。
Caps applied: 創意維持 7；無檢查失敗上限。
Top three problems: 原畫黑邊仍較醒目；桌機詩箋仍有刻意留白；不同作業系統的中文字體細節未逐一人工檢視。保留前兩項，第三項為驗證範圍限制。

最終微調只涉及首頁 grid 與圖像 metadata；其後重新執行 [Astro check](carl-last-check.log)、[正式 build](carl-last-build.log)、[30 項瀏覽器測試](carl-last-browser.log)，皆通過。未變動的內容及 fixture 沿用上述完整 verify 結果。

畫面證據：[桌機首屏](desktop-fold.jpg)、[平板首屏](tablet-fold.jpg)、[手機首屏](mobile-fold.jpg)、[桌機全頁分鏡](desktop-page-01.jpg)、[平板全頁分鏡](tablet-page-01.jpg)、[手機全頁分鏡](mobile-page-01.jpg)。截圖中的底部開發工具列為 Astro 本地開發 UI，不進入正式建置。
