fetch('http://localhost:8000/accounts/api/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: "admin", password: "password" })
}).then(res => res.json()).then(console.log).catch(console.error);
