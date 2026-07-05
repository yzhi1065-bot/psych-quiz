import { ImportQuestionDTO, ImportError, ImportResult, QuestionType } from './types';
import * as mammoth from 'mammoth';

// 标准格式解析（已有的）
export { parseWordFile as parseStandardFormat } from './word-parser';

// ─── 新格式解析：N.题目 / 答案：X / 解析：xxx ───

function normalizeLine(line: string): string {
  return line.replace(/\s/g, ' ').trim();
}

export async function parseTheoryWord(buffer: Buffer): Promise<{ questions: ImportQuestionDTO[]; result: ImportResult }> {
  const { value: rawText } = await mammoth.extractRawText({ buffer });
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);

  const errors: ImportError[] = [];
  const questions: ImportQuestionDTO[] = [];
  const totalLines = lines.length;

  // 临时状态
  let currentType: QuestionType = QuestionType.SINGLE;
  let currentContent = '';
  let currentOptions: { label: string; content: string }[] = [];
  let currentAnswer = '';
  let currentAnalysis = '';
  let lineIdx = 0;

  function flushQuestion() {
    if (!currentContent && currentOptions.length === 0) return; // 跳过空块

    // 确定题型
    let type = currentType;
    // 多选题检测：答案含逗号或答案含多个大写字母（如 "ABD"）
    if (currentAnswer.includes(',') || /^[A-Da-d]{2,}$/.test(currentAnswer.replace(/\s/g, ''))) {
      type = QuestionType.MULTI;
    }
    // 判断题检测
    if (/^[正确错误对错√×✓✗]$/i.test(currentAnswer.replace(/\s/g, ''))) type = QuestionType.JUDGE;

    // 判断题没有选项，从内容推断
    if (type === QuestionType.JUDGE || (!currentOptions.length && /[是不是有没有能否可否]/.test(currentContent))) {
      type = QuestionType.JUDGE;
    }

    // 标准化判断题答案
    if (type === QuestionType.JUDGE) {
      const ans = currentAnswer.replace(/\s/g, '');
      if (/^(√|✓|对|是|正确|T|t|true)$/i.test(ans)) currentAnswer = '正确';
      else if (/^(×|✗|错|否|错误|F|f|false)$/i.test(ans)) currentAnswer = '错误';
      // 有些题用"正确"和"错误"作为选项，检查内容
      if (!currentAnswer) {
        if (/正确/.test(currentContent) && /错误/.test(currentContent)) {
          // 从内容推断
        }
      }
    }

    // 验证
    const qErrors: ImportError[] = [];
    if (!currentContent.trim()) qErrors.push({ lineNumber: lineIdx, type: 'error', message: '题干为空' });
    if (!currentAnswer) qErrors.push({ lineNumber: lineIdx, type: 'warning', message: '未识别到答案标记，已跳过' });

    if (qErrors.some(e => e.type === 'error')) {
      errors.push(...qErrors);
      return; // 跳过
    }

    // 清理题干（去掉前面的题号如 "1." 或 "10."）
    let cleanContent = currentContent.replace(/^\d+\s*[.、)）]\s*/, '').trim();

    // 多选题答案标准化
    let answer = currentAnswer.replace(/[\s,，、]+/g, ',').replace(/[A-E]/g, m => m.toUpperCase());

    questions.push({
      type: type || QuestionType.SINGLE,
      content: cleanContent,
      answer,
      analysis: currentAnalysis || undefined,
      difficulty: undefined,
      options: type === QuestionType.JUDGE ? [] : currentOptions.map((o, i) => ({
        label: o.label || String.fromCharCode(65 + i),
        content: o.content,
      })),
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = normalizeLine(lines[i]);
    lineIdx = i;

    // 检测新题型区域（先检测，避免被标题跳过规则拦截）
    const sectionMatch = line.match(/第[一二三四五六七八九十]部分\s*(.*?)[（(]\d+[)）]/);
    if (sectionMatch) {
      flushQuestion(); // 先保存上一节最后一题
      const sectionName = sectionMatch[1];
      if (sectionName.includes('多选')) currentType = QuestionType.MULTI;
      else if (sectionName.includes('判断')) currentType = QuestionType.JUDGE;
      else currentType = QuestionType.SINGLE;
      // 清理状态
      currentContent = ''; currentOptions = []; currentAnswer = ''; currentAnalysis = '';
      continue;
    }

    // 跳过标题行（已排除章节标记行）
    if (/^(心理|理论|练习)/.test(line)) {
      continue;
    }

    // 检测新题号: "N." 
    const numMatch = line.match(/^(\d+)\s*[.、)）]\s*(.+)$/);
    if (numMatch) {
      flushQuestion(); // 保存上一题

      currentContent = line.trim();
      currentOptions = [];
      currentAnswer = '';
      currentAnalysis = '';
      continue;
    }

    // 选项: A.xxx 或 A、xxx
    const optMatch = line.match(/^([A-Da-d])\s*[.、:：)）]\s*(.+)$/);
    if (optMatch) {
      currentOptions.push({ label: optMatch[1].toUpperCase(), content: optMatch[2].trim() });
      continue;
    }

    // 答案行
    const ansMatch = line.match(/^答案\s*[:：]?\s*(.+)$/i);
    if (ansMatch) {
      currentAnswer = ansMatch[1].trim();
      continue;
    }

    // 解析行
    const analysisMatch = line.match(/^解析\s*[:：]?\s*(.+)$/i);
    if (analysisMatch) {
      currentAnalysis = analysisMatch[1].trim();
      continue;
    }

    // 出处行 - 忽略
    if (/^出处/.test(line)) continue;

    // 如果是当前题目尚未结束的文本（如选项跨行或题干的延续）
    if (currentContent) {
      if (currentContent.startsWith(line.substring(0, 2))) continue; // 重复行
    }
  }

  // 最后一题
  flushQuestion();

  return {
    questions,
    result: {
      imported: questions.length,
      failed: errors.length,
      errors,
    },
  };
}
