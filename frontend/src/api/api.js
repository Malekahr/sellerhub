export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function getUploadUrl(filePath) {
  return `${API_BASE_URL}/uploads/${filePath}`;
}

export function getToken() {
  return localStorage.getItem("access_token");
}

export function saveToken(token) {
  localStorage.setItem("access_token", token);
}

export function removeToken() {
  localStorage.removeItem("access_token");
}

export function isLoggedIn() {
  return Boolean(getToken());
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.detail || "Something went wrong with the request.";

    throw new Error(message);
  }

  return data;
}

export function apiGet(path) {
  return apiRequest(path, {
    method: "GET",
  });
}

export function apiPost(path, body) {
  return apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPatch(path, body) {
  return apiRequest(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function apiDelete(path) {
  return apiRequest(path, {
    method: "DELETE",
  });
}

export function apiUpload(path, formData) {
  return apiRequest(path, {
    method: "POST",
    body: formData,
  });
}