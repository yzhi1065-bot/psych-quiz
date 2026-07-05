import { Controller, Post, Get, UseInterceptors, UploadedFile, BadRequestException, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('questions')
export class ImportController {
  constructor(private importService: ImportService) {}

  @UseGuards(JwtAuthGuard)
  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (ext !== '.docx') {
          cb(new BadRequestException('仅支持 .docx 格式文件'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async importWord(@UploadedFile() file: Express.Multer.File, @Query('chapterId') chapterId?: string) {
    if (!file) throw new BadRequestException('请上传 Word 文件');
    return this.importService.importFromWord(file.path, chapterId ? +chapterId : undefined);
  }
}
