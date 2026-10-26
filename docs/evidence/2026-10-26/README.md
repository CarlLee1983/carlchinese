# 逐首插圖煙霧驗收證據

2026-10-26，對應 [#11](https://github.com/CarlLee1983/carlchinese/issues/11)。在本地 Chromium 實際建置頁面，桌機 1280 × 900、手機 375 × 812。主代理檢視了下列插圖截圖：〈春望〉的河面與遠山有淡霧，人物、殘垣與花鳥都沒有被遮住；〈靜夜思〉是室內場景，畫面上沒有霧。煙霧會持續飄動，截圖只是某一瞬間的畫面。霧層是否存在、位置與版面框是否正確，由 Playwright 逐首比對。

[完整 verify 輸出](verify.log)：Astro check 0 錯誤、58 個 Node 測試、2 個組詩瀏覽器測試、38 個正式瀏覽器測試全部通過。

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

## 未驗證

iPhone Safari 真機效能、霧長時間播放時的接縫，留給 [#16](https://github.com/CarlLee1983/carlchinese/issues/16)。
