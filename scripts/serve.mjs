import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const port = Number(process.env.PORT || 5173);
const quoteCache = new Map();
const competitionFile = path.join(root, ".data", "competitions.json");
const competitions = new Map();
let competitionsLoaded = false;
let competitionsLoadPromise = null;
const accountFile = path.join(root, ".data", "accounts.json");
const users = new Map();
const sessions = new Map();
let accountsLoaded = false;
let accountsLoadPromise = null;
let accountWriteQueue = Promise.resolve();
let competitionWriteQueue = Promise.resolve();
const EASTMONEY_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Referer: "https://quote.eastmoney.com/",
  Accept: "application/json,text/plain,*/*",
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function jsonResponse(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 100000) throw new Error("请求内容过大");
  }
  return body ? JSON.parse(body) : {};
}

async function loadAccounts() {
  if (accountsLoaded) return;
  if (!accountsLoadPromise) {
    accountsLoadPromise = (async () => {
      try {
        const saved = JSON.parse(await readFile(accountFile, "utf8"));
        (saved.users || []).forEach((user) => users.set(user.id, user));
        Object.entries(saved.sessions || {}).forEach(([token, session]) => {
          if (Number(session.expiresAt) > Date.now()) sessions.set(token, session);
        });
      } catch {
        // A missing account file starts a fresh server state.
      } finally {
        accountsLoaded = true;
      }
    })();
  }
  await accountsLoadPromise;
}

async function saveAccounts() {
  const body = JSON.stringify(
    {
      users: [...users.values()],
      sessions: Object.fromEntries(sessions),
    },
    null,
    2,
  );
  accountWriteQueue = accountWriteQueue.catch(() => {}).then(async () => {
    await mkdir(path.dirname(accountFile), { recursive: true });
    await writeFile(accountFile, body, "utf8");
  });
  await accountWriteQueue;
}

function passwordHash(password, salt) {
  return scryptSync(password, salt, 64).toString("hex");
}

function safeUser(user) {
  if (!user) return null;
  const { passwordHash: _passwordHash, passwordSalt: _passwordSalt, ...safe } = user;
  return safe;
}

function getSessionUser(request) {
  const token = (request.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const session = sessions.get(token);
  if (!session || Number(session.expiresAt) <= Date.now()) return null;
  return users.get(session.userId) || null;
}

function requireSessionUser(request) {
  const user = getSessionUser(request);
  if (!user) {
    const error = new Error("请先登录账号");
    error.statusCode = 401;
    throw error;
  }
  return user;
}

function createSession(user) {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, {
    userId: user.id,
    expiresAt: Date.now() + 30 * 24 * 3600000,
  });
  return token;
}

function accountSummaryFrom(snapshot) {
  const number = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
  return {
    totalAssets: number(snapshot?.totalAssets),
    marketValue: number(snapshot?.marketValue),
    cash: number(snapshot?.cash),
    dailyProfit: number(snapshot?.dailyProfit),
    dailyPercent: number(snapshot?.dailyPercent),
    totalProfit: number(snapshot?.totalProfit),
    totalProfitPercent: number(snapshot?.totalProfitPercent),
    positionPercent: number(snapshot?.positionPercent),
    holdingCount: Math.max(0, Math.round(number(snapshot?.holdingCount))),
    positions: Array.isArray(snapshot?.positions)
      ? snapshot.positions.slice(0, 20).map((item) => ({
          code: String(item.code || "").slice(0, 12),
          name: String(item.name || "").slice(0, 20),
          shares: number(item.shares),
          availableShares: number(item.availableShares),
          avgCost: number(item.avgCost),
          price: number(item.price),
          marketValue: number(item.marketValue),
          profit: number(item.profit),
          profitPercent: number(item.profitPercent),
          changePercent: number(item.changePercent),
        }))
      : [],
  };
}

function participantFromUser(user) {
  const totalAssets = Number(user.portfolioSummary?.totalAssets) || 0;
  return {
    id: user.id,
    name: user.displayName || user.username,
    totalAssets,
    positions: Array.isArray(user.portfolioSummary?.positions)
      ? user.portfolioSummary.positions.slice(0, 20)
      : [],
    cash: Number(user.portfolioSummary?.cash) || 0,
    dailyProfit: Number(user.portfolioSummary?.dailyProfit) || 0,
    dailyPercent: Number(user.portfolioSummary?.dailyPercent) || 0,
    totalProfit: Number(user.portfolioSummary?.totalProfit) || 0,
    totalProfitPercent: Number(user.portfolioSummary?.totalProfitPercent) || 0,
    positionPercent: Number(user.portfolioSummary?.positionPercent) || 0,
    holdingCount: Number(user.portfolioSummary?.holdingCount) || 0,
    updatedAt: Date.now(),
  };
}

