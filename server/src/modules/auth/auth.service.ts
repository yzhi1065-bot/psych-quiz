import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: dto.phone ? [{ phone: dto.phone }] : undefined,
      },
    });
    if (existing) {
      throw new ConflictException('该手机号已注册');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        passwordHash: hash,
        nickname: `用户${Date.now().toString().slice(-6)}`,
      },
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = dto.phone
      ? await this.prisma.user.findUnique({ where: { phone: dto.phone } })
      : null;

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    return this.generateToken(user);
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatarUrl: true,
        totalAnswered: true,
        totalCorrect: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('用户不存在');
    return user;
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, phone: user.phone };
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
      },
    };
  }
}
