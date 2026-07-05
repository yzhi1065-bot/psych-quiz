const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  for (const id of [1, 2]) {
    await prisma.questionOption.deleteMany({ where: { questionId: id } });
    await prisma.userAnswer.deleteMany({ where: { questionId: id } });
    await prisma.userMistake.deleteMany({ where: { questionId: id } });
    await prisma.userFavorite.deleteMany({ where: { questionId: id } });
    await prisma.question.delete({ where: { id } });
    console.log('Deleted q' + id);
  }
  const c = await prisma.question.count({ where: { chapterId: 1 } });
  console.log('Chapter 1 now has ' + c + ' questions');
}

main().catch(e => console.error(e.message)).finally(() => prisma.$disconnect());
