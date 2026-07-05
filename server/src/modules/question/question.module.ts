import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [ChapterController, QuestionController, ImportController],
  providers: [ChapterService, QuestionService, ImportService],
  exports: [ChapterService, QuestionService],
})
export class QuestionModule {}
