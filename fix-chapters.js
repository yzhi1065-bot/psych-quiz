async function main() {
  // Login
  const login = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '13800000000', password: 'admin123' }),
  });
  const loginData = await login.json();
  const token = loginData.data.token;

  // Update chapter 11: 人格心理学
  const r1 = await fetch('http://localhost:3000/api/chapters/11', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ name: '人格心理学' }),
  });
  console.log('ch 11:', await r1.json());

  // Update chapter 12: 异常心理学
  const r2 = await fetch('http://localhost:3000/api/chapters/12', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ name: '异常心理学' }),
  });
  console.log('ch 12:', await r2.json());

  // Verify
  const chapters = await fetch('http://localhost:3000/api/chapters');
  const chData = await chapters.json();
  chData.data.filter(c => c.id >= 11).forEach(c => console.log(c.id, c.name, c._count.questions, '题'));
}

main().catch(e => console.error(e));
