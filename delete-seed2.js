async function main() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  // Delete questions 1 and 2 with their related records
  for (const id of [1, 2]) {
    // Delete related records first
    await prisma.questionOption.deleteMany({ where: { questionId: id } });
    await prisma.userAnswer.deleteMany({ where: { questionId: id } });
    await prisma.userMistake.deleteMany({ where: { questionId: id } });
    await prisma.userFavorite.deleteMany({ where: { questionId: id } });
    // Now delete the question
    await prisma.question.delete({ where: { id } });
    console.log(`Deleted q${id}`);
  }

  // Verify chapter 1 count
  const count = await prisma.question.count({ where: { chapterId: 1 } });
  console.log(`\nChapter 1 now has ${count} questions`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('ERR:', e.message);
  process.exit(1);
});
