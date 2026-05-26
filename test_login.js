async function test() {
  const res = await fetch('http://localhost:8888/SmartCampusApp/backend/api/auth.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin.scolarite@edu.ece.fr', password: 'password' })
  });
  const text = await res.text();
  console.log("TEXT:", text);
}
test();
