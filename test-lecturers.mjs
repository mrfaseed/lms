async function test() {
  try {
    const loginRes = await fetch('http://127.0.0.1:8000/accounts/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password' }),
    });
    const loginData = await loginRes.json();
    console.log("Login data access:", !!loginData.access);
    
    if (loginData.access) {
      const fetchRes = await fetch('http://localhost:8000/accounts/api/admin/users/?role=lecturer&page_size=1000', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + loginData.access,
          'Content-Type': 'application/json'
        }
      });
      console.log("Status:", fetchRes.status);
      const data = await fetchRes.json();
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
