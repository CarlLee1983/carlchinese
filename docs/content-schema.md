# 作品內容 schema 草案

> v0 草稿，待樣章驗證。寫作規則見 [content-guide.md](content-guide.md)。本文件只定義欄位，程式實作（驗證器、Astro content collection）交給 `/to-spec`。

## 檔案

每件作品一個 Markdown 檔：作品資料放在 frontmatter，正文以 directive 標出區塊與標示層次。

## Frontmatter

```yaml
title: 靜夜思
author: 李白
dynasty: 唐
series: tang300
number: 1                              # 底本序號（1–313），系列內的穩定識別
volume: 1                              # 底本卷次（1–8）
form: 五言古詩                          # 底本體裁分類，例如五言古詩、五言樂府、七言律詩
group:                                 # 組詩才填
  title: 感遇
  part: 1                              # 其一
  total: 2
supplemented: false                    # 四藤吟社本補入、原選所無時為 true（〈詠懷古跡〉三首）
source_text: 四藤吟社 313 首本        # 底本
text:                                  # 詩句，一行一句
  - 床前明月光
  - …
readings:                              # 難字讀音，教育部審定音
  - char: …
    zhuyin: …
    source: 教育部《重編國語辭典修訂本》
rhymes:                                # 押韻古讀註（今音不押韻時才填）
  - char: …
    note: …
    source: …
variants:                              # 異文
  - line: 1
    reading: 床前看月光
    edition: …
```

檔名與網址為「三位數序號-標題」，組詩加「-其N」，例如 `001-感遇-其一.md`；序號與標題不一致時以序號為準。系列目錄依 `number`（即原書卷次與體裁）排序。

原文區塊的欄位不需要標示層次；`readings`、`rhymes`、`variants` 的每一項都視為史實，`source` 或 `edition` 為必填。

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

深入賞析的每段，以及親子共學的開場與共讀的每段，都必須包在下面三種 directive 之一。directive 外不得有裸段落。

```markdown
:::史實{source="《舊唐書·李白傳》" locator="卷一九〇下" url="https://…" hand="一手"}
……
:::

:::文學解讀{stance="通行說法" by="喻守真《唐詩三百首詳析》"}
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
| `史實` | `source`（必填）、`locator`（必填）、`url`（選填）、`hand`（必填：`一手`／`二手`） | 不可靠的軼事只陳述「文獻記載了此事」 |
| `文學解讀` | `stance`（必填：`通行說法`／`本站觀點`）、`by`（`stance=通行說法` 時必填） | 引用注本只取觀點，文字重疊不得達 12 字 |
| `教學想像` | 無 | 文字本身要讓人聽得出是想像 |

directive 名稱用中文，`remark-directive` 接受非 ASCII 的名稱，前提是名稱裡沒有標點與空白。

## 提問與表達活動

這兩段整體預設為教學想像，不用 directive。提問用 YAML 區塊寫成結構化資料：

````markdown
### 提問

```yaml questions
- level: 提取          # 提取｜推論｜詮釋整合｜評估
  question: …
  likely_answers: [ … ]
  follow_up: …          # 家長怎麼接
```
````

四種 `level` 都至少要出現一次。表達活動用一般段落撰寫。
