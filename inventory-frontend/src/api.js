const API_BASE = process.env.REACT_APP_API_URL || "";
let authToken = "";

const jsonHeaders = { "Content-Type": "application/json" };

export const getToken = () => authToken;
export const setToken = (token) => {
  authToken = token || "";
};
export const clearToken = () => {
  authToken = "";
};

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

export const fetchItems = (storeId) => {
  const qs = storeId ? `?storeId=${encodeURIComponent(storeId)}` : "";
  return fetch(`${API_BASE}/items${qs}`, { headers: authHeaders() }).then(handleResponse);
};

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

export const verifyPassword = (currentPassword) =>
  fetch(`${API_BASE}/auth/password/verify`, {
    method: "POST",
    headers: { ...jsonHeaders, ...authHeaders() },
    body: JSON.stringify({ currentPassword }),
  }).then(handleResponse);

export const requestPasswordReset = (email) =>
  fetch(`${API_BASE}/auth/reset-request`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email }),
  }).then(handleResponse);

export const resetPassword = (email, newPassword) =>
  fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email, newPassword }),
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
