async function test() {
  try {
    const loginRes = await fetch('http://127.0.0.1:8000/accounts/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password' }),
    });
    const loginData = await loginRes.json();
    
    if (loginData.access) {
      const fetchRes = await fetch('http://localhost:8000/api/programs/allocations/', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + loginData.access,
          'Content-Type': 'application/json'
        }
      });
      console.log("Status:", fetchRes.status);
      const data = await fetchRes.text();
      console.log("Response:", data);
    }
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
