const url = 'http://localhost:3000/api/auth/signin';

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@edusphere.local', password: 'Demo123!', deviceId: 'test-device' })
})
  .then(res => res.json().then(data => ({ status: res.status, data })))
  .then(console.log)
  .catch(console.error);
