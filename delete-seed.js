async function main() {
  // Login
  const login = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '13800000000', password: 'admin123' }),
  });
  const token = (await login.json()).data.token;
  const headers = { Authorization: `Bearer ${token}` };

  // Delete seed questions (ids 1-10)
  for (let id = 1; id <= 10; id++) {
    const r = await fetch(`http://localhost:3000/api/questions/${id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await r.json();
    console.log(`Delete q${id}: ${data.message}`);
  }

  console.log('\nDone. Verifying...');
  const r = await fetch('http://localhost:3000/api/chapters');
  const chapters = await r.json();
  chapters.data.forEach(ch => {
    if (ch._count.questions > 0) {
      console.log(`ch${ch.id} ${ch.name}: ${ch._count.questions} 题`);
    }
  });
}

main().catch(e => console.error('ERR:', e));
