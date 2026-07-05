import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChapterService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.chapter.findMany({
      where: { status: 1 },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { questions: true } } },
    });
  }

  async findTree() {
    const chapters = await this.prisma.chapter.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { questions: true } } },
    });
    // 构建树形结构（支持两级）
    const roots = chapters.filter((c) => !c.parentId);
    return roots.map((root) => ({
      ...root,
      children: chapters.filter((c) => c.parentId === root.id),
    }));
  }

  async create(data: { name: string; parentId?: number; sortOrder?: number }) {
    const maxSort = await this.prisma.chapter.aggregate({ _max: { sortOrder: true } });
    return this.prisma.chapter.create({
      data: {
        name: data.name,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
      },
    });
  }

  async update(id: number, data: { name?: string; sortOrder?: number; status?: number }) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id } });
    if (!chapter) throw new NotFoundException('章节不存在');
    return this.prisma.chapter.update({ where: { id }, data });
  }

  async remove(id: number) {
    const questionCount = await this.prisma.question.count({ where: { chapterId: id } });
    if (questionCount > 0) {
      throw new ConflictException('该章节下有题目，请先删除或移动题目');
    }
    return this.prisma.chapter.delete({ where: { id } });
  }
}
