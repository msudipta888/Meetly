const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") + "/api";

/**
 * Authenticated fetch helper — attaches Clerk token
 */
export const apiFetch = async (path, getToken, options = {}) => {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API Error: ${res.status}`);
  }

  return res.json();
};

// ── Dashboard APIs ──

export const fetchDashboardStats = (getToken) =>
  apiFetch("/dashboard/stats", getToken);

export const fetchDashboardChart = (getToken, days = 30) =>
  apiFetch(`/dashboard/chart?days=${days}`, getToken);

export const fetchCallHistory = (getToken, limit = 20) =>
  apiFetch(`/dashboard/history?limit=${limit}`, getToken);

// ── Chat APIs ──

export const fetchRoomMessages = (getToken, roomUuid, cursor, limit = 50) => {
  let path = `/rooms/${roomUuid}/messages?limit=${limit}`;
  if (cursor) path += `&cursor=${cursor}`;
  return apiFetch(path, getToken);
};

// ── Contact APIs ──

export const fetchContacts = (getToken) =>
  apiFetch("/contacts", getToken);

export const fetchPendingRequests = (getToken) =>
  apiFetch("/contacts/pending", getToken);

export const sendContactRequest = (getToken, receiverEmail) =>
  apiFetch("/contacts/request", getToken, {
    method: "POST",
    body: JSON.stringify({ receiverEmail }),
  });

export const acceptContact = (getToken, contactId) =>
  apiFetch(`/contacts/${contactId}/accept`, getToken, { method: "PATCH" });

export const blockContact = (getToken, contactId) =>
  apiFetch(`/contacts/${contactId}/block`, getToken, { method: "PATCH" });
