import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充初始数据...');

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
    { name: '基础心理学', sortOrder: 1 },
    { name: '社会心理学', sortOrder: 2 },
    { name: '发展心理学', sortOrder: 3 },
    { name: '变态心理学与健康心理学', sortOrder: 4 },
    { name: '心理测量学', sortOrder: 5 },
    { name: '咨询心理学', sortOrder: 6 },
    { name: '心理诊断技能', sortOrder: 7 },
    { name: '心理咨询技能', sortOrder: 8 },
    { name: '心理测验技能', sortOrder: 9 },
    { name: '伦理与法规', sortOrder: 10 },
  ];

  for (const ch of chapters) {
    await prisma.chapter.upsert({
      where: { id: ch.sortOrder },
      update: { name: ch.name },
      create: { id: ch.sortOrder, name: ch.name, sortOrder: ch.sortOrder },
    });
  }
  console.log(`✅ 创建了 ${chapters.length} 个章节`);

  // 创建样题 (10 道)
  const sampleQuestions = [
    {
      type: 1, chapterId: 1, sortOrder: 1,
      content: '以下哪项不属于心理学的研究方法？',
      answer: 'C',
      analysis: '心理学主要研究方法有观察法、实验法、调查法和测验法。演绎推理是逻辑学方法，不是心理学专门研究方法。',
      options: [
        { label: 'A', content: '观察法' },
        { label: 'B', content: '实验法' },
        { label: 'C', content: '演绎推理' },
        { label: 'D', content: '调查法' },
      ],
    },
    {
      type: 1, chapterId: 1, sortOrder: 2,
      content: '"入芝兰之室，久而不闻其香"描述的是哪种心理现象？',
      answer: 'B',
      analysis: '这是感觉适应现象。嗅觉适应后，对持续存在的气敏感觉阈限升高，不再感知到。',
      options: [
        { label: 'A', content: '感觉对比' },
        { label: 'B', content: '感觉适应' },
        { label: 'C', content: '联觉' },
        { label: 'D', content: '感觉后像' },
      ],
    },
    {
      type: 2, chapterId: 2, sortOrder: 1,
      content: '以下哪些属于社会心理学中的归因偏差？（多选）',
      answer: 'A,B,C',
      analysis: '基本归因错误、自利偏差（自我服务偏差）、行动者-观察者偏差都是常见的归因偏差。确认偏差是认知偏差，不属于归因偏差。',
      options: [
        { label: 'A', content: '基本归因错误' },
        { label: 'B', content: '自利偏差' },
        { label: 'C', content: '行动者-观察者偏差' },
        { label: 'D', content: '确认偏差' },
      ],
    },
    {
      type: 2, chapterId: 2, sortOrder: 2,
      content: '下列属于从众行为影响因素的有？（多选）',
      answer: 'A,B,D',
      analysis: '群体规模（3-4人以上影响最大）、群体凝聚力、个体对群体的依赖程度都会影响从众行为。任务难度本身不直接影响从众，但模糊情境会增加从众倾向。',
      options: [
        { label: 'A', content: '群体规模' },
        { label: 'B', content: '群体凝聚力' },
        { label: 'C', content: '任务难度' },
        { label: 'D', content: '个体对群体的依赖程度' },
      ],
    },
    {
      type: 3, chapterId: 3, sortOrder: 1,
      content: '皮亚杰认为儿童在具体运算阶段能够进行抽象逻辑思维。',
      answer: '错误',
      analysis: '皮亚杰理论中，具体运算阶段（7-11岁）的儿童能够进行逻辑推理，但必须借助具体事物支持。抽象逻辑思维是形式运算阶段（11岁以上）才具备的能力。',
    },
    {
      type: 3, chapterId: 3, sortOrder: 2,
      content: '埃里克森认为青少年期的主要发展任务是建立自我同一性。',
      answer: '正确',
      analysis: '埃里克森的心理社会发展理论指出，青少年期（12-18岁）的发展危机是"同一性vs角色混乱"，主要任务是建立自我同一性。',
    },
    {
      type: 1, chapterId: 4, sortOrder: 1,
      content: '以下哪种障碍属于焦虑障碍？',
      answer: 'B',
      analysis: '广泛性焦虑障碍（GAD）属于焦虑障碍。精神分裂症属于精神病性障碍，双相障碍属于心境障碍，反社会人格障碍属于人格障碍。',
      options: [
        { label: 'A', content: '精神分裂症' },
        { label: 'B', content: '广泛性焦虑障碍' },
        { label: 'C', content: '双相障碍' },
        { label: 'D', content: '反社会人格障碍' },
      ],
    },
    {
      type: 1, chapterId: 6, sortOrder: 1,
      content: '心理咨询中，咨询师保持价值中立原则的主要目的是？',
      answer: 'C',
      analysis: '价值中立原则旨在尊重来访者的自主权，避免咨询师将自己的价值观强加给来访者，帮助来访者建立自己的价值体系。',
      options: [
        { label: 'A', content: '避免法律纠纷' },
        { label: 'B', content: '保持专业客观性' },
        { label: 'C', content: '尊重来访者的自主权' },
        { label: 'D', content: '提高咨询效率' },
      ],
    },
    {
      type: 1, chapterId: 10, sortOrder: 1,
      content: '心理咨询师在发现来访者有伤害他人的意图时，应当？',
      answer: 'A',
      analysis: '根据保密原则的例外，当来访者可能对自身或他人造成严重伤害时，咨询师有责任向相关方（如潜在受害者、警方）发出预警。这是"保护责任"原则的体现（Tarasoff案裁决）。',
      options: [
        { label: 'A', content: '突破保密原则，向潜在受害者和相关部门预警' },
        { label: 'B', content: '严格遵守保密原则，不对外透露' },
        { label: 'C', content: '立即结束咨询关系' },
        { label: 'D', content: '建议来访者自行报警' },
      ],
    },
    {
      type: 3, chapterId: 5, sortOrder: 1,
      content: '信度是指测量工具能够测出其所要测量特质的程度。',
      answer: '错误',
      analysis: '信度（reliability）是指测量结果的稳定性和一致性程度。效度（validity）才是指测量工具能够测出其所要测量特质的程度。',
    },
  ];

  for (const q of sampleQuestions) {
    const { options, ...questionData } = q;
    const created = await prisma.question.create({
      data: {
        ...questionData,
        options: { create: options || [] },
      },
    });
    console.log(`  ✅ 创建题目 #${created.id}: ${created.content.substring(0, 30)}...`);
  }
  console.log(`✅ 创建了 ${sampleQuestions.length} 道样题`);
  console.log('🎉 初始数据填充完成！');
}

main()
  .catch((e) => {
    console.error('❌ 填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
