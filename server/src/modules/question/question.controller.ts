import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { QuestionService } from './question.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('questions')
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Get()
  findAll(
    @Query('chapterId') chapterId?: string,
    @Query('type') type?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('mode') mode?: string,
    @Query('limit') limit?: string,
  ) {
    if (!mode || mode === 'sequential' || mode === 'random') {
      const chId = chapterId ? +chapterId : undefined;
      return this.questionService.getByChapter(chId, mode as any, limit ? +limit : undefined);
    }
    return this.questionService.findAll({
      chapterId: chapterId ? +chapterId : undefined,
      type: type ? +type : undefined,
      keyword,
      page: page ? +page : 1,
      pageSize: pageSize ? +pageSize : 20,
    });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.questionService.findById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) {
    return this.questionService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.questionService.update(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionService.remove(+id);
  }
}
