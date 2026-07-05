import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('chapters')
export class ChapterController {
  constructor(private chapterService: ChapterService) {}

  @Get()
  findAll(@Query('tree') tree?: string) {
    return tree === '1' ? this.chapterService.findTree() : this.chapterService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: { name: string; parentId?: number; sortOrder?: number }) {
    return this.chapterService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; sortOrder?: number; status?: number }) {
    return this.chapterService.update(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chapterService.remove(+id);
  }
}
