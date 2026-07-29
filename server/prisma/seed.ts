import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充数据...');

  // 创建管理员
  const adminHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '13800000000' },
    update: {},
    create: {
      phone: '13800000000',
      passwordHash: adminHash,
      nickname: '管理员',
    },
  });
  console.log(`✅ 管理员账号: 13800000000 / admin123`);

  // 创建章节
  const chapters = [
    { id: 1, name: '基础心理学', sortOrder: 1 },
    { id: 2, name: '社会心理学', sortOrder: 2 },
    { id: 3, name: '发展心理学', sortOrder: 3 },
    { id: 4, name: '变态心理学与健康心理学', sortOrder: 4 },
    { id: 5, name: '心理测量学', sortOrder: 5 },
    { id: 6, name: '咨询心理学', sortOrder: 6 },
    { id: 7, name: '心理诊断技能', sortOrder: 7 },
    { id: 8, name: '心理咨询技能', sortOrder: 8 },
    { id: 9, name: '心理测验技能', sortOrder: 9 },
    { id: 10, name: '伦理与法规', sortOrder: 10 },
  ];

  for (const ch of chapters) {
    await prisma.chapter.upsert({
      where: { id: ch.id },
      update: { name: ch.name },
      create: ch,
    });
  }
  console.log(`✅ 创建了 ${chapters.length} 个章节`);

  // 清空旧题目数据（保持外键顺序）
  console.log('🗑️  清空旧题目数据...');
  await prisma.userAnswer.deleteMany();
  await prisma.userMistake.deleteMany();
  await prisma.userFavorite.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();

  // 从 JSON 文件加载题目
  const dataPath = path.join(__dirname, 'questions-data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ 题库文件不存在:', dataPath);
    process.exit(1);
  }

  const questionsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`📦 从题库文件加载了 ${questionsData.length} 道题`);

  // 批量入库
  let imported = 0;
  for (const q of questionsData) {
    const { options, ...questionData } = q;
    await prisma.question.create({
      data: {
        ...questionData,
        options: options && options.length > 0
          ? { create: options.map((o: any, i: number) => ({ label: o.label, content: o.content, sortOrder: i })) }
          : undefined,
      },
    });
    imported++;
    if (imported % 20 === 0) {
      console.log(`  ➡️  已导入 ${imported}/${questionsData.length} 题`);
    }
  }

  console.log(`✅ 成功导入 ${imported} 道题目`);
  console.log('🎉 数据填充完成！');
}

main()
  .catch((e) => {
    console.error('❌ 填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
