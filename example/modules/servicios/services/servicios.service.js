export async function getUsers(forceError = false) {
  const url = forceError
    ? "https://jsonplaceholder.typicode.com/invalid-endpoint"
    : "https://jsonplaceholder.typicode.com/users";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — endpoint no encontrado`);
  return res.json();
}
