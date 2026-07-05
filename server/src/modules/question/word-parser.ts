import * as mammoth from 'mammoth';
import { ImportQuestionDTO, ImportError, ImportResult, QuestionType } from './types';

// ─── 智能修复规则 ───

const FIX_RULES: { pattern: RegExp; replacement: ((m: string) => string) | string; desc: string }[] = [
  { pattern: /[Ａ-Ｚ]/g, replacement: (m) => String.fromCharCode(m.charCodeAt(0) - 0xFEE0), desc: '全角字母转半角' },
  { pattern: /[（）]/g, replacement: '()', desc: '全角括号转半角' },
  { pattern: /^单\s*选\s*题\s*[:：]?\s*/im, replacement: '【单选题】', desc: '补单选题标记' },
  { pattern: /^多\s*选\s*题\s*[:：]?\s*/im, replacement: '【多选题】', desc: '补多选题标记' },
  { pattern: /^判\s*断\s*题\s*[:：]?\s*/im, replacement: '【判断题】', desc: '补判断题标记' },
  { pattern: /^【?\s*答案\s*】?\s*[:：]\s*/im, replacement: '【答案】', desc: '统一答案标记' },
  { pattern: /^【?\s*参考\s*答案\s*】?\s*[:：]\s*/im, replacement: '【答案】', desc: '统一答案标记' },
  { pattern: /^【?\s*正确答案\s*】?\s*[:：]\s*/im, replacement: '【答案】', desc: '统一答案标记' },
  { pattern: /^【?\s*解析\s*】?\s*[:：]\s*/im, replacement: '【解析】', desc: '统一解析标记' },
  { pattern: /^【?\s*详解\s*】?\s*[:：]\s*/im, replacement: '【解析】', desc: '统一解析标记' },
  { pattern: /^【?\s*试题\s*分析\s*】?\s*[:：]\s*/im, replacement: '【解析】', desc: '统一解析标记' },
  { pattern: /^【?\s*难\s*度\s*】?\s*[:：]\s*/im, replacement: '【难度】', desc: '统一难度标记' },
  { pattern: /\r\n/g, replacement: '\n', desc: '统一换行符' },
  { pattern: /\n{3,}/g, replacement: '\n\n', desc: '合并多余空行' },
];

// ─── 正则模式 ───

const TYPE_PATTERN = /^【\s*(单\s*选\s*题|多\s*选\s*题|判\s*断\s*题)\s*】/i;
const OPTION_PATTERN = /^([A-Da-d])[.、:：\)）]\s*(.+)$/;
const ANSWER_PATTERN = /^【\s*答\s*案\s*】\s*(.+)$/i;
const ANALYSIS_PATTERN = /^【\s*解\s*析\s*】\s*(.+)$/i;
const DIFFICULTY_PATTERN = /^【\s*难\s*度\s*】\s*(.+)$/i;

// ─── 标准化文本 ───

function normalizeText(raw: string): string {
  let text = raw;
  for (const rule of FIX_RULES) {
    if (typeof rule.replacement === 'function') {
      text = text.replace(rule.pattern, rule.replacement as any);
    } else {
      text = text.replace(rule.pattern, rule.replacement);
    }
  }
  return text;
}

// ─── 解析单题 ───

interface RawQuestion {
  type: QuestionType;
  lines: string[];
  lineStart: number;
}

function parseType(typeStr: string): QuestionType {
  const t = typeStr.replace(/\s/g, '');
  if (t.includes('单选')) return QuestionType.SINGLE;
  if (t.includes('多选')) return QuestionType.MULTI;
  if (t.includes('判断')) return QuestionType.JUDGE;
  return QuestionType.SINGLE;
}

function parseDifficulty(diff: string): number {
  const d = diff.trim();
  if (/易|简单|低/i.test(d)) return 1;
  if (/中|中等|一般/i.test(d)) return 2;
  if (/难|困难|高/i.test(d)) return 3;
  return 1;
}

