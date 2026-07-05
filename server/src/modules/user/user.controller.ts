import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@CurrentUser('id') userId: number) {
    return this.userService.getStats(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.userService.findAll(page ? +page : 1, pageSize ? +pageSize : 20);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(
    @CurrentUser('id') userId: number,
    @Body() body: { nickname?: string; avatarUrl?: string },
  ) {
    return this.userService.updateProfile(userId, body);
  }
}
