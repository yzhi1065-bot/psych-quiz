const fs = require('fs');
const mammoth = require('./server/node_modules/mammoth');

async function main() {
  const buf = fs.readFileSync('C:/Users/25338/Desktop/三级心理咨询师培训-理论练习题（word版） (3)/三级心理咨询师培训-理论练习题（word版）/理论第一章心理学导论练习题.docx');
  const r = await mammoth.extractRawText({ buffer: buf });
  const lines = r.value.split('\n').map(l => l.trim()).filter(l => l);
  console.log('=== First 30 lines ===');
  lines.slice(0, 30).forEach((l, i) => console.log((i + 1) + '. ' + l.substring(0, 100)));
  console.log('\n=== Total lines:', lines.length, '===');
}

main().catch(e => {
  console.error('Error:', e.message);
  console.error(e.stack);
}).finally(() => process.exit(0));
