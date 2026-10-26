# 水墨動態驗收證據

2026-10-26，對應 [#11](https://github.com/CarlLee1983/carlchinese/issues/11) 逐首插圖煙霧、[#12](https://github.com/CarlLee1983/carlchinese/issues/12) 作品頁詩句洇墨入場，以及 [#13](https://github.com/CarlLee1983/carlchinese/issues/13)–[#15](https://github.com/CarlLee1983/carlchinese/issues/15) 首頁的水墨動態。在本地 Chromium 實際建置頁面，桌機 1280 × 900、手機 375 × 812。主代理檢視了下列插圖截圖：〈春望〉的河面與遠山有淡霧，人物、殘垣與花鳥都沒有被遮住；〈靜夜思〉是室內場景，畫面上沒有霧。煙霧會持續飄動，截圖只是某一瞬間的畫面。霧層是否存在、位置與版面框是否正確，由 Playwright 逐首比對。

[完整 verify 輸出](verify.log)：Astro check 0 錯誤、58 個 Node 測試、2 個組詩瀏覽器測試、58 個正式瀏覽器測試全部通過（#11–#15 完成後的狀態）。

| 插圖 | 霧帶判定 | 桌機 | 手機 |
| --- | --- | --- | --- |
| 〈春望〉098 | 戶外，高 38–78%、寬 40–100%（河面與遠山） | [查看](098-mist-desktop.png) | [查看](098-mist-mobile.png) |
| 〈靜夜思〉226 | 室內，`null` | [查看](226-mist-desktop.png) | [查看](226-mist-mobile.png) |
| 〈遊子吟〉040 | 室內，`null`（主場景在屋內，門外遠山不加霧） | 未另外截圖 | 未另外截圖 |

判定規則見 [ADR 0003](../../adr/0003-per-illustration-mist.md)。

## 霧材質

`public/art/mist.webp` 由 [mist-source.svg](mist-source.svg) 產生，是一張可以水平接縫平鋪的紙色半透明霧材質。SVG 的參數如下：feTurbulence fractalNoise，baseFrequency `0.0025 0.009`，numOctaves 5，seed 7，stitchTiles；以 feColorMatrix 把雜訊轉成 alpha（`1.6 × R − 0.62`），顏色固定為紙色 `#f5f4ee`；最後 feGaussianBlur 6。

產生步驟：用 Playwright Chromium 開啟包含此 SVG 的頁面，視窗 1600 × 640，以透明背景截圖（`omitBackground: true`）存成 PNG，再執行：

```sh
cwebp -q 80 -alpha_q 70 mist.png -o public/art/mist.webp
```

輸出約 65 KB。重新產生時，要和既有材質並排目視比較，確認濃淡和紋理方向相同。

## 首頁裝飾用圖的煙霧

霧帶寫在首頁，直接傳給共用煙霧元件：主視覺 38–82%／40–100%、書案 12–48%／0–100%、臺灣 22–62%／0–80%（上下／左右）。主代理檢視了 1440 與 390 寬的截圖：三張圖的霧都停在山谷、湖面與遠山，題字、天空留白、引言與按鈕沒有被覆蓋，臺灣圖右側的榕樹也沒有被遮住。

| 圖 | 桌機 | 手機 |
| --- | --- | --- |
| 主視覺 | [查看](home-hero-mist-desktop.png) | [查看](home-hero-mist-mobile.png) |
| 書案 | [查看](home-desk-mist-desktop.png) | [查看](home-desk-mist-mobile.png) |
| 臺灣 | [查看](home-taiwan-mist-desktop.png) | [查看](home-taiwan-mist-mobile.png) |

煙霧元件的框原本設了 `isolation: isolate`，這會讓框內圖片的 `mix-blend-mode: multiply` 只和透明的框混合，不再和紙紋混合。本次拿掉這項設定，也拿掉霧層的 `z-index`，霧層改依 DOM 順序疊在圖片上方，所以不會蓋過主視覺上的引言。修改後，在減少動態模式下比對截圖：書案圖包進煙霧元件前後逐像素相同；〈春望〉插圖平均色值較 #11 時暗約 8–12，回到 multiply 與紙面混合的效果。

## 首頁主視覺墨暈

截圖方式：把主視覺、引言與按鈕的動畫定格在指定時刻後擷取。主代理依序檢視：300ms 只有題字處落下一點淡墨；900ms 題字「文」與周圍浮現，仍帶模糊；1700ms 接近全圖，引言正在洇墨，按鈕還沒出現；4000ms 全圖、引言與按鈕都已穩定。動畫結束後不殘留模糊與遮罩，減少動態、不執行腳本時都立即完整顯示，按鈕在入場過程中始終不模糊；這些由 `tests/browser/home-hero.spec.mjs` 檢查。

| 時刻 | 桌機 1440 | 手機 390 |
| --- | --- | --- |
| 300ms | [查看](hero-ink-300ms-desktop.png) | [查看](hero-ink-300ms-mobile.png) |
| 900ms | [查看](hero-ink-900ms-desktop.png) | [查看](hero-ink-900ms-mobile.png) |
| 1700ms | [查看](hero-ink-1700ms-desktop.png) | [查看](hero-ink-1700ms-mobile.png) |
| 4000ms | [查看](hero-ink-4000ms-desktop.png) | [查看](hero-ink-4000ms-mobile.png) |

驅動遮罩的自訂屬性命名為 `--ink-reach`。原型用的名稱是 `--ink`，但站上的 `--ink` 已經是墨色 token，沿用會衝突。

## 筆觸寫出與首頁預覽詩句

這部分沿用首頁既有的 IntersectionObserver。腳本先替元素加上待播 class，元素進入視窗後換成播放 class，所以減少動態或不執行腳本時，筆觸和詩句都是完整的。預覽詩句所在的詩篇從隱藏改為顯示時，CSS 動畫會自動重播，不需要另外寫重播程式。`tests/browser/home-reveal.spec.mjs` 檢查以下情境：古典詩文、兩個專區和頁尾的筆觸在動畫結束後沒有裁切；依序點選三首詩再回到第一首，每首的詩句都完全可見；從片段網址直接進入、快速捲過預覽區之後，詩句都完全可見；減少動態和不執行腳本時，筆觸與詩句完整。

截圖在桌機 1440 寬拍攝，拍攝前把動畫定格在指定時刻，主代理已逐張檢視：
- [筆觸 300ms](stroke-300ms-desktop.png)：「古典詩文」下的筆觸從左側寫出約三分之一。
- [筆觸 3000ms](stroke-3000ms-desktop.png)：筆觸已完整寫出。
- [預覽 700ms](preview-ink-700ms-desktop.png)：〈遊子吟〉前兩句已清楚，第三句仍模糊，第四句尚未出現。
- [預覽 3000ms](preview-ink-3000ms-desktop.png)：四句都已清楚。

## 詩句洇墨入場

〈春望〉桌機 1280 × 900，進頁 1500ms 時的[入場中途](098-poem-ink-mid.png)：前四句已成濃墨，第五句仍帶模糊與淡色，其後尚未出現。所有動畫 `finished` 後的[最終狀態](098-poem-ink-final.png)：八句都清楚。逐句順序、最終不透明、減少動態與不執行腳本時的可見性，由 `tests/browser/poem-ink.spec.mjs` 逐首檢查。

## 未驗證

iPhone Safari 真機效能（含詩句 blur 動畫）、霧長時間播放時的接縫，留給 [#16](https://github.com/CarlLee1983/carlchinese/issues/16)。
