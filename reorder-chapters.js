async function main() {
  const login = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '13800000000', password: 'admin123' }),
  });
  const token = (await login.json()).data.token;
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Chapters with questions → sortOrder 1-6
  const withQs = [
    { id: 1, name: '基础心理学', sort: 1 },
    { id: 2, name: '社会心理学', sort: 2 },
    { id: 3, name: '发展心理学', sort: 3 },
    { id: 6, name: '咨询心理学', sort: 4 },
    { id: 11, name: '人格心理学', sort: 5 },
    { id: 12, name: '异常心理学', sort: 6 },
  ];
  // Empty chapters → sortOrder 7-12
  const empty = [
    { id: 4, name: '变态心理学与健康心理学', sort: 7 },
    { id: 5, name: '心理测量学', sort: 8 },
    { id: 7, name: '心理诊断技能', sort: 9 },
    { id: 8, name: '心理咨询技能', sort: 10 },
    { id: 9, name: '心理测验技能', sort: 11 },
    { id: 10, name: '伦理与法规', sort: 12 },
  ];

  for (const c of [...withQs, ...empty]) {
    const r = await fetch(`http://localhost:3000/api/chapters/${c.id}`, {
      method: 'PUT', headers: h,
      body: JSON.stringify({ sortOrder: c.sort }),
    });
    const data = await r.json();
    console.log(`${data.data.sortOrder}. ${data.data.name} (${data.data._count?.questions || 0} 题)`);
  }
}

main().catch(e => console.error(e));