async function handleRegister(request, response) {
  await loadAccounts();
  const body = await readJsonBody(request);
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const displayName = String(body.displayName || username).trim().slice(0, 20);
  if (!/^[\p{L}\p{N}_]{3,24}$/u.test(username)) {
    jsonResponse(response, 400, { ok: false, error: "用户名需为 3-24 位字母、数字、中文或下划线" });
    return;
  }
  if (password.length < 6) {
    jsonResponse(response, 400, { ok: false, error: "密码至少需要 6 位" });
    return;
  }
  if ([...users.values()].some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    jsonResponse(response, 409, { ok: false, error: "该用户名已存在" });
    return;
  }
  const salt = randomBytes(16).toString("hex");
  const user = {
    id: `user-${randomBytes(10).toString("hex")}`,
    username,
    displayName: displayName || username,
    passwordSalt: salt,
    passwordHash: passwordHash(password, salt),
    portfolio: body.portfolio && typeof body.portfolio === "object" ? body.portfolio : {},
    portfolioSummary: accountSummaryFrom(body.summary),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  users.set(user.id, user);
  const token = createSession(user);
  await saveAccounts();
  jsonResponse(response, 201, { ok: true, token, user: safeUser(user) });
}

async function handleLogin(request, response) {
  await loadAccounts();
  const body = await readJsonBody(request);
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");
  const user = [...users.values()].find((item) => item.username.toLowerCase() === username);
  if (!user) {
    jsonResponse(response, 401, { ok: false, error: "用户名或密码错误" });
    return;
  }
  const expected = Buffer.from(user.passwordHash, "hex");
  const actual = Buffer.from(passwordHash(password, user.passwordSalt), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    jsonResponse(response, 401, { ok: false, error: "用户名或密码错误" });
    return;
  }
  const token = createSession(user);
  await saveAccounts();
  jsonResponse(response, 200, { ok: true, token, user: safeUser(user) });
}

async function handleUserState(request, response) {
  await loadAccounts();
  await loadCompetitions();
  const user = requireSessionUser(request);
  const body = await readJsonBody(request);
  user.portfolio = body.portfolio && typeof body.portfolio === "object" ? body.portfolio : user.portfolio;
  user.portfolioSummary = accountSummaryFrom(body.summary);
  user.updatedAt = Date.now();
  let competitionChanged = false;
  competitions.forEach((room) => {
    const participant = room.participants.find((item) => item.userId === user.id || item.id === user.id);
    if (!participant) return;
    participant.id = user.id;
    participant.userId = user.id;
    participant.name = user.displayName || user.username;
    participant.totalAssets = user.portfolioSummary.totalAssets;
    participant.positions = user.portfolioSummary.positions;
    participant.cash = user.portfolioSummary.cash;
    participant.dailyProfit = user.portfolioSummary.dailyProfit;
    participant.dailyPercent = user.portfolioSummary.dailyPercent;
    participant.totalProfit = user.portfolioSummary.totalProfit;
    participant.totalProfitPercent = user.portfolioSummary.totalProfitPercent;
    participant.positionPercent = user.portfolioSummary.positionPercent;
    participant.holdingCount = user.portfolioSummary.holdingCount;
    participant.updatedAt = Date.now();
    room.updatedAt = Date.now();
    competitionChanged = true;
  });
  await saveAccounts();
  if (competitionChanged) await saveCompetitions();
  jsonResponse(response, 200, { ok: true, updatedAt: user.updatedAt });
}

async function loadCompetitions() {
  if (competitionsLoaded) return;
  if (!competitionsLoadPromise) {
    competitionsLoadPromise = (async () => {
      try {
        const saved = JSON.parse(await readFile(competitionFile, "utf8"));
        Object.entries(saved).forEach(([code, room]) => {
          if (Date.now() - Number(room.createdAt || 0) < 48 * 3600000) competitions.set(code, room);
        });
      } catch {
        // First use or a missing runtime file simply starts with no rooms.
      } finally {
        competitionsLoaded = true;
      }
    })();
  }
  await competitionsLoadPromise;
}

async function saveCompetitions() {
  const body = JSON.stringify(Object.fromEntries(competitions), null, 2);
  competitionWriteQueue = competitionWriteQueue.catch(() => {}).then(async () => {
    await mkdir(path.dirname(competitionFile), { recursive: true });
    await writeFile(competitionFile, body, "utf8");
  });
  await competitionWriteQueue;
}

function publicCompetition(room) {
  const ranked = room.participants
    .map((participant) => ({
      ...participant,
      returnPercent: participant.startingAssets
        ? ((participant.totalAssets - participant.startingAssets) / participant.startingAssets) * 100
        : 0,
      maxHoldingPercent: Number(participant.totalAssets)
        ? Math.max(
            0,
            ...(participant.positions || []).map(
              (position) => (Number(position.marketValue) / Number(participant.totalAssets)) * 100,
            ),
          )
        : 0,
    }))
    .sort((a, b) => b.returnPercent - a.returnPercent);
  const leaderReturn = ranked[0]?.returnPercent || 0;
  const averageReturn = ranked.length
    ? ranked.reduce((sum, participant) => sum + participant.returnPercent, 0) / ranked.length
    : 0;
  const participants = ranked.map((participant, index) => ({
    ...participant,
    rank: index + 1,
    gapToLeader: participant.returnPercent - leaderReturn,
  }));
  return {
    ok: true,
    code: room.code,
    name: room.name,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    stats: {
      participantCount: participants.length,
      leaderReturn,
      averageReturn,
    },
    participants,
  };
}

async function handleCompetition(request, response, action) {
  await loadAccounts();
  await loadCompetitions();
  const user = requireSessionUser(request);
  if (request.method === "GET" && action === "get") {
    const code = new URL(request.url, "http://localhost").searchParams.get("code") || "";
    const room = competitions.get(code);
    if (!room) {
      jsonResponse(response, 404, { ok: false, error: "竞技口令不存在或已过期" });
      return;
    }
    jsonResponse(response, 200, publicCompetition(room));
    return;
  }

  const body = await readJsonBody(request);
  if (request.method !== "POST") {
    jsonResponse(response, 405, { ok: false, error: "请求方法不支持" });
    return;
  }

  if (action === "create") {
    let code;
    do {
      code = String(Math.floor(100000 + Math.random() * 900000));
    } while (competitions.has(code));
    const participant = participantFromUser(user);
    participant.userId = user.id;
    participant.startingAssets = participant.totalAssets;
    participant.joinedAt = Date.now();
    const room = {
      code,
      name: String(body.name || "观潮好友竞技").trim().slice(0, 24),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      participants: [participant],
    };
    competitions.set(code, room);
    await saveCompetitions();
    jsonResponse(response, 201, publicCompetition(room));
    return;
  }

  const code = String(body.code || "").trim();
  const room = competitions.get(code);
  if (!room) {
    jsonResponse(response, 404, { ok: false, error: "竞技口令不存在或已过期" });
    return;
  }
  const incoming = participantFromUser(user);
  incoming.userId = user.id;
  const index = room.participants.findIndex(
    (participant) => participant.userId === user.id || participant.id === user.id,
  );
  if (index >= 0) {
    room.participants[index] = {
      ...room.participants[index],
      ...incoming,
      startingAssets: room.participants[index].startingAssets,
      joinedAt: room.participants[index].joinedAt,
    };
  } else {
    incoming.startingAssets = incoming.totalAssets;
    incoming.joinedAt = Date.now();
    room.participants.push(incoming);
  }
  room.updatedAt = Date.now();
  await saveCompetitions();
  jsonResponse(response, 200, publicCompetition(room));
}

async function fetchJson(url, cacheKey, ttl = 2000, maxStale = 120000) {
  const cached = quoteCache.get(cacheKey);
  if (cached && Date.now() - cached.time < ttl) return cached.payload;

  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          ...EASTMONEY_HEADERS,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        signal: AbortSignal.timeout(6000),
      });
      if (!response.ok) throw new Error(`Upstream HTTP ${response.status}`);
      const text = await response.text();
      if (!text.trim()) throw new Error("Upstream returned an empty response");
      const payload = JSON.parse(text);
      if (quoteCache.size > 220) {
        quoteCache.delete(quoteCache.keys().next().value);
      }
      quoteCache.set(cacheKey, { time: Date.now(), payload });
      return payload;
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
      }
    }
  }

  if (cached && Date.now() - cached.time <= maxStale) {
    return {
      ...cached.payload,
      __stale: true,
      __cachedAt: cached.time,
    };
  }
  throw lastError;
}

