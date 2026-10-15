# 作品內容 schema

> v1.0，2026-10-15 內容格式定稿，尚非已實作的驗證器。寫作規則見 [content-guide.md](content-guide.md)；驗證器、解析與 Astro content collection 由 `/to-spec` 規劃、`/implement` 實作。交接條件與尚未驗收項目見[閱讀頁交接](reading-page-handoff.md)。

## 檔案與 Frontmatter

每件作品一個 Markdown 檔：作品資料放在 frontmatter，正文以 directive 標出區塊與層次。路徑為 `content/<系列 id>/<檔名>.md`，例如 `content/tang300/098-春望.md`；所屬系列由目錄決定。

以下範例示意欄位形狀，不表示已查核該書或篇卷：

```yaml
title: 春望
author: 杜甫
dynasty: 唐
number: 98                           # 底本序號（1–313），系列內穩定識別
volume: 5                           # 底本卷次（1–8）
form: 五言律詩                      # 底本體裁；其他分類在賞析交代
# source_title: …                    # 底本題名與通行題名不同時才填
# group:                             # 組詩才填
#   title: …
#   part: 1
#   total: 2
supplemented: false                 # 四藤吟社本補入、原選所無時為 true
sources:                            # 描述性 ASCII ID：字母、數字、底線、連字號
  qts_chunwang:
    source: 《全唐詩》
    locator: 卷二二四〈春望〉
    era: 後世古籍                    # 這筆談清代版本；引杜甫文字要另設同時代 ID
    checked: 僅核錄文                # 已核書影｜僅核錄文｜未記錄
    # url: https://…                # 可公開查閱時才填；網址不等於已核書影
    # note: …                       # 待考或未記錄時必填
  moe_dictionary:
    source: 教育部《重編國語辭典修訂本》
    locator: 「勝」條
    era: 現代資料
    checked: 僅核錄文
  qiu_commentary:
    source: 仇兆鰲《杜詩詳註》
    locator: 卷四〈春望〉
    era: 後世古籍
    checked: 僅核錄文
collated_from:                      # 實際互校的文本，至少一個來源 ID
  - qts_chunwang
text:                               # 一行一句，含本站所加現代標點
  - 國破山河在，
  - 城春草木深。
  - 感時花濺淚，
  - 恨別鳥驚心。
  - 烽火連三月，
  - 家書抵萬金。
  - 白頭搔更短，
  - 渾欲不勝簪。
# readings:                         # 需標讀音的字；refs 必填且非空
#   - char: 勝
#     zhuyin: ㄕㄥ
#     refs: [moe_dictionary]
#     reason: …                     # 表二十五第 1–8 冊內補標的字必填理由
# rhymes:                           # 今音不押韻時才填
#   - char: …
#     note: …                       # 第二級以下依據須寫韻部與同韻腳字
#     refs: [source_id]
# variants:                         # 正文異文與古書「一作」；不同 kind 分筆
#   - line: 1                       # 句序從 1 起，對應 text
#     reading: …
#     kind: 正文                    # 正文｜一作
#     refs: [source_id]
# title_notes:                      # 版本題下注，不是異題
#   - text: …
#     refs: [source_id]             # locator 指明版本及題下注位置
# text_notes:                       # 字形正規化、版本先後等原文註記
#   - text: …
#     refs: [source_id]
```

篇目依據（四藤吟社 313 首本）屬系列層級，不寫在單篇。檔名與網址用「三位數序號-通行題名」，組詩加「-其N」，例如 `001-感遇-其一.md`；序號與標題不一致時以序號為準。系列目錄依 `number`（即原書卷次與體裁）排序。

`sources` 是每檔唯一的來源登錄表。ID 用描述性 ASCII 字母、數字、底線或連字號；每筆須有非空 `source`、`locator`、`era`、`checked`。`era` 可為 `前代文獻`、`同時代`、`後世古籍`、`現代資料`、`待考`；`待考` 表示無法判定實際時代，必須填 `note` 說明，不是第五個時代。`checked` 可為 `已核書影`、`僅核錄文`、`未記錄`；`未記錄` 必須填 `note`，專供舊稿未載查核狀態，不得由網址猜補查核結果。引用文字與討論版本若須採不同出處時代，即使來自同一本書，也用分開的 ID 和適當 locator／note 說清引用對象。

Frontmatter 的 `refs` 與 `collated_from` 都是來源 ID 陣列，至少一項，不能引用未登錄的 ID。原文區 `readings`、`rhymes`、`variants`、`title_notes`、`text_notes` 每筆有據可查，均須非空 `refs`。未用到的選填陣列可省略。`source_title` 只處理底本題名差異；`title_notes` 記實際題下注文字，`refs` 指向版本與位置。`variants` 只收正文異文及明記「一作」，`kind` 必填；詩話引句差異在賞析處理。文字正規化與通行正文版本先後可用 `text_notes` 說明。

`text` 的現代標點由本站統一編加，頁面統一聲明，屬呈現規則而非古籍引文或校字依據，無須為標點虛設來源。影響解讀且有爭議的標點另在賞析說明。

## 正文結構

```markdown
## 深入賞析

### 字詞
### 背景
### 技巧
### 情感
### 比較閱讀        <!-- 選寫 -->

## 親子共學

### 開場
### 共讀
### 提問
### 表達活動
```

除了「比較閱讀」，其他子標題都必填，順序固定。

## 標示層次 directive

深入賞析每段，以及親子共學開場與共讀的每段，須包在下列 directive 中；directive 外不得有裸段落。

```markdown
:::史實{refs="qts_chunwang moe_dictionary"}
《全唐詩》卷二二四收〈春望〉；教育部辭典收「勝」字。
:::

:::文學解讀{stance="通行說法" refs="qiu_commentary"}
……
:::

:::文學解讀{stance="白話轉述"}
……
:::

:::文學解讀{stance="本站觀點"}
……
:::

:::教學想像
……
:::
```

| directive | 屬性 | 規則 |
| --- | --- | --- |
| `史實` | `refs`（必填，一個以上 ID，以空格分隔） | 段落文字交代各來源所支持的對象；不同時代可同段，不強制拆段 |
| `文學解讀` | `stance`（必填：`通行說法`／`白話轉述`／`本站觀點`）；`refs`（通行說法必填，其他 stance 選填） | 通行說法須引實際讀過的注家或注本；有引來源則 ID 必須有效 |
| `教學想像` | 無 | 文字本身要讓人聽得出是想像 |

`refs` 只寫空格分隔的 ID，不用分號串出處；不可出現未登錄 ID。無來源時省略選填 `refs`，不要填空字串。史實不使用行內 `source`、`locator`、`era`、`url`；文學解讀不使用 `by`。每一筆來源的具體位置、時代、查核狀態與可選連結由 `sources` 提供；頁面在有來源的段尾及原文註記旁直接展示。directive 名稱用中文；`remark-directive` 接受不含標點或空白的非 ASCII 名稱。

## 提問與表達活動

兩段整體預設為教學想像，不用 directive。提問用 YAML 區塊寫成結構化資料：

````markdown
### 提問

```yaml questions
- level: 提取          # 提取｜推論｜詮釋整合｜評估
  question: …
  likely_answers:       # 2–3 組
    - answer: …         # 孩子可能的回答
      follow_up: …      # 家長怎麼接
```
````

四種 `level` 都至少出現一次。表達活動用一般段落撰寫。
