import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import { LineCounter, parseDocument } from 'yaml';

/** @typedef {import('./work-model').Work} Work */
/** @typedef {import('./work-model').Frontmatter} Frontmatter */
/** @typedef {import('./work-model').Section} Section */
/** @typedef {import('./work-model').Subsection} Subsection */
/** @typedef {import('./work-model').MarkedParagraph} MarkedParagraph */
/** @typedef {import('./work-model').Question} Question */
/** @typedef {any} SyntaxNode - YAML and mdast nodes are narrowed by runtime validation below. */

const markdown = unified().use(remarkParse).use(remarkDirective);
const eras = ['前代文獻', '同時代', '後世古籍', '現代資料', '待考'];
const checks = ['已核書影', '僅核錄文', '未記錄'];
const forms = ['五言古詩', '七言古詩', '五言樂府', '七言樂府', '五言律詩', '七言律詩', '五言絕句', '七言絕句'];
const stances = ['通行說法', '白話轉述', '本站觀點'];
const levels = ['提取', '推論', '詮釋整合', '評估'];
const analysisHeads = ['字詞', '背景', '技巧', '情感', '比較閱讀'];
const familyHeads = ['開場', '共讀', '提問', '表達活動'];
/** @param {string} value */
const counted = (value) => [...value.matchAll(/[\p{Script=Han}A-Za-z0-9]/gu)].length;