function normalizeQuote(item) {
  return {
    code: String(item.f12 || ""),
    name: String(item.f14 || "").replace(/\s+/g, ""),
    price: Number(item.f2),
    changePercent: Number(item.f3),
    change: Number(item.f4),
    volume: Number(item.f5),
    amount: Number(item.f6),
    turnover: Number(item.f8),
    pe: Number(item.f9),
    volumeRatio: Number(item.f10),
    high: Number(item.f15),
    low: Number(item.f16),
    open: Number(item.f17),
    prevClose: Number(item.f18),
    marketCap: Number(item.f20),
    floatMarketCap: Number(item.f21),
    pb: Number(item.f23),
    mainNet: Number(item.f62) || 0,
    industry: item.f127 || "",
    region: item.f128 || "",
    timestamp: Number(item.f124) ? Number(item.f124) * 1000 : null,
  };
}

function tencentSymbol(secid) {
  const [market, code] = secid.split(".");
  if (market === "1") return `sh${code}`;
  if (/^(4|8|9)/.test(code)) return `bj${code}`;
  return `sz${code}`;
}

function parseTencentTimestamp(value) {
  if (!/^\d{14}$/.test(value || "")) return null;
  const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}+08:00`;
  const timestamp = Date.parse(iso);
  return Number.isFinite(timestamp) ? timestamp : null;
}

async function fetchTencentQuotes(secids) {
  const symbols = secids.map(tencentSymbol).join(",");
  const response = await fetch(`https://qt.gtimg.cn/q=${symbols}`, {
    headers: {
      ...EASTMONEY_HEADERS,
      Referer: "https://gu.qq.com/",
    },
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`Tencent HTTP ${response.status}`);
  const text = new TextDecoder("gbk").decode(await response.arrayBuffer());
  const quotes = [];
  for (const statement of text.split(";")) {
    const body = statement.match(/="([^"]+)"/)?.[1];
    if (!body) continue;
    const fields = body.split("~");
    if (fields.length < 46) continue;
    quotes.push({
      code: fields[2],
      name: fields[1].replace(/\s+/g, ""),
      price: Number(fields[3]),
      prevClose: Number(fields[4]),
      open: Number(fields[5]),
      volume: Number(fields[6]),
      change: Number(fields[31]),
      changePercent: Number(fields[32]),
      high: Number(fields[33]),
      low: Number(fields[34]),
      amount: Number(fields[37]) * 10000,
      turnover: Number(fields[38]),
      pe: Number(fields[39]),
      floatMarketCap: Number(fields[44]) * 100000000,
      marketCap: Number(fields[45]) * 100000000,
      pb: Number(fields[46]) || 0,
      timestamp: parseTencentTimestamp(fields[30]),
    });
  }
  if (!quotes.length) throw new Error("备用行情源没有返回数据");
  return quotes;
}

async function handleQuotes(url, response) {
  const rawSecids = url.searchParams.get("secids") || "";
  const secids = [...new Set(rawSecids.split(",").filter(Boolean))];
  if (!secids.length || secids.length > 30 || secids.some((id) => !/^[01]\.\d{6}$/.test(id))) {
    jsonResponse(response, 400, { ok: false, error: "参数 secids 无效" });
    return;
  }

  const endpoint = new URL("https://push2.eastmoney.com/api/qt/ulist.np/get");
  endpoint.searchParams.set("fltt", "2");
  endpoint.searchParams.set("secids", secids.join(","));
  endpoint.searchParams.set("fields", "f2,f3,f4,f5,f6,f8,f9,f10,f12,f14,f15,f16,f17,f18,f20,f21,f23,f62,f124,f127,f128");
  let stalePayload = null;
  const eastmoneyTask = fetchJson(endpoint, `quotes:${secids.join(",")}`, 2200, 120000).then((payload) => {
    const items = payload?.data?.diff;
    if (!Array.isArray(items)) throw new Error("行情接口没有返回数据");
    if (payload.__stale) {
      stalePayload = payload;
      throw new Error("主行情源返回了过期缓存");
    }
    return { source: "东方财富公开行情接口", quotes: items.map(normalizeQuote) };
  });
  const tencentTask = fetchTencentQuotes(secids).then((quotes) => ({
    source: "腾讯公开行情接口（自动备用）",
    quotes,
  }));

  try {
    const result = await Promise.any([eastmoneyTask, tencentTask]);
    jsonResponse(response, 200, {
      ok: true,
      source: result.source,
      serverTime: Date.now(),
      stale: false,
      fallback: result.source.includes("腾讯"),
      quotes: result.quotes,
    });
  } catch {
    if (stalePayload?.data?.diff?.length) {
      jsonResponse(response, 200, {
        ok: true,
        source: "最近缓存行情",
        serverTime: Date.now(),
        stale: true,
        cachedAt: stalePayload.__cachedAt || null,
        quotes: stalePayload.data.diff.map(normalizeQuote),
      });
      return;
    }
    throw new Error("主行情源和备用行情源均暂时不可用");
  }
}

