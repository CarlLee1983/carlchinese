# 本地工具鏈

本專案以 Node 24.21.0、pnpm 12.0.0 驗證 Astro 7.3.8。Astro 的套件要求 Node ≥22.12.0、pnpm ≥7.1.0；Playwright 1.64.1 要求 Node ≥20。版本由 `package.json` 與 `pnpm-lock.yaml` 鎖定。

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm run dev
```

建置及驗收指令：

```sh
pnpm run check
pnpm run validate:content
pnpm run test:content
pnpm run build
pnpm run test:browser
pnpm run verify
```

`validate:content`、Node 測試與 Astro 建置共用 `src/content/works.mjs` 的正式解析入口。瀏覽器測試對建置後的靜態網站執行，須先 `build`。`verify` 依序執行所有檢查。`dist/` 是靜態資產輸出，可供 Cloudflare Workers 的靜態資產設定使用；本地建置不會公開部署。

這些軟體檢查只驗證結構和頁面行為。來源補證、授權與實際親子試讀仍依[閱讀頁交接](reading-page-handoff.md)處理。