/** @param {{ filePath: string, source: string }} input @returns {Work} */
export function parseWork({ filePath, source }) {
  /** @type {(reason: string, line?: number, column?: number) => never} */
  const fail = (reason, line = 1, column = 1) => {
    throw new Error(`${filePath}:${line}:${column}: ${reason}`);
  };
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
  if (!match) fail('缺少完整 YAML frontmatter');
  const yamlSource = match[1];
  const bodyStart = match[0].split('\n').length;
  const frontLine = 2;
  const frontCounter = new LineCounter();
  const frontDoc = parseDocument(yamlSource, { lineCounter: frontCounter, uniqueKeys: true });
  /** @type {SyntaxNode} */
  const frontRoot = frontDoc.contents;
  /** @param {SyntaxNode} node @returns {[number, number]} */
  const frontPos = (node) => {
    const pos = frontCounter.linePos(node?.range?.[0] ?? 0);
    return [pos.line + frontLine - 1, pos.col];
  };
  /** @type {(reason: string, node?: SyntaxNode) => never} */
  const atFront = (reason, node) => fail(reason, ...frontPos(node));
  if (frontDoc.errors.length) atFront(frontDoc.errors[0].message, { range: [frontDoc.errors[0].pos?.[0] ?? 0] });
  if (frontDoc.warnings.length) atFront(frontDoc.warnings[0].message, { range: [frontDoc.warnings[0].pos?.[0] ?? 0] });
  const rawFrontmatter = frontDoc.toJS();

  /** @param {any} value @param {SyntaxNode} node @param {Record<string, any>} schema @param {string} label */
  function validate(value, node, schema, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) atFront(`${label} 應為物件`, node);
    for (const key of Object.keys(value)) {
      if (!Object.hasOwn(schema, key)) {
        const item = node?.items?.find((/** @type {SyntaxNode} */ entry) => entry.key?.value === key);
        atFront(`${label} 未知欄位 ${key}`, item?.key ?? node);
      }
    }
    for (const [key, rule] of Object.entries(schema)) {
      const child = node?.get?.(key, true);
      const field = `${label}.${key}`;
      if (value[key] === undefined) {
        if (!rule.optional) atFront(`${field} 為必填`, node);
        continue;
      }
      if (rule.kind === 'text') {
        if (typeof value[key] !== 'string' || !value[key].trim()) atFront(`${field} 須為非空文字`, child);
      } else if (rule.kind === 'integer') {
        if (!Number.isInteger(value[key]) || value[key] < rule.min || value[key] > rule.max) atFront(`${field} 超出範圍 ${rule.min}–${rule.max}`, child);
      } else if (rule.kind === 'boolean') {
        if (typeof value[key] !== 'boolean') atFront(`${field} 須為布林值`, child);
      } else if (rule.kind === 'enum') {
        if (!rule.values.includes(value[key])) atFront(`${field} 無效值 ${value[key]}`, child);
      } else if (rule.kind === 'array') {
        if (!Array.isArray(value[key]) || value[key].length < (rule.min ?? 0)) atFront(`${field} 須有至少 ${rule.min ?? 0} 項`, child);
        value[key].forEach((entry, index) => {
          const entryNode = child?.items?.[index];
          if (rule.entry.kind === 'object') validate(entry, entryNode, rule.entry.schema, `${field}[${index}]`);
          else validate({ entry }, { get: () => entryNode }, { entry: rule.entry }, field);
        });
      } else if (rule.kind === 'object') validate(value[key], child, rule.schema, field);
      else if (rule.kind === 'record') {
        if (!value[key] || typeof value[key] !== 'object' || Array.isArray(value[key]) || !Object.keys(value[key]).length) atFront(`${field} 須為非空登錄表`, child);
        for (const [id, record] of Object.entries(value[key])) {
          const item = child?.items?.find((/** @type {SyntaxNode} */ entry) => entry.key?.value === id);
          if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) atFront(`${field} 無效來源 ID ${id}`, item?.key);
          validate(record, item?.value, rule.schema, `${field}.${id}`);
          if (record.era === '待考' && !record.note?.trim()) atFront(`${field}.${id}.note：待考必須說明`, item?.value);
          if (record.checked === '未記錄' && !record.note?.trim()) atFront(`${field}.${id}.note：未記錄必須說明`, item?.value);
        }
      }
    }
  }
  const text = { kind: 'text' };
  const refs = { kind: 'array', min: 1, entry: text };
  const note = { kind: 'object', schema: { text, refs } };
  validate(rawFrontmatter, frontRoot, {
    title: text, source_title: { ...text, optional: true }, author: text, dynasty: text,
    number: { kind: 'integer', min: 1, max: 313 }, volume: { kind: 'integer', min: 1, max: 8 },
    form: { kind: 'enum', values: forms }, supplemented: { kind: 'boolean' },
    group: { kind: 'object', optional: true, schema: { title: text, part: { kind: 'integer', min: 1, max: 313 }, total: { kind: 'integer', min: 2, max: 313 } } },
    collated_from: refs, text: { kind: 'array', min: 1, entry: text },
    readings: { kind: 'array', optional: true, entry: { kind: 'object', schema: { char: text, zhuyin: text, refs, reason: { ...text, optional: true } } } },
    rhymes: { kind: 'array', optional: true, entry: { kind: 'object', schema: { char: text, note: text, refs } } },
    variants: { kind: 'array', optional: true, entry: { kind: 'object', schema: { line: { kind: 'integer', min: 1, max: 313 }, reading: text, kind: { kind: 'enum', values: ['正文', '一作'] }, refs } } },
    title_notes: { ...note, kind: 'array', optional: true, entry: note },
    text_notes: { kind: 'array', optional: true, entry: note },
    sources: { kind: 'record', schema: { source: text, locator: text, era: { kind: 'enum', values: eras }, checked: { kind: 'enum', values: checks }, url: { ...text, optional: true }, note: { ...text, optional: true } } },
  }, 'frontmatter');
  /** @type {Frontmatter} Validated by the complete frontmatter schema above. */
  const frontmatter = rawFrontmatter;

  frontmatter.text.forEach((line, index) => {
    if (/[\r\n]/.test(line)) atFront('詩句須為單行', frontRoot.get('text', true)?.items?.[index]);
  });

  const expectedName = `${String(frontmatter.number).padStart(3, '0')}-${frontmatter.title}${frontmatter.group ? `-其${['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][frontmatter.group.part] ?? frontmatter.group.part}` : ''}.md`;
  if (path.basename(filePath) !== expectedName) atFront(`檔名與序號／題名不符，應為 ${expectedName}`, frontRoot.get('number', true));
  if (frontmatter.group && frontmatter.group.part > frontmatter.group.total) atFront('組詩其序超出總數', frontRoot.get('group', true));
  const sourceIds = new Set(Object.keys(frontmatter.sources));
  /** @param {string[]} list @param {SyntaxNode} node @param {string} label */
  function checkRefs(list, node, label) {
    for (let i = 0; i < list.length; i++) {
      if (!sourceIds.has(list[i])) atFront(`${label} 引用未登錄來源 ${list[i]}`, node?.items?.[i] ?? node);
    }
  }
  checkRefs(frontmatter.collated_from, frontRoot.get('collated_from', true), 'collated_from');
  /** @type {Array<[string, Array<{ refs: string[], line?: number }> | undefined]>} */
  const referencedFields = [
    ['readings', frontmatter.readings], ['rhymes', frontmatter.rhymes], ['variants', frontmatter.variants],
    ['title_notes', frontmatter.title_notes], ['text_notes', frontmatter.text_notes],
  ];
  for (const [field, items] of referencedFields) {
    items?.forEach((item, index) => {
      const node = frontRoot.get(field, true)?.items?.[index];
      checkRefs(item.refs, node?.get('refs', true), `${field}[${index}].refs`);
      if (field === 'variants' && item.line !== undefined && item.line > frontmatter.text.length) atFront(`variants[${index}].line 超出詩句數`, node?.get('line', true));
    });
  }

  const body = source.slice(match[0].length);
  const bodyLines = body.split(/\r?\n/);
  const tree = markdown.parse(body);
  /** @type {Section[]} */
  const sections = [];
  /** @type {Section | undefined} */
  let section;
  /** @type {Subsection | undefined} */
  let subsection;
  /** @param {SyntaxNode} node @returns {[number, number]} */
  const bodyPos = (node) => [bodyStart + (node.position?.start.line ?? 1) - 1, node.position?.start.column ?? 1];
  /** @type {(reason: string, node: SyntaxNode) => never} */
  const atBody = (reason, node) => fail(reason, ...bodyPos(node));
  /** @param {SyntaxNode} node @returns {string} */
  function plain(node) {
    if (node.type === 'text') return node.value;
    if (node.type === 'paragraph') return node.children.map(plain).join('');
    atBody(`不支援的內文節點 ${node.type}`, node);
  }
  /** @param {SyntaxNode} node @returns {MarkedParagraph} */
  function directive(node) {
    if (node.type !== 'containerDirective') atBody('段落須包在標示層次 directive', node);
    if (bodyLines[(node.position?.end.line ?? 1) - 1]?.trim() !== ':::') atBody('未閉合 directive', node);
    /** @type {Record<string, string[]>} */
    const allowed = { 史實: ['refs'], 文學解讀: ['stance', 'refs'], 教學想像: [] };
    if (!Object.hasOwn(allowed, node.name)) atBody(`未知 directive ${node.name}`, node);
    for (const attribute of Object.keys(node.attributes ?? {})) if (!allowed[node.name].includes(attribute)) atBody(`未知 directive 屬性 ${attribute}`, node);
    const refs = node.attributes?.refs?.split(/\s+/).filter(Boolean) ?? [];
    if (node.name === '史實' && !refs.length) atBody('史實 refs 必填且非空', node);
    if (node.name === '文學解讀') {
      if (!stances.includes(node.attributes?.stance)) atBody('文學解讀 stance 無效或缺少', node);
      if (node.attributes.stance === '通行說法' && !refs.length) atBody('通行說法 refs 必填且非空', node);
    }
    if (node.attributes?.refs !== undefined && !refs.length) atBody('refs 不可為空', node);
    for (const ref of refs) if (!sourceIds.has(ref)) atBody(`引用未登錄來源 ${ref}`, node);
    if (!node.children.length) atBody('directive 內文不可為空', node);
    const paragraphs = node.children.map((/** @type {SyntaxNode} */ child) => {
      if (child.type === 'heading' || child.type === 'containerDirective') atBody('未閉合 directive', node);
      if (child.type !== 'paragraph') atBody('directive 僅可包含段落', child);
      return plain(child);
    });
    return { kind: node.name, stance: node.attributes?.stance, refs, paragraphs, position: { line: bodyPos(node)[0], column: bodyPos(node)[1] } };
  }
  /** @param {SyntaxNode} node @returns {Question[]} */
  function questions(node) {
    if (node.type !== 'code' || node.lang !== 'yaml' || node.meta !== 'questions') atBody('提問須為 yaml questions 區塊', node);
    const counter = new LineCounter();
    const doc = parseDocument(node.value, { lineCounter: counter, uniqueKeys: true });
    /** @param {SyntaxNode} yamlNode @returns {[number, number]} */
    const questionPos = (yamlNode) => {
      const pos = counter.linePos(yamlNode?.range?.[0] ?? 0);
      return [bodyPos(node)[0] + pos.line, pos.col];
    };
    /** @type {(reason: string, yamlNode?: SyntaxNode) => never} */
    const atQuestion = (reason, yamlNode) => fail(reason, ...questionPos(yamlNode));
    if (doc.errors.length) atQuestion(doc.errors[0].message, { range: [doc.errors[0].pos?.[0] ?? 0] });
    if (doc.warnings.length) atQuestion(doc.warnings[0].message, { range: [doc.warnings[0].pos?.[0] ?? 0] });
    /** @type {unknown} */
    const data = doc.toJS();
    if (!Array.isArray(data)) atQuestion('questions 須為題目陣列', doc.contents);
    const seen = new Set();
    /** @type {SyntaxNode} */
    const questionRoot = doc.contents;
    data.forEach((/** @type {any} */ question, /** @type {number} */ index) => {
      const item = questionRoot?.items?.[index];
      /** @param {any} value @param {string[]} keys @param {SyntaxNode} yamlNode @param {string} label */
      const exact = (value, keys, yamlNode, label) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) atQuestion(`${label} 須為物件`, yamlNode);
        for (const key of Object.keys(value)) if (!keys.includes(key)) atQuestion(`${label} 未知欄位 ${key}`, yamlNode?.items?.find((/** @type {SyntaxNode} */ entry) => entry.key?.value === key)?.key ?? yamlNode);
        for (const key of keys) if (value[key] === undefined) atQuestion(`${label}.${key} 必填`, yamlNode);
      };
      exact(question, ['level', 'question', 'likely_answers'], item, `questions[${index}]`);
      if (!levels.includes(question.level)) atQuestion(`無效提問層級 ${question.level}`, item?.get('level', true));
      seen.add(question.level);
      if (typeof question.question !== 'string' || !question.question.trim()) atQuestion('提問文字不可為空', item?.get('question', true));
      if (!Array.isArray(question.likely_answers) || question.likely_answers.length < 2 || question.likely_answers.length > 3) atQuestion('每題須有 2–3 組回答與接話', item?.get('likely_answers', true));
      question.likely_answers.forEach((/** @type {any} */ answer, /** @type {number} */ answerIndex) => {
        const answerNode = item?.get('likely_answers', true)?.items?.[answerIndex];
        exact(answer, ['answer', 'follow_up'], answerNode, 'likely_answers');
        for (const key of ['answer', 'follow_up']) if (typeof answer[key] !== 'string' || !answer[key].trim()) atQuestion(`${key} 不可為空`, answerNode?.get(key, true));
      });
      question.position = { line: questionPos(item)[0], column: questionPos(item)[1] };
    });
    for (const level of levels) if (!seen.has(level)) atQuestion(`缺少提問層級 ${level}`, doc.contents);
    return /** @type {Question[]} */ (data);
  }
  for (const node of tree.children) {
    if (node.type === 'heading') {
      const title = node.children.map(plain).join('');
      if (node.depth === 2) {
        const expectedTitle = sections.length === 0 ? '深入賞析' : '親子共學';
        if (title !== expectedTitle) atBody(`區塊標題錯序：${title}`, node);
        section = { title, subsections: [], position: { line: bodyPos(node)[0], column: bodyPos(node)[1] } };
        sections.push(section);
        subsection = undefined;
      } else if (node.depth === 3) {
        if (!section) atBody('子標題缺少所屬區塊', node);
        const expected = section.title === '深入賞析' ? analysisHeads : familyHeads;
        const index = section.subsections.length;
        if (title !== expected[index] && !(section.title === '深入賞析' && index === 4 && title === '比較閱讀')) atBody(`子標題錯序：${title}`, node);
        subsection = { title, paragraphs: [], questions: [], position: { line: bodyPos(node)[0], column: bodyPos(node)[1] } };
        section.subsections.push(subsection);
      } else atBody('不支援的標題層級', node);
      continue;
    }
    if (!subsection) atBody('內文缺少子標題', node);
    if (subsection.title === '提問') {
      if (subsection.questions.length) atBody('提問只能有一個 YAML 區塊', node);
      subsection.questions = questions(node);
    } else if (subsection.title === '表達活動') {
      if (node.type !== 'paragraph') atBody('表達活動只能包含一般段落', node);
      subsection.paragraphs.push({ text: plain(node), position: { line: bodyPos(node)[0], column: bodyPos(node)[1] } });
    } else subsection.paragraphs.push(directive(node));
  }
  if (sections.length !== 2) fail('必須依序包含深入賞析及親子共學', bodyStart);
  if (sections[0].subsections.length < 4 || sections[0].subsections.length > 5) fail('深入賞析子標題不完整', bodyStart);
  if (sections[1].subsections.length !== 4) fail('親子共學子標題不完整', bodyStart);
  for (const sec of sections) for (const sub of sec.subsections) if (!sub.paragraphs.length && !sub.questions.length) fail(`${sub.title} 不可為空`, sub.position.line, sub.position.column);

  const analysisText = sections[0].subsections.flatMap((sub) => sub.paragraphs.flatMap((para) => 'paragraphs' in para ? para.paragraphs : [para.text])).join('');
  const analysisLimit = frontmatter.form.includes('絕句') ? 1500 : 2250;
  if (counted(analysisText) > analysisLimit) fail(`深入賞析 ${counted(analysisText)} 字超過 ${analysisLimit} 字上限`, sections[0].position.line);
  for (const sub of sections[1].subsections) {
    const lines = sub.title === '提問'
      ? sub.questions.flatMap((q) => [q.question, ...q.likely_answers.flatMap((a) => [a.answer, a.follow_up])])
      : sub.paragraphs.flatMap((para) => 'paragraphs' in para ? para.paragraphs : [para.text]);
    for (const line of lines) for (const sentence of line.split(/[。！？!?\n]/)) if (counted(sentence) > 25) fail(`親子共學口語句長 ${counted(sentence)} 字超過 25 字`, sub.position.line, sub.position.column);
  }
  return { id: `tang300-${String(frontmatter.number).padStart(3, '0')}`, slug: path.basename(filePath, '.md'), frontmatter, sections, position: { line: 1, column: 1 } };
}

/** @returns {Promise<Work[]>} */
export async function loadWorks(directory = path.resolve('content/tang300')) {
  const names = (await readdir(directory)).filter((name) => name.endsWith('.md')).sort();
  const works = await Promise.all(names.map(async (name) => {
    const filePath = path.join(directory, name);
    return parseWork({ filePath, source: await readFile(filePath, 'utf8') });
  }));
  const ids = new Set();
  for (const work of works) {
    if (ids.has(work.id)) throw new Error(`${directory}:1:1: 重複作品識別 ${work.id}`);
    ids.add(work.id);
  }
  return works;
}
