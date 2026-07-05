import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnswerService {
  constructor(private prisma: PrismaService) {}

  // 提交答案 + 判分
  async submit(userId: number, questionId: number, userAnswer: string) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new Error('题目不存在');

    const isCorrect = this.checkAnswer(question.type, userAnswer, question.answer);

    // 记录答题记录
    await this.prisma.userAnswer.create({
      data: { userId, questionId, userAnswer, isCorrect },
    });

    // 更新用户累计数据
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totalAnswered: { increment: 1 },
        totalCorrect: isCorrect ? { increment: 1 } : undefined,
      },
    });

    // 错题处理
    if (!isCorrect) {
      const existing = await this.prisma.userMistake.findUnique({
        where: { userId_questionId: { userId, questionId } },
      });
      if (existing) {
        await this.prisma.userMistake.update({
          where: { id: existing.id },
          data: { wrongCount: { increment: 1 }, lastWrongAt: new Date() },
        });
      } else {
        await this.prisma.userMistake.create({
          data: { userId, questionId },
        });
      }
    } else {
      // 答对了，如果之前在错题本中，可保留或移除
      // 规则：答对自动移出错题本
      await this.prisma.userMistake.deleteMany({
        where: { userId, questionId },
      });
    }

    return {
      isCorrect,
      correctAnswer: question.answer,
      analysis: question.analysis,
      userAnswer,
    };
  }

  // 判卷逻辑
  private checkAnswer(type: number, userAnswer: string, correctAnswer: string): boolean {
    if (type === 2) {
      // 多选题：比较排序后的选项
      const normalize = (s: string) => s.toUpperCase().replace(/[,，、\s]+/g, '').split('').sort().join('');
      return normalize(userAnswer) === normalize(correctAnswer);
    }
    // 单选题和判断题：忽略大小写和空白
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  }

  // 错题列表
  async getMistakes(userId: number, chapterId?: number) {
    const where: any = { userId };
    if (chapterId) {
      where.question = { chapterId };
    }

    const mistakes = await this.prisma.userMistake.findMany({
      where,
      include: {
        question: {
          include: { options: { orderBy: { sortOrder: 'asc' } }, chapter: { select: { name: true } } },
        },
      },
      orderBy: { lastWrongAt: 'desc' },
    });

    return mistakes.map((m) => ({
      id: m.id,
      wrongCount: m.wrongCount,
      lastWrongAt: m.lastWrongAt,
      question: m.question,
    }));
  }

  // 从错题本移除（答对后手动）
  async removeMistake(userId: number, questionId: number) {
    await this.prisma.userMistake.deleteMany({
      where: { userId, questionId },
    });
    return { removed: true };
  }

  // 清空全部错题
  async clearMistakes(userId: number) {
    const { count } = await this.prisma.userMistake.deleteMany({
      where: { userId },
    });
    return { removed: count };
  }

  // ── 收藏 ──

  async addFavorite(userId: number, questionId: number) {
    await this.prisma.userFavorite.upsert({
      where: { userId_questionId: { userId, questionId } },
      update: {},
      create: { userId, questionId },
    });
    return { favorited: true };
  }

  async removeFavorite(userId: number, questionId: number) {
    await this.prisma.userFavorite.deleteMany({
      where: { userId, questionId },
    });
    return { removed: true };
  }

  async getFavorites(userId: number, chapterId?: number) {
    const where: any = { userId };
    if (chapterId) where.question = { chapterId };

    const favs = await this.prisma.userFavorite.findMany({
      where,
      include: {
        question: {
          include: { options: { orderBy: { sortOrder: 'asc' } }, chapter: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favs.map((f) => ({
      id: f.id,
      createdAt: f.createdAt,
      question: f.question,
    }));
  }

  async checkFavorite(userId: number, questionId: number) {
    const fav = await this.prisma.userFavorite.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });
    return { favorited: !!fav };
  }

  // 学习统计
  async getStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { totalAnswered: true, totalCorrect: true },
    });

    const chapterStats = await this.prisma.userAnswer.groupBy({
      by: ['questionId'],
      where: { userId },
      _count: { id: true },
    });

    // 各章节统计
    const questions = await this.prisma.question.findMany({
      select: { id: true, chapterId: true, chapter: { select: { name: true } } },
    });

    const chapterMap = new Map<number, { name: string; total: number; correct: number }>();
    const answers = await this.prisma.userAnswer.findMany({
      where: { userId },
      select: { questionId: true, isCorrect: true },
    });

    const correctSet = new Map<number, boolean[]>();
    for (const a of answers) {
      if (!correctSet.has(a.questionId)) correctSet.set(a.questionId, []);
      correctSet.get(a.questionId)!.push(a.isCorrect);
    }

    for (const q of questions) {
      if (!chapterMap.has(q.chapterId)) {
        chapterMap.set(q.chapterId, { name: q.chapter.name, total: 0, correct: 0 });
      }
      const stats = chapterMap.get(q.chapterId)!;
      const records = correctSet.get(q.id) || [];
      if (records.length > 0) {
        stats.total += records.length;
        stats.correct += records.filter(Boolean).length;
      }
    }

    return {
      totalAnswered: user?.totalAnswered || 0,
      totalCorrect: user?.totalCorrect || 0,
      accuracy: user && user.totalAnswered > 0
        ? Math.round((user.totalCorrect / user.totalAnswered) * 100) : 0,
      chapters: Array.from(chapterMap.entries()).map(([id, stats]) => ({
        chapterId: id,
        chapterName: stats.name,
        total: stats.total,
        correct: stats.correct,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      })),
    };
  }

  // 日历数据：最近 365 天每日做题数
  async getCalendar(userId: number) {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    const records = await this.prisma.userAnswer.findMany({
      where: { userId, createdAt: { gte: yearAgo } },
      select: { createdAt: true },
    });

    const dayMap: Record<string, number> = {};
    for (const r of records) {
      const day = r.createdAt.toISOString().slice(0, 10);
      dayMap[day] = (dayMap[day] || 0) + 1;
    }

    return { days: dayMap };
  }
}
