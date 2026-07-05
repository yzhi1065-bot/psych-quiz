const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\25338\\Desktop\\三级心理咨询师培训-理论练习题（word版） (3)\\三级心理咨询师培训-理论练习题（word版）';

const files = [
  { path: path.join(baseDir, '理论第一章心理学导论练习题.docx'), ch: 1, name: '心理学导论' },
  { path: path.join(baseDir, '理论第二章社会心理学练习题.docx'), ch: 2, name: '社会心理学' },
  { path: path.join(baseDir, '理论第三章人格心理学练习题.docx'), ch: 11, name: '人格心理学' },
  { path: path.join(baseDir, '理论第四章发展心理学练习题.docx'), ch: 3, name: '发展心理学' },
  { path: path.join(baseDir, '理论第五章异常心理学练习题.docx'), ch: 12, name: '异常心理学' },
  { path: path.join(baseDir, '理论第六章咨询心理学练习题.docx'), ch: 6, name: '咨询心理学' },
];

async function getToken() {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '13800000000', password: 'admin123' }),
  });
  const data = await res.json();
  return data.data.token;
}

async function importFile(token, filePath, chapterId) {
  const buffer = fs.readFileSync(filePath);
  const boundary = '----' + Math.random().toString(36).substring(2, 15);

  // Build multipart body manually
  const header = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${path.basename(filePath)}"\r\n` +
    `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`,
    'utf-8'
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');

  const response = await fetch(`http://localhost:3000/api/questions/import?chapterId=${chapterId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: Buffer.concat([header, buffer, footer]),
  });

  const text = await response.text();
  return JSON.parse(text);
}

async function main() {
  console.log('Getting token...');
  const token = await getToken();
  console.log('Token obtained.\n');

  for (const f of files) {
    process.stdout.write(`>>> 导入 ${f.name}... `);
    try {
      const result = await importFile(token, f.path, f.ch);
      if (result.data) {
        console.log(`成功: 导入 ${result.data.imported} 题, 失败 ${result.data.failed} (共 ${result.data.total})`);
        if (result.data.errors && result.data.errors.length > 0) {
          console.log(`  警告: ${result.data.errors.length} 个问题`);
          result.data.errors.slice(0, 3).forEach(e => console.log(`    - ${e.message}`));
        }
      } else {
        console.log(JSON.stringify(result));
      }
    } catch (e) {
      console.log(`错误: ${e.message}`);
    }
  }

  console.log('\n全部导入完成！');
}

main().catch(e => console.error('Fatal:', e));
