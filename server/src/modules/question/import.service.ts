import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parseWordFile } from './word-parser';
import { parseTheoryWord } from './word-parser-theory';
import { readFile, unlink } from 'fs/promises';

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

  async importFromWord(filePath: string, chapterId?: number) {
    // 解析 Word
    const buffer = await readFile(filePath);

    // 尝试两种格式解析：标准格式 → 理论练习题格式
    let parsed = await parseWordFile(buffer);
    if (parsed.questions.length === 0) {
      parsed = await parseTheoryWord(buffer);
    }
    const { questions, result } = parsed;

    // 清理临时文件
    await unlink(filePath).catch(() => {});

    if (questions.length === 0) {
      throw new BadRequestException({
        message: '未能解析出任何题目',
        errors: result.errors,
      });
    }

    // 如果没有指定章节，使用第一个题目所在的章节，或默认第1章
    const targetChapterId = chapterId || 1;

    // 批量入库
    let imported = 0;
    let failed = 0;
    const errors: any[] = [...result.errors];

    for (const q of questions) {
      try {
        await this.prisma.question.create({
          data: {
            type: q.type,
            chapterId: targetChapterId,
            content: q.content,
            answer: q.answer,
            analysis: q.analysis,
            difficulty: q.difficulty ?? 1,
            options: q.options.length > 0
              ? { create: q.options.map((o, i) => ({ label: o.label, content: o.content, sortOrder: i })) }
              : undefined,
          },
        });
        imported++;
      } catch (e: any) {
        failed++;
        errors.push({ type: 'error', message: `入库失败: ${e.message}`, rawContent: q.content.substring(0, 50) });
      }
    }

    return {
      imported,
      failed,
      total: questions.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
