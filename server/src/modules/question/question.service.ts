import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDTO, UpdateQuestionDTO } from './types';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { chapterId?: number; type?: number; keyword?: string; page?: number; pageSize?: number }) {
    const { chapterId, type, keyword, page = 1, pageSize = 20 } = params;
    const where: any = { status: 1 };

    if (chapterId) where.chapterId = chapterId;
    if (type) where.type = type;
    if (keyword) where.content = { contains: keyword };

    const [list, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ chapterId: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
        include: { options: { orderBy: { sortOrder: 'asc' } }, chapter: { select: { name: true } } },
      }),
      this.prisma.question.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  async findById(id: number) {
    const q = await this.prisma.question.findUnique({
      where: { id },
      include: { options: { orderBy: { sortOrder: 'asc' } }, chapter: { select: { name: true } } },
    });
    if (!q) throw new NotFoundException('题目不存在');
    return q;
  }

  async getByChapter(chapterId?: number, mode: 'sequential' | 'random' = 'sequential', limit?: number) {
    const where: any = { status: 1 };
    // 如果传了章节 ID，只查该章节；否则查所有
    if (chapterId) where.chapterId = chapterId;

    const questions = await this.prisma.question.findMany({
      where,
      orderBy: [{ id: 'asc' }],
      include: { options: { orderBy: { sortOrder: 'asc' } }, chapter: { select: { name: true } } },
    });

    const shuffled = mode === 'random' ? questions.sort(() => Math.random() - 0.5) : questions;
    return limit ? shuffled.slice(0, limit) : shuffled;
  }

  async create(dto: CreateQuestionDTO) {
    const { options, ...questionData } = dto;
    return this.prisma.question.create({
      data: {
        ...questionData,
        options: options ? { create: options.map((o, i) => ({ ...o, sortOrder: o.sortOrder ?? i })) } : undefined,
      },
      include: { options: true },
    });
  }

  async update(id: number, dto: UpdateQuestionDTO) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('题目不存在');

    const { options, ...questionData } = dto;

    // 更新题目字段
    await this.prisma.question.update({ where: { id }, data: questionData });

    // 如果提供了选项，先删后建
    if (options) {
      await this.prisma.questionOption.deleteMany({ where: { questionId: id } });
      await this.prisma.questionOption.createMany({
        data: options.map((o, i) => ({ questionId: id, ...o, sortOrder: o.sortOrder ?? i })),
      });
    }

    return this.findById(id);
  }

  async remove(id: number) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('题目不存在');
    await this.prisma.question.delete({ where: { id } });
    return { id };
  }
}
