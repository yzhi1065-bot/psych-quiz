import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { QuestionModule } from './modules/question/question.module';
import { AnswerModule } from './modules/answer/answer.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, QuestionModule, AnswerModule],
})
export class AppModule {}
