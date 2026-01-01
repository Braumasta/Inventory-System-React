const API_BASE = process.env.REACT_APP_API_URL || "";

const jsonHeaders = { "Content-Type": "application/json" };

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.error || body.errors?.join(", ") || res.statusText;
    throw new Error(message || "Request failed");
  }
  return res.json();
};

export const fetchItems = () => fetch(`${API_BASE}/items`).then(handleResponse);

export const createItem = (payload) =>
  fetch(`${API_BASE}/items`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const updateItem = (id, payload) =>
  fetch(`${API_BASE}/items/${id}`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const deleteItem = (id) =>
  fetch(`${API_BASE}/items/${id}`, {
    method: "DELETE",
  }).then(handleResponse);
