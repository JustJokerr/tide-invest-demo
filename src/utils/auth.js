import { reactive } from "vue";

const TOKEN_KEY = "tide-auth-token-v1";

export const authState = reactive({
  ready: false,
  loading: false,
  user: null,
  error: "",
  online: false,
});

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function applyAuth(payload) {
  setToken(payload.token);
  authState.user = payload.user;
  authState.online = true;
  authState.error = "";
  return payload.user;
}

async function request(path, options = {}, requireAuth = false) {
  const token = getAuthToken();
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(requireAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
    ...options,
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error || "账户服务暂时不可用");
  return payload;
}

export async function restoreSession() {
  authState.loading = true;
  try {
    if (!getAuthToken()) {
      authState.user = null;
      authState.online = false;
      return null;
    }
    const payload = await request("/api/auth/me", {}, true);
    authState.user = payload.user;
    authState.online = true;
    return payload.user;
  } catch {
    setToken("");
    authState.user = null;
    authState.online = false;
    return null;
  } finally {
    authState.loading = false;
    authState.ready = true;
  }
}

export async function registerAccount({ username, password, displayName, portfolio, summary }) {
  authState.loading = true;
  authState.error = "";
  try {
    const payload = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, displayName, portfolio, summary }),
    });
    return applyAuth(payload);
  } catch (error) {
    authState.error = error instanceof Error ? error.message : "注册失败";
    throw error;
  } finally {
    authState.loading = false;
  }
}

export async function loginAccount({ username, password }) {
  authState.loading = true;
  authState.error = "";
  try {
    const payload = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    return applyAuth(payload);
  } catch (error) {
    authState.error = error instanceof Error ? error.message : "登录失败";
    throw error;
  } finally {
    authState.loading = false;
  }
}

export async function logoutAccount() {
  try {
    await request("/api/auth/logout", { method: "POST" }, true);
  } catch {
    // Local logout still proceeds if the server is temporarily unavailable.
  }
  setToken("");
  authState.user = null;
  authState.online = false;
}

export async function saveUserState(portfolio, summary) {
  if (!getAuthToken() || !authState.user) return null;
  return request(
    "/api/user/state",
    {
      method: "POST",
      body: JSON.stringify({ portfolio, summary }),
      keepalive: true,
    },
    true,
  );
}
