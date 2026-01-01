const API_BASE = process.env.REACT_APP_API_URL || "";
const TOKEN_KEY = "authToken";

const jsonHeaders = { "Content-Type": "application/json" };

export const getToken = () => localStorage.getItem(TOKEN_KEY) || "";
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
};
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
    headers: { ...jsonHeaders, ...authHeaders() },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const updateItem = (id, payload) =>
  fetch(`${API_BASE}/items/${id}`, {
    method: "PUT",
    headers: { ...jsonHeaders, ...authHeaders() },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const deleteItem = (id) =>
  fetch(`${API_BASE}/items/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);

export const login = (email, password) =>
  fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);

export const register = (data) =>
  fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(data),
  }).then(handleResponse);

export const createOrder = (items) =>
  fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { ...jsonHeaders, ...authHeaders() },
    body: JSON.stringify({ items }),
  }).then(handleResponse);