function parseSingleQuestion(rawType: string, lines: string[], lineStart: number): { q: ImportQuestionDTO; errors: ImportError[] } {
  const type = parseType(rawType);
  const errors: ImportError[] = [];
  let content = '';
  let analysis = '';
  let answer = '';
  let difficulty: number | undefined;
  const options: { label: string; content: string }[] = [];
  let state: 'content' | 'options' | 'answer' | 'analysis' | 'difficulty' = 'content';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 检查答案行
    const answerMatch = line.match(ANSWER_PATTERN);
    if (answerMatch) {
      answer = answerMatch[1].trim();
      state = 'answer';
      continue;
    }

    // 检查解析行
    const analysisMatch = line.match(ANALYSIS_PATTERN);
    if (analysisMatch) {
      analysis = analysisMatch[1].trim();
      state = 'analysis';
      continue;
    }

    // 检查难度行
    const difficultyMatch = line.match(DIFFICULTY_PATTERN);
    if (difficultyMatch) {
      difficulty = parseDifficulty(difficultyMatch[1]);
      state = 'difficulty';
      continue;
    }

    // 检查选项行
    const optionMatch = line.match(OPTION_PATTERN);
    if (optionMatch) {
      options.push({ label: optionMatch[1].toUpperCase(), content: optionMatch[2].trim() });
      state = 'options';
      continue;
    }

    // 累加题干或解析
    if (state === 'content' || state === 'options') {
      content += (content ? '\n' : '') + line;
    } else if (state === 'analysis') {
      analysis += (analysis ? '\n' : '') + line;
    }
  }

  // 校验
  if (!content.trim()) {
    errors.push({ lineNumber: lineStart, type: 'error', message: '题干为空' });
  }

  if (type === QuestionType.JUDGE) {
    // 判断题答案标准化
    const normAnswer = answer.replace(/\s/g, '');
    if (/^(√|✓|对|是|正确|true|T|t)$/i.test(normAnswer)) {
      answer = '正确';
    } else if (/^(×|✗|错|否|错误|false|F|f)$/i.test(normAnswer)) {
      answer = '错误';
    } else if (!answer) {
      errors.push({ lineNumber: lineStart, type: 'error', message: '判断题缺少正确答案' });
    }
  } else if (type === QuestionType.SINGLE) {
    if (!answer) errors.push({ lineNumber: lineStart, type: 'error', message: '缺少正确答案' });
    if (options.length < 2) errors.push({ lineNumber: lineStart, type: 'error', message: `选项数不足（当前${options.length}个）` });
  } else if (type === QuestionType.MULTI) {
    if (!answer) errors.push({ lineNumber: lineStart, type: 'error', message: '缺少正确答案' });
    if (options.length < 2) errors.push({ lineNumber: lineStart, type: 'error', message: `选项数不足（当前${options.length}个）` });
    // 标准化多选题答案格式
    answer = answer.toUpperCase().replace(/[,，、\s]+/g, ',');
  }

  const q: ImportQuestionDTO = {
    type,
    content: content.trim(),
    answer: answer || '',
    analysis: analysis || undefined,
    difficulty,
    options: options.map((o) => ({ label: o.label.toUpperCase(), content: o.content })),
  };

  return { q, errors };
}

// ─── 分块 ───

function splitBlocks(text: string): RawQuestion[] {
  const blocks: RawQuestion[] = [];
  const lines = text.split('\n');
  let currentType: string | null = null;
  let currentLines: string[] = [];
  let currentLineStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const typeMatch = line.match(TYPE_PATTERN);

    if (typeMatch) {
      // 保存上一个块
      if (currentType && currentLines.length > 0) {
        blocks.push({ type: parseType(currentType), lines: currentLines, lineStart: currentLineStart });
      }
      currentType = typeMatch[1];
      currentLines = [];
      currentLineStart = i + 1;
    } else if (currentType) {
      currentLines.push(line);
    }
  }

  // 最后一个块
  if (currentType && currentLines.length > 0) {
    blocks.push({ type: parseType(currentType), lines: currentLines, lineStart: currentLineStart });
  }

  return blocks;
}

// ─── 主入口 ───

export async function parseWordFile(buffer: Buffer): Promise<{ questions: ImportQuestionDTO[]; result: ImportResult }> {
  const { value: rawText } = await mammoth.extractRawText({ buffer });

  const text = normalizeText(rawText);
  const blocks = splitBlocks(text);
  const questions: ImportQuestionDTO[] = [];
  const errors: ImportError[] = [];

  for (const block of blocks) {
    const { q, errors: blockErrors } = parseSingleQuestion(
      block.type === 1 ? '单选题' : block.type === 2 ? '多选题' : '判断题',
      block.lines,
      block.lineStart,
    );

    if (blockErrors.length > 0) {
      errors.push(...blockErrors);
      continue;
    }

    questions.push(q);
  }

  return {
    questions,
    result: {
      imported: questions.length,
      failed: errors.length,
      errors,
    },
  };
}
