import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { totalAnswered: true, totalCorrect: true },
    });

    return {
      totalAnswered: user?.totalAnswered || 0,
      totalCorrect: user?.totalCorrect || 0,
      accuracy: user && user.totalAnswered > 0
        ? Math.round((user.totalCorrect / user.totalAnswered) * 100)
        : 0,
    };
  }

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, phone: true, nickname: true, totalAnswered: true, totalCorrect: true, createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);
    return {
      list: list.map((u) => ({
        ...u,
        accuracy: u.totalAnswered > 0 ? Math.round((u.totalCorrect / u.totalAnswered) * 100) : 0,
      })),
      total, page, pageSize,
    };
  }

  async updateProfile(userId: number, data: { nickname?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, nickname: true, avatarUrl: true },
    });
  }
}
