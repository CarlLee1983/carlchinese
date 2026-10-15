export interface Position {
  line: number;
  column: number;
}

export interface Source {
  source: string;
  locator: string;
  era: '前代文獻' | '同時代' | '後世古籍' | '現代資料' | '待考';
  checked: '已核書影' | '僅核錄文' | '未記錄';
  url?: string;
  note?: string;
}

export interface ReferencedNote {
  text: string;
  refs: string[];
}

export interface Frontmatter {
  title: string;
  source_title?: string;
  author: string;
  dynasty: string;
  number: number;
  volume: number;
  form: '五言古詩' | '七言古詩' | '五言樂府' | '七言樂府' | '五言律詩' | '七言律詩' | '五言絕句' | '七言絕句';
  supplemented: boolean;
  group?: { title: string; part: number; total: number };
  collated_from: string[];
  text: string[];
  readings?: Array<{ char: string; zhuyin: string; refs: string[]; reason?: string }>;
  rhymes?: Array<{ char: string; note: string; refs: string[] }>;
  variants?: Array<{ line: number; reading: string; kind: '正文' | '一作'; refs: string[] }>;
  title_notes?: ReferencedNote[];
  text_notes?: ReferencedNote[];
  sources: Record<string, Source>;
}

export interface MarkedParagraph {
  kind: '史實' | '文學解讀' | '教學想像';
  stance?: '通行說法' | '白話轉述' | '本站觀點';
  refs: string[];
  paragraphs: string[];
  position: Position;
}

export interface ActivityParagraph {
  text: string;
  position: Position;
}

export interface Question {
  level: '提取' | '推論' | '詮釋整合' | '評估';
  question: string;
  likely_answers: Array<{ answer: string; follow_up: string }>;
  position: Position;
}

export interface Subsection {
  title: string;
  paragraphs: Array<MarkedParagraph | ActivityParagraph>;
  questions: Question[];
  position: Position;
}

export interface Section {
  title: '深入賞析' | '親子共學';
  subsections: Subsection[];
  position: Position;
}

export interface Work {
  id: string;
  slug: string;
  frontmatter: Frontmatter;
  sections: Section[];
  position: Position;
}

export interface CatalogEntry {
  number: number;
  volume: number;
  form: Frontmatter['form'];
  title: string;
  author: string;
  sourceTitle: string;
  tocPage: string;
  supplemented: boolean;
  group?: { title: string; part: number; total: number };
}
