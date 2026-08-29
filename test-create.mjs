async function test() {
  try {
    const loginRes = await fetch('http://127.0.0.1:8000/accounts/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password' }),
    });
    const loginData = await loginRes.json();
    console.log("Login:", loginRes.status);
    
    if (loginData.access) {
      const createRes = await fetch('http://localhost:8000/quiz/api/admin/quizzes/', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + loginData.access,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: "Test Quiz",
          description: "This is a test",
          category: "exam",
          pass_mark: 50,
          course_id: null
        })
      });
      console.log("Create status:", createRes.status);
      const createData = await createRes.text();
      console.log("Create response:", createData);
    }
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