async function handleSearch(url, response) {
  const query = (url.searchParams.get("q") || "").trim();
  if (!query) {
    jsonResponse(response, 200, { ok: true, results: [] });
    return;
  }
  const endpoint = new URL("https://searchapi.eastmoney.com/api/suggest/get");
  endpoint.searchParams.set("input", query);
  endpoint.searchParams.set("type", "14");
  endpoint.searchParams.set("token", "D43BF722C8E33BDC906FB84D85E326E8");
  endpoint.searchParams.set("count", "15");
  const payload = await fetchJson(endpoint, `search:${query}`, 30000);
  const items = payload?.QuotationCodeTable?.Data || [];
  const results = items
    .filter((item) => {
      const isAStockClass = ["AStock", "23"].includes(item.Classify);
      const isAShareType = /^(沪A|深A|京A|科创板)$/.test(item.SecurityTypeName || "");
      return (isAStockClass || isAShareType) && /^[01]\.\d{6}$/.test(item.QuoteID || "");
    })
    .map((item) => ({
      code: item.Code,
      name: String(item.Name).replace(/\s+/g, ""),
      shortName: String(item.Name).replace(/\s+/g, ""),
      secid: item.QuoteID,
      market: item.QuoteID.startsWith("1.") ? "SH" : "SZ",
      sector: item.SecurityTypeName,
      type: item.SecurityTypeName,
    }));

  const quoteEndpoint = new URL("https://push2.eastmoney.com/api/qt/ulist.np/get");
  quoteEndpoint.searchParams.set("fltt", "2");
  quoteEndpoint.searchParams.set("secids", results.map((item) => item.secid).join(","));
  quoteEndpoint.searchParams.set("fields", "f2,f3,f4,f5,f6,f8,f9,f10,f12,f14,f15,f16,f17,f18,f20,f21,f23,f62,f124,f127,f128");
  let quotePayload = null;
  if (results.length) {
    let staleQuotePayload = null;
    try {
      const eastmoneyQuotes = fetchJson(
        quoteEndpoint,
        `search-quotes:${results.map((item) => item.secid).join(",")}`,
        2200,
      ).then((payload) => {
        if (payload.__stale) {
          staleQuotePayload = payload;
          throw new Error("主行情源返回了过期缓存");
        }
        return payload;
      });
      const fallbackQuotes = fetchTencentQuotes(results.map((item) => item.secid)).then((items) => ({
        data: { diff: items },
        fallback: true,
      }));
      quotePayload = await Promise.any([eastmoneyQuotes, fallbackQuotes]);
    } catch {
      quotePayload = staleQuotePayload;
    }
  }
  const quoteMap = new Map(
    (quotePayload?.data?.diff || []).map((item) => [
      String(item.f12 || item.code),
      quotePayload?.fallback ? item : normalizeQuote(item),
    ]),
  );
  const mappedResults = results.map((item) => ({ ...(quoteMap.get(item.code) || {}), ...item }));
  const enrichedResults = quotePayload?.data?.diff?.length
    ? mappedResults.filter((item) => Number(item.price) > 0)
    : mappedResults;
  jsonResponse(response, 200, {
    ok: true,
    stale: Boolean(payload.__stale),
    results: enrichedResults,
  });
}

