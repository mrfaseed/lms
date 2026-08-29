async function test() {
  try {
    const res = await fetch('http://127.0.0.1:8000/accounts/api/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'admin', password: 'password' }),
    });

    const data = await res.json();
    console.log("Token response:", res.status);
    
    if (data.access) {
      const meRes = await fetch('http://127.0.0.1:8000/accounts/api/me/', {
        headers: {
          'Authorization': 'Bearer ' + data.access
        }
      });
      console.log("Me status:", meRes.status);
      const meData = await meRes.text();
      console.log("Me data:", meData);
    }
  } catch (e) {
    console.error("ERROR:", e);
  }
}

test();
