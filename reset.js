async function run() {
  const r = await fetch('http://localhost:3000/api/auth/reset-db', {method: 'POST'});
  console.log(await r.text());
}
run();
