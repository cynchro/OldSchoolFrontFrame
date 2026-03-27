/**
 * Clientes API — data only (no DOM).
 * Uses JSONPlaceholder as a stand-in for a real backend.
 */

const API_BASE = "https://jsonplaceholder.typicode.com";

/**
 * @returns {Promise<Array<{ id: number, name: string, email: string, phone: string }>>}
 */
export async function getClientes() {
  const response = await fetch(`${API_BASE}/users`, {
    method: "GET",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`getClientes: HTTP ${response.status}`);
  }

  const users = await response.json();

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? ""
  }));
}
