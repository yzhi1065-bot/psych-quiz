async function main() {
  // Check chapter 1 (心理学导论) order
  const r1 = await fetch('http://localhost:3000/api/questions?chapterId=1&mode=sequential');
  const d1 = await r1.json();
  const qs = d1.data;
  console.log('=== Chapter 1 - First 10 ===');
  qs.slice(0, 10).forEach((q, i) => console.log((i+1) + '. ' + q.content.substring(0, 70)));
  console.log('\n=== Chapter 1 - Type transition points ===');
  let prevType = qs[0].type;
  for (let i = 1; i < qs.length; i++) {
    if (qs[i].type !== prevType) {
      console.log(`Transition at #${i+1}: type ${prevType} -> ${qs[i].type}`);
      console.log(`  Last of prev: ${qs[i-1].content.substring(0, 50)}`);
      console.log(`  First of new: ${qs[i].content.substring(0, 50)}`);
      prevType = qs[i].type;
    }
  }
  console.log('\n=== All chapters count ===');
  const ch = await fetch('http://localhost:3000/api/chapters');
  const chs = (await ch.json()).data;
  chs.filter(c => c._count.questions > 0).forEach(c => console.log(c.name + ': ' + c._count.questions + ' 题'));
  console.log('\nTotal: ' + chs.reduce((s, c) => s + (c._count.questions || 0), 0));
}

main().catch(e => console.log('ERR:', e));
