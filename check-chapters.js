async function main() {
  // Check chapters 11 (人格心理学) and 12 (异常心理学) - no seed data
  for (const ch of [11, 12]) {
    const r = await fetch(`http://localhost:3000/api/questions?chapterId=${ch}&mode=sequential`);
    const d = await r.json();
    const qs = d.data || [];
    console.log(`=== Chapter ${ch} (${qs.length} questions) ===`);
    qs.slice(0, 5).forEach((q, i) => console.log(`  ${i+1}. [type=${q.type}] ${q.content.substring(0, 60)}`));
    // Show type distribution
    const types = {};
    qs.forEach(q => { types[q.type] = (types[q.type] || 0) + 1; });
    console.log('  Types:', JSON.stringify(types));
    let changes = 0;
    for (let i = 1; i < qs.length; i++) if (qs[i].type !== qs[i-1].type) changes++;
    console.log(`  Type transitions: ${changes}`);
    console.log('');
  }
}
main().catch(e => console.log('ERR:', e));
