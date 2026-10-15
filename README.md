# CarlChinese

以繁體中文、臺灣讀者為核心的中文閱讀網站，涵蓋生活國語、古典詩文與臺灣文學三條線。首個系列是《唐詩三百首》。每件作品一頁，同頁提供原文、給成人與家長備課用的深入賞析，以及家長可以直接講給孩子聽的「親子共學」。頁面上每段內容都會標示屬於史實、文學解讀或教學想像。

網站沿用 CarlStack、CarlKitchen、CarlEnglish 的做法：內容在本地撰寫，以 Git 管理，建置成靜態網站部署，不做後台。

內容地圖與教材規格 v1.0 已定稿。Astro 靜態網站已有首頁、《唐詩三百首》八卷 313 首目錄及〈遊子吟〉、〈春望〉、〈靜夜思〉三篇可讀作品；尚未撰寫的 310 篇不產生閱讀頁。來源補證、疑字、授權與實際親子試讀仍待驗收，尚未授權公開上線。

本地安裝、開發、驗證與靜態產物操作見[工具鏈](docs/toolchain.md)；軟體驗收與公開前待辦見[閱讀頁交接](docs/reading-page-handoff.md)。

- [閱讀頁交接](docs/reading-page-handoff.md)：從這裡接續工作，查看第一版範圍、驗收責任與待辦。
- [內容地圖](docs/content-map.md)：專區、讀者與系列定位，含三篇樣章入口。
- [篇目核對記錄](docs/catalog-provenance.md)：313 首目錄的錄入依據與核對界限。
- [寫作指南](docs/content-guide.md)與 [schema](docs/content-schema.md)：編輯及資料格式規則。
- [專案詞彙](CONTEXT.md)：內容用語。
- [底本識別](docs/adr/0001-base-edition-identity.md)與[段落標示](docs/adr/0002-paragraph-layers-and-sources.md)：決策理由及重新檢討條件。
