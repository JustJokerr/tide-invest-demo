import { buildPortfolioSummary, portfolio } from "../stores/useMarket";
import { getAuthToken, saveUserState } from "./auth";

const CODE_KEY = "tide-competition-code";

export function getSavedCompetitionCode() {
  return localStorage.getItem(CODE_KEY) || "";
}

export function setSavedCompetitionCode(code) {
  if (code) localStorage.setItem(CODE_KEY, code);
  else localStorage.removeItem(CODE_KEY);
}

async function competitionRequest(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
    ...options,
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error || "竞技服务暂时不可用");
  return payload;
}

export async function createCompetition(roomName) {
  await saveUserState(portfolio, buildPortfolioSummary());
  const payload = await competitionRequest("/api/competition/create", {
    method: "POST",
    body: JSON.stringify({
      name: roomName,
    }),
  });
  setSavedCompetitionCode(payload.code);
  return payload;
}

export async function joinCompetition(code) {
  await saveUserState(portfolio, buildPortfolioSummary());
  const payload = await competitionRequest("/api/competition/join", {
    method: "POST",
    body: JSON.stringify({
      code: String(code || "").trim(),
    }),
  });
  setSavedCompetitionCode(payload.code);
  return payload;
}

export async function fetchCompetition(code) {
  return competitionRequest(`/api/competition?code=${encodeURIComponent(code)}`);
}

export async function syncCompetitionSnapshot() {
  const code = getSavedCompetitionCode();
  if (!code) return null;
  await saveUserState(portfolio, buildPortfolioSummary());
  return competitionRequest("/api/competition/update", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}
