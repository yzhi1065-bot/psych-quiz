import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('answer')
@UseGuards(JwtAuthGuard)
export class AnswerController {
  constructor(private answerService: AnswerService) {}

  @Post('submit')
  submit(
    @CurrentUser('id') userId: number,
    @Body() body: { questionId: number; userAnswer: string },
  ) {
    return this.answerService.submit(userId, body.questionId, body.userAnswer);
  }

  @Get('mistakes')
  getMistakes(
    @CurrentUser('id') userId: number,
    @Query('chapterId') chapterId?: string,
  ) {
    return this.answerService.getMistakes(userId, chapterId ? +chapterId : undefined);
  }

  @Delete('mistakes/:questionId')
  removeMistake(
    @CurrentUser('id') userId: number,
    @Param('questionId') questionId: string,
  ) {
    return this.answerService.removeMistake(userId, +questionId);
  }

  @Delete('mistakes/clear')
  clearMistakes(@CurrentUser('id') userId: number) {
    return this.answerService.clearMistakes(userId);
  }

  @Get('stats')
  getStats(@CurrentUser('id') userId: number) {
    return this.answerService.getStats(userId);
  }

  @Post('favorites')
  addFavorite(@CurrentUser('id') userId: number, @Body() body: { questionId: number }) {
    return this.answerService.addFavorite(userId, body.questionId);
  }

  @Delete('favorites/:questionId')
  removeFavorite(@CurrentUser('id') userId: number, @Param('questionId') questionId: string) {
    return this.answerService.removeFavorite(userId, +questionId);
  }

  @Get('favorites')
  getFavorites(
    @CurrentUser('id') userId: number,
    @Query('chapterId') chapterId?: string,
  ) {
    return this.answerService.getFavorites(userId, chapterId ? +chapterId : undefined);
  }

  @Get('favorites/check/:questionId')
  checkFavorite(@CurrentUser('id') userId: number, @Param('questionId') questionId: string) {
    return this.answerService.checkFavorite(userId, +questionId);
  }

  @Get('calendar')
  getCalendar(@CurrentUser('id') userId: number) {
    return this.answerService.getCalendar(userId);
  }
}
