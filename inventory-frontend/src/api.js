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

export const fetchItems = () =>
  fetch(`${API_BASE}/items`, { headers: authHeaders() }).then(handleResponse);

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

export const fetchMe = () =>
  fetch(`${API_BASE}/me`, {
    headers: authHeaders(),
  }).then(handleResponse);

export const updateProfile = (data) =>
  fetch(`${API_BASE}/me`, {
    method: "PUT",
    headers: { ...jsonHeaders, ...authHeaders() },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const changePassword = (currentPassword, newPassword) =>
  fetch(`${API_BASE}/auth/password`, {
    method: "POST",
    headers: { ...jsonHeaders, ...authHeaders() },
    body: JSON.stringify({ currentPassword, newPassword }),
  }).then(handleResponse);

export const deleteAccount = () =>
  fetch(`${API_BASE}/me`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);

export const createOrder = (items) =>
  fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { ...jsonHeaders, ...authHeaders() },
    body: JSON.stringify({ items }),
  }).then(handleResponse);

export const fetchOrders = () =>
  fetch(`${API_BASE}/orders`, {
    headers: authHeaders(),
  }).then(handleResponse);

export const fetchStores = () =>
  fetch(`${API_BASE}/stores`, { headers: authHeaders() }).then(handleResponse);

export const createStore = (payload) =>
  fetch(`${API_BASE}/stores`, {
    method: "POST",
    headers: { ...jsonHeaders, ...authHeaders() },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const updateStore = (id, payload) =>
  fetch(`${API_BASE}/stores/${id}`, {
    method: "PUT",
    headers: { ...jsonHeaders, ...authHeaders() },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const deleteStore = (id) =>
  fetch(`${API_BASE}/stores/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);

export const fetchDashboard = () =>
  fetch(`${API_BASE}/dashboard`, { headers: authHeaders() }).then(handleResponse);
