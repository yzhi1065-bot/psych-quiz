async function main() {
  const r = await fetch('http://localhost:3000/api/questions?chapterId=1&mode=sequential');
  const d = await r.json();
  const qs = d.data || [];
  console.log('Total in ch1:', qs.length);
  qs.slice(0, 10).forEach((q, i) => {
    console.log((i+1) + '. id=' + q.id + ' type=' + q.type + ' ' + q.content.substring(0, 60));
  });
  console.log('...');
  qs.slice(-5).forEach((q, i) => {
    console.log((qs.length-5+i+1) + '. id=' + q.id + ' type=' + q.type + ' ' + q.content.substring(0, 60));
  });
  // Check order: are types mixed?
  const typeCounts = {};
  qs.forEach(q => { typeCounts[q.type] = (typeCounts[q.type] || 0) + 1; });
  console.log('\nQuestion types:', typeCounts);
  
  // Check if questions are grouped by type (single -> multi -> judge) or mixed
  let typeChanges = 0;
  for (let i = 1; i < qs.length; i++) {
    if (qs[i].type !== qs[i-1].type) typeChanges++;
  }
  console.log('Type changes:', typeChanges);
}

main().catch(e => console.log('ERR:', e));