async function fetchTencentChart(secid, mode, limit) {
  const symbol = tencentSymbol(secid);
  if (mode === "trend") {
    const response = await fetch(`https://web.ifzq.gtimg.cn/appstock/app/minute/query?code=${symbol}`, {
      headers: { ...EASTMONEY_HEADERS, Referer: "https://gu.qq.com/" },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error(`Tencent chart HTTP ${response.status}`);
    const payload = await response.json();
    const node = payload?.data?.[symbol];
    const lines = node?.data?.data;
    const quote = node?.qt?.[symbol];
    if (!Array.isArray(lines) || !lines.length) throw new Error("备用分时数据不可用");
    const points = lines.map((line) => {
      const [rawTime, price, cumulativeVolume, cumulativeAmount] = line.split(" ");
      const volume = Number(cumulativeVolume);
      const amount = Number(cumulativeAmount);
      return {
        time: `${rawTime.slice(0, 2)}:${rawTime.slice(2)}`,
        open: Number(price),
        price: Number(price),
        high: Number(price),
        low: Number(price),
        volume,
        amount,
        average: volume ? amount / (volume * 100) : Number(price),
      };
    });
    return {
      ok: true,
      mode,
      stale: false,
      fallback: true,
      source: "腾讯公开行情接口（自动备用）",
      preClose: Number(quote?.[4]) || points[0]?.price || 0,
      name: quote?.[1] || "",
      points,
    };
  }

  const response = await fetch(
    `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${symbol},day,,,${limit},qfq`,
    {
      headers: { ...EASTMONEY_HEADERS, Referer: "https://gu.qq.com/" },
      signal: AbortSignal.timeout(6000),
    },
  );
  if (!response.ok) throw new Error(`Tencent chart HTTP ${response.status}`);
  const payload = await response.json();
  const node = payload?.data?.[symbol];
  const rows = node?.qfqday || node?.day;
  if (!Array.isArray(rows) || !rows.length) throw new Error("备用 K 线数据不可用");
  const points = rows.map((row, index) => {
    const [date, open, close, high, low, volume] = row;
    const previousClose = index > 0 ? Number(rows[index - 1][2]) : Number(open);
    const change = Number(close) - previousClose;
    return {
      date,
      open: Number(open),
      close: Number(close),
      high: Number(high),
      low: Number(low),
      volume: Number(volume),
      amount: 0,
      amplitude: previousClose ? ((Number(high) - Number(low)) / previousClose) * 100 : 0,
      changePercent: previousClose ? (change / previousClose) * 100 : 0,
      change,
      turnover: 0,
    };
  });
  return {
    ok: true,
    mode,
    stale: false,
    fallback: true,
    source: "腾讯公开行情接口（自动备用）",
    name: node?.qt?.[symbol]?.[1] || "",
    points,
  };
}

async function handleChart(url, response) {
  const secid = url.searchParams.get("secid") || "";
  const mode = url.searchParams.get("mode") === "kline" ? "kline" : "trend";
  const limit = Math.min(260, Math.max(20, Number(url.searchParams.get("limit")) || 60));
  if (!/^[01]\.\d{6}$/.test(secid)) {
    jsonResponse(response, 400, { ok: false, error: "参数 secid 无效" });
    return;
  }

  if (mode === "trend") {
    try {
      const endpoint = new URL("https://push2his.eastmoney.com/api/qt/stock/trends2/get");
      endpoint.searchParams.set("secid", secid);
      endpoint.searchParams.set("fields1", "f1,f2,f3,f4,f5,f6,f7,f8");
      endpoint.searchParams.set("fields2", "f51,f52,f53,f54,f55,f56,f57,f58");
      endpoint.searchParams.set("iscr", "0");
      endpoint.searchParams.set("ndays", "1");
      const payload = await fetchJson(endpoint, `chart:trend:${secid}`, 4000, 180000);
      const data = payload?.data;
      if (!data?.trends?.length) throw new Error("分时数据暂不可用");
      const points = data.trends.map((line) => {
        const [time, open, close, high, low, volume, amount, average] = line.split(",");
        return {
          time: time.slice(11),
          open: Number(open),
          price: Number(close),
          high: Number(high),
          low: Number(low),
          volume: Number(volume),
          amount: Number(amount),
          average: Number(average),
        };
      });
      jsonResponse(response, 200, {
        ok: true,
        mode,
        stale: Boolean(payload.__stale),
        preClose: Number(data.preClose),
        name: data.name,
        points,
      });
    } catch {
      jsonResponse(response, 200, await fetchTencentChart(secid, mode, limit));
    }
    return;
  }

  try {
    const endpoint = new URL("https://push2his.eastmoney.com/api/qt/stock/kline/get");
    endpoint.searchParams.set("secid", secid);
    endpoint.searchParams.set("klt", "101");
    endpoint.searchParams.set("fqt", "1");
    endpoint.searchParams.set("lmt", String(limit));
    endpoint.searchParams.set("end", "20500101");
    endpoint.searchParams.set("fields1", "f1,f2,f3,f4,f5,f6");
    endpoint.searchParams.set("fields2", "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61");
    const payload = await fetchJson(endpoint, `chart:kline:${secid}:${limit}`, 30000, 600000);
    const data = payload?.data;
    if (!data?.klines?.length) throw new Error("K 线数据暂不可用");
    const points = data.klines.map((line) => {
      const [date, open, close, high, low, volume, amount, amplitude, changePercent, change, turnover] = line.split(",");
      return {
        date,
        open: Number(open),
        close: Number(close),
        high: Number(high),
        low: Number(low),
        volume: Number(volume),
        amount: Number(amount),
        amplitude: Number(amplitude),
        changePercent: Number(changePercent),
        change: Number(change),
        turnover: Number(turnover),
      };
    });
    jsonResponse(response, 200, {
      ok: true,
      mode,
      stale: Boolean(payload.__stale),
      name: data.name,
      points,
    });
  } catch {
    jsonResponse(response, 200, await fetchTencentChart(secid, mode, limit));
  }
}

const analysisCache = new Map();

function average(values) {
  const usable = values.map(Number).filter(Number.isFinite);
  return usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : null;
}

function standardDeviation(values) {
  if (values.length < 2) return null;
  const mean = average(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function normalizeScore(value) {
  return value === null || !Number.isFinite(value) ? null : Math.round(clamp(value));
}

function calcRsi(closes, period = 14) {
  if (closes.length <= period) return null;
  let gains = 0;
  let losses = 0;
  for (let index = closes.length - period; index < closes.length; index += 1) {
    const delta = closes[index] - closes[index - 1];
    if (delta >= 0) gains += delta;
    else losses += Math.abs(delta);
  }
  if (!losses) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function calcEma(values, period) {
  if (!values.length) return [];
  const multiplier = 2 / (period + 1);
  const result = [values[0]];
  for (let index = 1; index < values.length; index += 1) {
    result.push(values[index] * multiplier + result[index - 1] * (1 - multiplier));
  }
  return result;
}

function metric(value, suffix = "", digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return { value: null, display: "暂无", suffix };
  }
  return {
    value: Number(Number(value).toFixed(digits)),
    display: `${Number(value).toFixed(digits)}${suffix}`,
    suffix,
  };
}

function financeMetric(label, raw, suffix = "", digits = 2) {
  return { label, ...metric(raw, suffix, digits) };
}

function parseFinancialData(row) {
  if (!row) return null;
  const growthItems = [
    financeMetric("营收同比", row.TOTALOPERATEREVETZ, "%"),
    financeMetric("归母净利同比", row.PARENTNETPROFITTZ, "%"),
    financeMetric("基本每股收益同比", row.EPSJBTZ, "%"),
  ];
  const profitItems = [
    financeMetric("加权 ROE", row.ROEJQ, "%"),
    financeMetric("销售毛利率", row.XSMLL, "%"),
    financeMetric("销售净利率", row.XSJLL, "%"),
  ];
  const operationItems = [
    financeMetric("总资产周转率", row.TOAZZL, "次"),
    financeMetric("存货周转率", row.CHZZL, "次"),
    financeMetric("应收账款周转天数", row.YSZKZZTS, "天", 1),
  ];
  const qualityItems = [
    financeMetric("经营现金流/净利润", row.NCO_NETPROFIT, "倍"),
    financeMetric("每股经营现金流", row.MGJYXJJE, "元"),
    financeMetric("销售现金比率", row.JYXJLYYSR, "", 3),
  ];
  const riskItems = [
    financeMetric("资产负债率", row.ZCFZL, "%"),
    financeMetric("流动比率", row.LD, "", 2),
    financeMetric("速动比率", row.SD, "", 2),
    financeMetric("利息保障倍数", row.INTSTCOVRATE, "倍", 1),
  ];

  const valueOf = (item) => (Number.isFinite(Number(item.value)) ? Number(item.value) : null);
  const growth = normalizeScore(
    50 + (valueOf(growthItems[0]) || 0) * 1.4 + (valueOf(growthItems[1]) || 0) * 1.1,
  );
  const profitability = normalizeScore(
    40 + (valueOf(profitItems[0]) || 0) * 1.8 + (valueOf(profitItems[1]) || 0) * 0.35 + (valueOf(profitItems[2]) || 0) * 0.7,
  );
  const operation = normalizeScore(
    45 + (valueOf(operationItems[0]) || 0) * 35 + (valueOf(operationItems[1]) || 0) * 4,
  );
  const earningsQuality = normalizeScore(
    50 + ((valueOf(qualityItems[0]) || 1) - 1) * 35 + (valueOf(qualityItems[1]) || 0) * 1.2,
  );
  const financialRisk = normalizeScore(
    78 - Math.max(0, (valueOf(riskItems[0]) || 35) - 35) * 0.75 +
      Math.max(0, (valueOf(riskItems[1]) || 1.5) - 1) * 8,
  );
  const scores = [growth, profitability, operation, earningsQuality, financialRisk].filter((score) => score !== null);

  return {
    available: true,
    report: row.REPORT_DATE_NAME || String(row.REPORT_DATE || "").slice(0, 10),
    noticeDate: String(row.NOTICE_DATE || "").slice(0, 10),
    overallScore: Math.round(average(scores) || 0),
    groups: [
      { id: "growth", title: "业绩成长", icon: "trend", score: growth, items: growthItems },
      { id: "profitability", title: "盈利能力", icon: "chart", score: profitability, items: profitItems },
      { id: "operation", title: "运营能力", icon: "refresh", score: operation, items: operationItems },
      { id: "quality", title: "收益质量", icon: "shield", score: earningsQuality, items: qualityItems },
      { id: "risk", title: "财务风险", icon: "info", score: financialRisk, items: riskItems },
    ],
  };
}

async function resolveSectorBoard(industry, code) {
  if (!industry) return null;
  try {
    const search = new URL("https://searchapi.eastmoney.com/api/suggest/get");
    search.searchParams.set("input", industry.replace(/Ⅱ|Ⅲ|Ⅱ$/g, ""));
    search.searchParams.set("type", "14");
    search.searchParams.set("token", "D43BF722C8E33BDC906FB84D85E326E8");
    search.searchParams.set("count", "10");
    const searchPayload = await fetchJson(search, `sector-search:${industry}`, 60000);
    const boards = (searchPayload?.QuotationCodeTable?.Data || []).filter((item) => item.Classify === "BK");
    const board =
      boards.find((item) => item.Name === industry) ||
      boards.find((item) => item.Name.includes(industry.replace(/Ⅱ|Ⅲ/g, ""))) ||
      boards[0];
    if (!board) return null;
    const kline = new URL("https://push2his.eastmoney.com/api/qt/stock/kline/get");
    kline.searchParams.set("secid", board.QuoteID);
    kline.searchParams.set("klt", "101");
    kline.searchParams.set("fqt", "1");
    kline.searchParams.set("lmt", "2");
    kline.searchParams.set("end", "20500101");
    kline.searchParams.set("fields1", "f1,f2,f3,f4,f5,f6");
    kline.searchParams.set("fields2", "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61");
    const boardPayload = await fetchJson(kline, `sector-kline:${board.QuoteID}`, 60000);
    const latest = boardPayload?.data?.klines?.at(-1)?.split(",");
    if (!latest) return null;
    return {
      code: board.Code,
      name: board.Name,
      changePercent: Number(latest[8]),
      close: Number(latest[2]),
    };
  } catch {
    return { code: null, name: industry, changePercent: null, close: null };
  }
}

async function handleStockAnalysis(url, response) {
  const secid = url.searchParams.get("secid") || "";
  if (!/^[01]\.\d{6}$/.test(secid)) {
    jsonResponse(response, 400, { ok: false, error: "参数 secid 无效" });
    return;
  }
  const cached = analysisCache.get(secid);
  if (cached && Date.now() - cached.time < 30000) {
    jsonResponse(response, 200, { ...cached.payload, cached: true });
    return;
  }

  const [market, code] = secid.split(".");
  const suffix = market === "1" ? "SH" : /^(4|8|9)/.test(code) ? "BJ" : "SZ";
  const secuCode = `${code}.${suffix}`;

  const quoteUrl = new URL("https://push2.eastmoney.com/api/qt/stock/get");
  quoteUrl.searchParams.set("secid", secid);
  quoteUrl.searchParams.set("fields", "f43,f57,f58,f60,f62,f116,f117,f127,f128,f162,f167,f168,f170,f184");

  const klineUrl = new URL("https://push2his.eastmoney.com/api/qt/stock/kline/get");
  klineUrl.searchParams.set("secid", secid);
  klineUrl.searchParams.set("klt", "101");
  klineUrl.searchParams.set("fqt", "1");
  klineUrl.searchParams.set("lmt", "120");
  klineUrl.searchParams.set("end", "20500101");
  klineUrl.searchParams.set("fields1", "f1,f2,f3,f4,f5,f6");
  klineUrl.searchParams.set("fields2", "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61");

  const financeUrl = new URL("https://datacenter.eastmoney.com/securities/api/data/v1/get");
  financeUrl.searchParams.set("reportName", "RPT_F10_FINANCE_MAINFINADATA");
  financeUrl.searchParams.set("columns", "ALL");
  financeUrl.searchParams.set("filter", `(SECUCODE="${secuCode}")`);
  financeUrl.searchParams.set("pageNumber", "1");
  financeUrl.searchParams.set("pageSize", "2");
  financeUrl.searchParams.set("sortTypes", "-1");
  financeUrl.searchParams.set("sortColumns", "REPORT_DATE");
  financeUrl.searchParams.set("source", "HSF10");
  financeUrl.searchParams.set("client", "PC");

  const flowUrl = new URL("https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get");
  flowUrl.searchParams.set("lmt", "10");
  flowUrl.searchParams.set("klt", "101");
  flowUrl.searchParams.set("secid", secid);
  flowUrl.searchParams.set("fields1", "f1,f2,f3,f7");
  flowUrl.searchParams.set("fields2", "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65");

  const orgUrl = new URL("https://datacenter.eastmoney.com/securities/api/data/v1/get");
  orgUrl.searchParams.set("reportName", "RPT_F10_BASIC_ORGINFO");
  orgUrl.searchParams.set("columns", "SECUCODE,SECURITY_NAME_ABBR,EM2016,INDUSTRYCSRC1,ORG_PROFILE");
  orgUrl.searchParams.set("filter", `(SECUCODE="${secuCode}")`);
  orgUrl.searchParams.set("pageNumber", "1");
  orgUrl.searchParams.set("pageSize", "1");
  orgUrl.searchParams.set("source", "HSF10");
  orgUrl.searchParams.set("client", "PC");

  const [quoteResult, klineResult, financeResult, flowResult, orgResult] = await Promise.allSettled([
    fetchJson(quoteUrl, `analysis-quote:${secid}`, 4000, 300000),
    fetchJson(klineUrl, `analysis-kline:${secid}`, 30000, 600000),
    fetchJson(financeUrl, `analysis-finance:${secuCode}`, 300000, 86400000),
    fetchJson(flowUrl, `analysis-flow:${secid}`, 30000, 600000),
    fetchJson(orgUrl, `analysis-org:${secuCode}`, 300000, 86400000),
  ]);

  const quote = quoteResult.status === "fulfilled" ? quoteResult.value?.data : null;
  let klines = klineResult.status === "fulfilled" ? klineResult.value?.data?.klines || [] : [];
  const financeRows = financeResult.status === "fulfilled" ? financeResult.value?.result?.data || [] : [];
  const flowLines = flowResult.status === "fulfilled" ? flowResult.value?.data?.klines || [] : [];
  const org = orgResult.status === "fulfilled" ? orgResult.value?.result?.data?.[0] || null : null;
  const stale = [quoteResult, klineResult, financeResult, flowResult, orgResult].some(
    (result) => result.status === "fulfilled" && result.value?.__stale,
  );

  if (!klines.length) {
    try {
      const fallbackChart = await fetchTencentChart(secid, "kline", 120);
      klines = fallbackChart.points.map((item) =>
        [item.date, item.open, item.close, item.high, item.low, item.volume, item.amount, item.amplitude, item.changePercent, item.change, item.turnover].join(","),
      );
    } catch {
      // Other diagnostics remain available without a K-line series.
    }
  }

  const candles = klines
    .map((line) => {
      const [date, open, close, high, low, volume, amount, amplitude, changePercent, change, turnover] = line.split(",");
      return {
        date,
        open: Number(open),
        close: Number(close),
        high: Number(high),
        low: Number(low),
        volume: Number(volume),
        amount: Number(amount),
        amplitude: Number(amplitude),
        changePercent: Number(changePercent),
        change: Number(change),
        turnover: Number(turnover),
      };
    })
    .filter((item) => Number.isFinite(item.close));
  const closes = candles.map((item) => item.close);
  const last = candles.at(-1);
  const previous = candles.at(-2);
  const ma5 = average(closes.slice(-5));
  const ma10 = average(closes.slice(-10));
  const ma20 = average(closes.slice(-20));
  const rsi = calcRsi(closes);
  const ema12 = calcEma(closes, 12);
  const ema26 = calcEma(closes, 26);
  const macdSeries = ema12.map((value, index) => value - ema26[index]);
  const signalSeries = calcEma(macdSeries, 9);
  const macd = macdSeries.at(-1) || 0;
  const macdSignal = signalSeries.at(-1) || 0;
  const momentum5 = closes.length > 5 ? ((closes.at(-1) / closes.at(-6) - 1) * 100) : null;
  const returns20 = closes.slice(-21).slice(1).map((price, index, array) => {
    const prior = closes.slice(-21)[index];
    return prior ? price / prior - 1 : 0;
  });
  const volatility = standardDeviation(returns20);
  const annualizedVolatility = volatility === null ? null : volatility * Math.sqrt(252) * 100;
  const avgAbsChange = average(candles.slice(-21, -1).map((item) => Math.abs(item.changePercent)));
  const amountRatio =
    last && average(candles.slice(-21, -1).map((item) => item.amount))
      ? last.amount / average(candles.slice(-21, -1).map((item) => item.amount))
      : null;

  let trendScore = 50;
  if (last?.close && ma5) trendScore += last.close > ma5 ? 8 : -8;
  if (ma5 && ma10) trendScore += ma5 > ma10 ? 8 : -8;
  if (ma10 && ma20) trendScore += ma10 > ma20 ? 8 : -8;
  if (macd > macdSignal) trendScore += 8;
  else trendScore -= 8;
  if (rsi !== null) {
    if (rsi >= 42 && rsi <= 68) trendScore += 8;
    else if (rsi > 78 || rsi < 24) trendScore -= 6;
  }
  trendScore = Math.round(clamp(trendScore));

  const rawScenarios = [
    Math.max(8, trendScore),
    Math.max(14, 42 - Math.abs(trendScore - 50) * 0.25),
    Math.max(8, 100 - trendScore),
  ];
  const scenarioTotal = rawScenarios.reduce((sum, value) => sum + value, 0);
  const scenarios = rawScenarios.map((value) => Math.round((value / scenarioTotal) * 100));
  scenarios[1] += 100 - scenarios.reduce((sum, value) => sum + value, 0);

  const flowRows = flowLines.map((line) => {
    const parts = line.split(",");
    return {
      date: parts[0],
      mainNet: Number(parts[1]),
      mainNetPercent: Number(parts[6]),
      close: Number(parts[11]),
      changePercent: Number(parts[12]),
    };
  });
  const latestFlow = flowRows.at(-1);
  const flowSum5 = flowRows.slice(-5).reduce((sum, item) => sum + (item.mainNet || 0), 0);
  const quoteTurnover = Number(quote?.f168);
  const queryTurnover = Number(url.searchParams.get("turnover"));
  const turnover = Number.isFinite(quoteTurnover)
    ? quoteTurnover / 100
    : Number.isFinite(queryTurnover)
      ? queryTurnover
      : last?.turnover || 0;
  const quoteChange = Number(quote?.f170);
  const changePercent = (Number.isFinite(quoteChange) ? quoteChange / 100 : null) || last?.changePercent || 0;
  const amplitude = last?.amplitude ?? 0;
  const abnormalRatio = avgAbsChange ? Math.abs(changePercent) / avgAbsChange : null;
  const abnormal =
    Math.abs(changePercent) >= 5 || amplitude >= 7 || (amountRatio && amountRatio >= 1.8)
      ? "显著异动"
      : "波动正常";
  const industry =
    quote?.f127 ||
    org?.EM2016?.split("-").at(-1) ||
    org?.INDUSTRYCSRC1?.split("-").at(-1) ||
    url.searchParams.get("industry") ||
    "未分类";
  const sector = await resolveSectorBoard(industry, code);
  const sectorRelative =
    sector?.changePercent !== null && Number.isFinite(sector?.changePercent)
      ? changePercent - sector.changePercent
      : null;
  const riskScore = Math.round(
    clamp(
      25 +
        Math.min(24, (annualizedVolatility || 20) * 0.45) +
        Math.min(18, Math.abs(changePercent) * 2.4) +
        Math.min(16, Math.max(0, turnover - 1) * 5) +
        (latestFlow?.mainNet < 0 ? 13 : 0) +
        (sectorRelative !== null && sectorRelative < -2 ? 8 : 0),
    ),
  );
  const riskLevel = riskScore >= 68 ? "高" : riskScore >= 45 ? "中" : "低";
  const support = candles.length ? Math.min(...candles.slice(-20).map((item) => item.low)) : null;
  const resistance = candles.length ? Math.max(...candles.slice(-20).map((item) => item.high)) : null;
  const financial = parseFinancialData(financeRows[0]);

  const payload = {
    ok: true,
    stale,
    secid,
    name: quote?.f58 || url.searchParams.get("name") || "",
    industry,
    risk: {
      score: riskScore,
      level: riskLevel,
      abnormal: {
        label: abnormal,
        changePercent: Number(changePercent.toFixed(2)),
        amplitude: Number(amplitude.toFixed(2)),
        amountRatio: amountRatio === null ? null : Number(amountRatio.toFixed(2)),
        ratio: abnormalRatio === null ? null : Number(abnormalRatio.toFixed(2)),
      },
      mainFlow: {
        latest: latestFlow?.mainNet || 0,
        latestPercent: latestFlow?.mainNetPercent || 0,
        sum5: flowSum5,
        trend: flowRows.slice(-5),
      },
      sector: {
        name: sector?.name || industry,
        changePercent: sector?.changePercent ?? null,
        relative: sectorRelative === null ? null : Number(sectorRelative.toFixed(2)),
      },
      turnover: {
        value: turnover || 0,
        label: turnover >= 8 ? "明显放大" : turnover >= 3 ? "活跃" : "常规",
      },
    },
    forecast: {
      score: trendScore,
      scenarios: {
        bullish: scenarios[0],
        neutral: scenarios[1],
        bearish: scenarios[2],
      },
      support,
      resistance,
      ma5,
      ma10,
      ma20,
      rsi,
      macd,
      momentum5,
      annualizedVolatility,
      paragraph:
        trendScore >= 62
          ? "短中期均线结构偏强，但仍需观察阻力位附近的成交配合。"
          : trendScore <= 38
            ? "均线与动量信号偏弱，关注支撑位是否有效以及资金流出是否收敛。"
            : "趋势信号处于震荡区间，方向尚未形成一致，可等待量价突破确认。",
    },
    financial,
    company: {
      name: org?.SECURITY_NAME_ABBR || quote?.f58 || url.searchParams.get("name") || "",
      industry,
      profile: org?.ORG_PROFILE || "",
    },
    dataNotes: {
      quote: quoteResult.status,
      kline: klineResult.status,
      finance: financeResult.status,
      flow: flowResult.status,
      org: orgResult.status,
    },
  };

  analysisCache.set(secid, { time: Date.now(), payload });
  jsonResponse(response, 200, payload);
}

async function handleSectors(response) {
  try {
    const endpoint = new URL("https://push2.eastmoney.com/api/qt/clist/get");
    endpoint.searchParams.set("pn", "1");
    endpoint.searchParams.set("pz", "6");
    endpoint.searchParams.set("po", "1");
    endpoint.searchParams.set("np", "1");
    endpoint.searchParams.set("fltt", "2");
    endpoint.searchParams.set("invt", "2");
    endpoint.searchParams.set("fid", "f3");
    endpoint.searchParams.set("fs", "m:90+t:2");
    endpoint.searchParams.set("fields", "f12,f14,f3,f62");
    const payload = await fetchJson(endpoint, "sectors:top6", 30000, 600000);
    const items = payload?.data?.diff;
    if (!Array.isArray(items)) throw new Error("板块接口没有返回数据");
    jsonResponse(response, 200, {
      ok: true,
      stale: Boolean(payload.__stale),
      sectors: items.map((item) => ({
        code: item.f12,
        name: item.f14,
        change: Number(item.f3),
        mainNet: Number(item.f62),
      })),
    });
  } catch {
    jsonResponse(response, 200, {
      ok: true,
      stale: true,
      sectors: [],
      warning: "板块排名暂不可用，已保留本地最近数据",
    });
  }
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    const requestPath = decodeURIComponent(url.pathname);
    if (requestPath === "/api/quotes") {
      await handleQuotes(url, response);
      return;
    }
    if (requestPath === "/api/search") {
      await handleSearch(url, response);
      return;
    }
    if (requestPath === "/api/chart") {
      await handleChart(url, response);
      return;
    }
    if (requestPath === "/api/stock-analysis") {
      await handleStockAnalysis(url, response);
      return;
    }
    if (requestPath === "/api/auth/register") {
      await handleRegister(request, response);
      return;
    }
    if (requestPath === "/api/auth/login") {
      await handleLogin(request, response);
      return;
    }
    if (requestPath === "/api/auth/me") {
      await loadAccounts();
      const user = requireSessionUser(request);
      jsonResponse(response, 200, { ok: true, user: safeUser(user) });
      return;
    }
    if (requestPath === "/api/auth/logout") {
      await loadAccounts();
      const token = (request.headers.authorization || "").replace(/^Bearer\s+/i, "");
      sessions.delete(token);
      await saveAccounts();
      jsonResponse(response, 200, { ok: true });
      return;
    }
    if (requestPath === "/api/user/state") {
      await handleUserState(request, response);
      return;
    }
    if (requestPath === "/api/competition") {
      await handleCompetition(request, response, "get");
      return;
    }
    if (requestPath === "/api/competition/create") {
      await handleCompetition(request, response, "create");
      return;
    }
    if (requestPath === "/api/competition/join" || requestPath === "/api/competition/update") {
      await handleCompetition(request, response, requestPath.endsWith("join") ? "join" : "update");
      return;
    }
    if (requestPath === "/api/sectors") {
      await handleSectors(response);
      return;
    }
    const filename = path.resolve(distDir, requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, ""));
    if (!filename.startsWith(distDir)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    const body = await readFile(filename);
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filename)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    response.end(body);
  } catch (error) {
    if (String(error?.message).includes("ENOENT")) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    jsonResponse(response, Number(error?.statusCode) || 502, {
      ok: false,
      error: "实时行情服务暂时不可用，请稍后刷新",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}).listen(port, "0.0.0.0", () => {
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter((entry) => entry && entry.family === "IPv4" && !entry.internal)
    .map((entry) => `http://${entry.address}:${port}`);
  console.log(`观潮演示已启动：http://localhost:${port}`);
  addresses.forEach((address) => console.log(`手机访问：${address}`));
  console.log("手机与电脑需连接同一 Wi-Fi，并保持此窗口运行。");
});
