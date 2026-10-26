# 本地工具鏈

本專案以 Node 24.21.0、pnpm 12.0.0 驗證 Astro 7.3.8。Astro 的套件要求 Node ≥22.12.0、pnpm ≥7.1.0；Playwright 1.64.1 要求 Node ≥20。版本由 `package.json` 與 `pnpm-lock.yaml` 鎖定。

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm run dev
```

`dev` 啟動本地開發伺服器。建置及驗收指令：

```sh
pnpm run check
pnpm run validate:content
pnpm run test:content
pnpm run build
pnpm run test:browser
pnpm run verify
```

`validate:content`、Node 測試與 Astro 建置共用 `src/content/works.mjs` 的正式解析入口。`test:browser` 對已建置的正式靜態網站執行，單獨執行前先 `pnpm run build`。`verify` 依序執行上述檢查，並在正式建置後執行 `test:group-fixture`：以 `CARLCHINESE_GROUP_FIXTURE=1` 建置隔離的組詩測試網站，再執行其瀏覽器測試。此旗標只供測試，不用於正式建置。

正式靜態產物在 `dist/`，可用 `pnpm exec astro preview --host 127.0.0.1` 本地預覽；組詩 fixture 產物在 `dist-group-fixture/`，不可作為正式網站使用。本地建置與預覽不會公開部署。專案沒有 CMS。

## 部署

正式網站使用 Cloudflare Workers Static Assets，做法和 CarlEnglish 相同。`wrangler.jsonc` 把 `dist/` 發布為 Worker `carlchinese`，自訂網域是 `carlchinese.gravito.dev`；`workers.dev` 與預覽網址都關閉。

有 Cloudflare 發布權限的環境，可以執行 `pnpm run deploy`：它先跑完整的 `verify`，通過後才執行 `wrangler deploy`。

GitHub Actions 的分工：
- pull request 一律跑 `CI` 的完整驗證。
- `Deploy` 只在 repository variable `CLOUDFLARE_DEPLOY_ENABLED` 為 `true` 時，於 `main` 推送後先驗證再發布，此時 `CI` 會略過 `main`，避免同一筆提交重複驗證。
- 啟用 `Deploy` 之前，要先設定 repository secrets `CLOUDFLARE_ACCOUNT_ID` 和 `CLOUDFLARE_API_TOKEN`。token 必須是這個 repository 專用的，權限比照 CarlEnglish 的部署 token。

回復版本時，用 `pnpm exec wrangler deployments list --name carlchinese` 找出前一個版本，再執行 `pnpm exec wrangler rollback <版本 ID> --name carlchinese`。

完整驗收記錄與畫面證據見[2026-10-15 交付證據](evidence/2026-10-15/README.md)；軟體檢查與視覺檢視不能代替來源補證、授權與實際親子試讀，這些工作仍依[閱讀頁交接](reading-page-handoff.md)處理。

## 作品插圖

逐首插圖的執行期對應維護在 `src/content/illustrations.mjs`，以穩定作品識別登錄路徑、繁體中文替代文字、固有尺寸及霧帶 `mist`（四邊為圖片百分比的範圍，或以 `null` 表示室內不加霧，見 [ADR 0003](adr/0003-per-illustration-mist.md)）；首頁與作品頁都由 `loadSiteContent()` 取得同一筆資料。新增可讀作品時需一併提供專屬圖片。

`validate:content` 與正式建置都檢查可讀作品對應是否完整、是否有多餘識別、路徑是否符合作品、檔案是否可讀、霧帶是否已判定且為有效範圍，以及不同作品是否重複使用相同圖片內容。圖片實際解碼與固有尺寸由自動遍歷可讀作品的瀏覽器測試檢查；文字語意與畫意仍須依配圖技能目視確認。

隔離組詩 fixture 明確不載入正式插圖，不以真實作品圖片冒充測試作品；`validate:content` 始終檢查正式內容，不受 fixture 環境旗標切換。配圖產製與接入流程見[逐首詩配圖技能](../.agents/skills/poem-illustration/SKILL.md)。
