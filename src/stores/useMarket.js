import { computed, reactive, ref } from "vue";
import { fallbackSectors, marketIndices, seedStocks } from "../data/market";

const STORAGE_KEY = "tide-real-market-v2";

const defaultPortfolio = {
  cash: 125000,
  positions: [
    { code: "600519", shares: 100, availableShares: 100, pendingShares: 0, avgCost: 1280 },
    { code: "300750", shares: 300, availableShares: 300, pendingShares: 0, avgCost: 300 },
    { code: "600036", shares: 2000, availableShares: 2000, pendingShares: 0, avgCost: 40 },
  ],
  watchlist: ["600519", "300750", "002594", "600036"],
  ledger: [
    {
      id: "seed-1",
      type: "buy",
      code: "600519",
      name: "贵州茅台",
      shares: 100,
      price: 1280,
      amount: 128000,
      time: "10月16日 10:24",
      note: "模拟组合的核心仓位，记录成本与持有理由。",
    },
    {
      id: "seed-2",
      type: "buy",
      code: "300750",
      name: "宁德时代",
      shares: 300,
      price: 300,
      amount: 90000,
      time: "10月17日 14:06",
      note: "观察新能源方向的波动承受能力。",
    },
    {
      id: "seed-3",
      type: "buy",
      code: "600036",
      name: "招商银行",
      shares: 2000,
      price: 40,
      amount: 80000,
      time: "10月18日 09:48",
      note: "用于比较低估值金融与成长方向的仓位表现。",
    },
  ],
  alerts: [
    {
      id: "alert-seed-1",
      code: "300750",
      name: "宁德时代",
      direction: "below",
      target: 220,
      createdAt: Date.now(),
      triggered: false,
      triggeredAt: null,
    },
  ],
  notifications: [],
  history: [],
  customStocks: [],
  recentViews: [],
  settings: {
    autoRefresh: true,
    refreshSeconds: 15,
  },
};

function cloneDefaultPortfolio() {
  return JSON.parse(JSON.stringify(defaultPortfolio));
}

function loadPortfolio() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.positions) || !Array.isArray(saved.watchlist)) {
      return cloneDefaultPortfolio();
    }
    const defaults = cloneDefaultPortfolio();
    const positions = saved.positions.map((position) => ({
      ...position,
      availableShares: Number.isFinite(position.availableShares) ? position.availableShares : position.shares,
      pendingShares: Number(position.pendingShares) || 0,
      pendingDate: position.pendingDate || null,
    }));
    return {
      ...defaults,
      ...saved,
      positions,
      settings: { ...defaults.settings, ...(saved.settings || {}) },
      alerts: Array.isArray(saved.alerts) ? saved.alerts : defaults.alerts,
      notifications: Array.isArray(saved.notifications) ? saved.notifications : [],
      recentViews: Array.isArray(saved.recentViews) ? saved.recentViews : [],
    };
  } catch {
    return cloneDefaultPortfolio();
  }
}

function createPriceHistory(stock) {
  const start = Number(stock.prevClose || stock.price || 1);
  const end = Number(stock.price || start);
  return Array.from({ length: 24 }, (_, index) => {
    const progress = index / 23;
    const wave = Math.sin(index * 1.6 + Number(stock.code.slice(-2))) * start * 0.002;
    return Number((start + (end - start) * progress + wave).toFixed(3));
  });
}

export const stocks = reactive(
  seedStocks.map((stock) => ({
    ...stock,
    change: Number((stock.price - stock.prevClose).toFixed(2)),
    changePercent: Number((((stock.price - stock.prevClose) / stock.prevClose) * 100).toFixed(2)),
    history: createPriceHistory(stock),
    live: false,
    quoteTimestamp: null,
  })),
);

export const indices = reactive(
  marketIndices.map((index) => ({
    ...index,
    history: [...index.points],
    live: false,
    quoteTimestamp: null,
  })),
);

export const sectorStats = reactive([...fallbackSectors]);
export const portfolio = reactive(loadPortfolio());
export const lastUpdated = reactive({
  value: null,
  live: false,
  source: "等待连接",
  tradeTimestamp: null,
});
export const marketMeta = reactive({
  connection: "connecting",
  error: "",
  lastAttempt: null,
  sectorUpdatedAt: null,
  provider: "",
});
export const marketClock = ref(Date.now());

if (typeof window !== "undefined") {
  window.setInterval(() => {
    marketClock.value = Date.now();
  }, 30000);
}

portfolio.customStocks.forEach((item) => {
  if (!stocks.some((stock) => stock.secid === item.secid || stock.code === item.code)) {
    stocks.push(
      reactive({
        ...item,
        history: item.price ? [Number(item.prevClose) || Number(item.price), Number(item.price)] : [0, 0],
        live: Boolean(item.price),
      }),
    );
  }
});

let refreshPromise = null;

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  } catch {
    // The app remains usable if browser storage is disabled.
  }
}

export function hydratePortfolioState(state) {
  const defaults = cloneDefaultPortfolio();
  const incoming = state && typeof state === "object" ? state : {};
  const next = {
    ...defaults,
    ...incoming,
    positions: Array.isArray(incoming.positions)
      ? incoming.positions.map((position) => ({
          ...position,
          availableShares: Number.isFinite(position.availableShares) ? position.availableShares : position.shares,
          pendingShares: Number(position.pendingShares) || 0,
          pendingDate: position.pendingDate || null,
        }))
      : defaults.positions,
    watchlist: Array.isArray(incoming.watchlist) ? incoming.watchlist : defaults.watchlist,
    ledger: Array.isArray(incoming.ledger) ? incoming.ledger : defaults.ledger,
    alerts: Array.isArray(incoming.alerts) ? incoming.alerts : defaults.alerts,
    notifications: Array.isArray(incoming.notifications) ? incoming.notifications : [],
    history: Array.isArray(incoming.history) ? incoming.history : [],
    recentViews: Array.isArray(incoming.recentViews) ? incoming.recentViews : [],
    customStocks: Array.isArray(incoming.customStocks) ? incoming.customStocks : [],
    settings: { ...defaults.settings, ...(incoming.settings || {}) },
  };
  Object.keys(portfolio).forEach((key) => delete portfolio[key]);
  Object.assign(portfolio, next);
  resetMarketPrices();
  persist();
}

export function getStock(code) {
  return stocks.find((stock) => stock.code === code);
}

export function getStockBySecid(secid) {
  return stocks.find((stock) => stock.secid === secid);
}

export function getPosition(code) {
  return portfolio.positions.find((position) => position.code === code);
}

function shanghaiParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function shanghaiDateKey(date = new Date()) {
  const parts = shanghaiParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function nextWeekdayLabel(weekday) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].includes(weekday)
    ? "下一交易日 09:30"
    : "下一交易日 09:30";
}

export function getTradingStatus(now = new Date()) {
  const parts = shanghaiParts(now);
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const isWeekend = parts.weekday === "Sat" || parts.weekday === "Sun";
  const todayKey = `${parts.year}-${parts.month}-${parts.day}`;
  const quoteKey =
    lastUpdated.live && lastUpdated.tradeTimestamp
      ? shanghaiDateKey(lastUpdated.tradeTimestamp)
      : todayKey;
  const insideSessionWindow = (minutes >= 570 && minutes <= 690) || (minutes >= 780 && minutes <= 900);
  const likelyHoliday = !isWeekend && insideSessionWindow && quoteKey !== todayKey;

  if (isWeekend) {
    return {
      phase: "weekend",
      label: "周末休市",
      detail: "A 股周末不交易，下一交易日 09:30 开盘",
      canTrade: false,
      isTradingDay: false,
      tradeDate: todayKey,
      nextOpen: nextWeekdayLabel(parts.weekday),
      quoteDate: quoteKey,
    };
  }
  if (likelyHoliday) {
    return {
      phase: "holiday",
      label: "今日休市",
      detail: "行情日期与今日不一致，当前可能为法定休市日",
      canTrade: false,
      isTradingDay: false,
      tradeDate: todayKey,
      nextOpen: "下一交易日 09:30",
      quoteDate: quoteKey,
    };
  }
  if (minutes < 570) {
    return {
      phase: "preopen",
      label: "开盘前",
      detail: "集合竞价前，暂不接受模拟成交",
      canTrade: false,
      isTradingDay: true,
      tradeDate: todayKey,
      nextOpen: "今日 09:30",
      quoteDate: quoteKey,
    };
  }
  if (minutes <= 690) {
    const quoteReady = lastUpdated.live;
    return {
      phase: "trading",
      label: "交易中",
      detail: quoteReady ? "上午交易时段 09:30-11:30" : "行情尚未完成同步，暂不执行模拟成交",
      canTrade: quoteReady,
      isTradingDay: true,
      tradeDate: todayKey,
      nextOpen: "今日 13:00",
      quoteDate: quoteKey,
    };
  }
  if (minutes < 780) {
    return {
      phase: "midday",
      label: "午间休市",
      detail: "下午交易时段 13:00 开始",
      canTrade: false,
      isTradingDay: true,
      tradeDate: todayKey,
      nextOpen: "今日 13:00",
      quoteDate: quoteKey,
    };
  }
  if (minutes <= 900) {
    const quoteReady = lastUpdated.live;
    return {
      phase: "trading",
      label: "交易中",
      detail: quoteReady ? "下午交易时段 13:00-15:00" : "行情尚未完成同步，暂不执行模拟成交",
      canTrade: quoteReady,
      isTradingDay: true,
      tradeDate: todayKey,
      nextOpen: "已进入尾盘",
      quoteDate: quoteKey,
    };
  }
  return {
    phase: "closed",
    label: "已收盘",
    detail: "今日交易已结束，下一交易日 09:30 开盘",
    canTrade: false,
    isTradingDay: true,
    tradeDate: todayKey,
    nextOpen: "下一交易日 09:30",
    quoteDate: quoteKey,
  };
}

export const tradingStatus = computed(() => {
  marketClock.value;
  return getTradingStatus();
});

function settleT1() {
  const status = tradingStatus.value;
  if (!status.isTradingDay || !status.tradeDate) return false;
  let changed = false;
  portfolio.positions.forEach((position) => {
    const pending = Number(position.pendingShares) || 0;
    if (pending > 0 && position.pendingDate && status.tradeDate > position.pendingDate) {
      position.availableShares = Number(position.availableShares || 0) + pending;
      position.pendingShares = 0;
      position.pendingDate = null;
      changed = true;
    }
  });
  if (changed) persist();
  return changed;
}

export function registerStock(item) {
  const existing = stocks.find((stock) => stock.secid === item.secid || stock.code === item.code);
  if (existing) {
    if (item.price) Object.assign(existing, item, { live: true });
    return existing;
  }
  const storedItem = {
    code: item.code,
    secid: item.secid,
    name: item.name,
    sector: item.sector || item.type || "A 股",
    market: item.market || "A股",
    price: Number(item.price) || 0,
    prevClose: Number(item.prevClose) || 0,
    open: Number(item.open) || 0,
    high: Number(item.high) || 0,
    low: Number(item.low) || 0,
    volume: Number(item.volume) || 0,
    amount: Number(item.amount) || 0,
    turnover: Number(item.turnover) || 0,
    pe: Number(item.pe) || 0,
    pb: Number(item.pb) || 0,
    marketCap: Number(item.marketCap) || 0,
    volumeRatio: Number(item.volumeRatio) || 0,
    change: Number(item.change) || 0,
    changePercent: Number(item.changePercent) || 0,
    quoteTimestamp: Number(item.timestamp) || null,
  };
  const stock = reactive({
    ...storedItem,
    mainNet: "—",
    dividend: "—",
    description: `${item.name}为实时查询的 A 股标的。行情由本地服务同步公开接口数据。`,
    tags: [item.market === "SH" ? "沪市" : "深市", "实时查询"],
    history: item.price ? [Number(item.prevClose) || Number(item.price), Number(item.price)] : [0, 0],
    live: Boolean(item.price),
    quoteTimestamp: Number(item.timestamp) || null,
  });
  stocks.push(stock);
  portfolio.customStocks.unshift(storedItem);
  portfolio.customStocks = portfolio.customStocks.slice(0, 50);
  persist();
  return stock;
}

export async function searchStocks(query) {
  const keyword = String(query || "").trim();
  if (!keyword) return [];
  const response = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("股票搜索服务暂时不可用");
  const payload = await response.json();
  return payload.results || [];
}

export function formatMoney(value, digits = 2) {
  return Number(value || 0).toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatSigned(value, digits = 2) {
  const number = Number(value || 0);
  return `${number > 0 ? "+" : ""}${number.toFixed(digits)}`;
}

export function formatCompactMoney(value) {
  const amount = Number(value || 0);
  if (Math.abs(amount) >= 100000000) return `${(amount / 100000000).toFixed(2)}亿`;
  if (Math.abs(amount) >= 10000) return `${(amount / 10000).toFixed(2)}万`;
  return amount.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
}

export function formatVolume(lots) {
  const shares = Number(lots || 0) * 100;
  if (shares >= 100000000) return `${(shares / 100000000).toFixed(2)}亿`;
  if (shares >= 10000) return `${(shares / 10000).toFixed(2)}万`;
  return shares.toLocaleString("zh-CN");
}

export function trendClass(value) {
  if (Number(value) > 0) return "rise";
  if (Number(value) < 0) return "fall";
  return "flat";
}

export function toggleWatch(code) {
  const index = portfolio.watchlist.indexOf(code);
  if (index >= 0) {
    portfolio.watchlist.splice(index, 1);
  } else {
    portfolio.watchlist.push(code);
  }
  persist();
  return portfolio.watchlist.includes(code);
}

export function recordRecentView(code) {
  const stock = getStock(code);
  if (!stock) return;
  portfolio.recentViews = [
    { code, viewedAt: Date.now() },
    ...portfolio.recentViews.filter((item) => item.code !== code),
  ].slice(0, 8);
  persist();
}

export function clearRecentViews() {
  portfolio.recentViews = [];
  persist();
}

export function executeTrade({ code, type, shares, price, note = "" }) {
  const session = getTradingStatus();
  if (!session.canTrade) {
    return {
      ok: false,
      message: `${session.label}：${session.detail}，当前不会产生模拟成交`,
    };
  }
  const quantity = Math.floor(Number(shares) / 100) * 100;
  if (!quantity || quantity <= 0) {
    return { ok: false, message: "请输入 100 股的整数倍" };
  }

  const stock = getStock(code);
  if (!stock || !Number(stock.price)) return { ok: false, message: "实时价格尚未加载，请稍后重试" };

  const tradePrice = Number(price || stock.price);
  const gross = tradePrice * quantity;
  const fee = Math.max(5, gross * 0.00025);
  const stampDuty = type === "sell" ? gross * 0.0005 : 0;
  const total = gross + fee + stampDuty;
  const existing = getPosition(code);
  const now = new Date();
  const realizedProfit =
    type === "sell" && existing
      ? (tradePrice - existing.avgCost) * quantity - fee - stampDuty
      : 0;

  if (type === "buy" && total > portfolio.cash) {
    return { ok: false, message: "可用资金不足，可减少数量后重试" };
  }
  if (
    type === "sell" &&
    (!existing || Math.min(existing.availableShares ?? existing.shares, existing.shares) < quantity)
  ) {
    return { ok: false, message: "可卖数量不足；当日买入的股票需下一交易日才能卖出" };
  }

  if (type === "buy") {
    portfolio.cash -= total;
    if (existing) {
      const oldValue = existing.avgCost * existing.shares;
      existing.shares += quantity;
      existing.pendingShares = Number(existing.pendingShares || 0) + quantity;
      existing.pendingDate = session.tradeDate;
      existing.availableShares = Number(existing.availableShares ?? existing.shares - quantity);
      existing.avgCost = Number(((oldValue + total) / existing.shares).toFixed(3));
    } else {
      portfolio.positions.push({
        code,
        shares: quantity,
        availableShares: 0,
        pendingShares: quantity,
        pendingDate: session.tradeDate,
        avgCost: Number((total / quantity).toFixed(3)),
      });
    }
  } else {
    portfolio.cash += gross - fee - stampDuty;
    existing.shares -= quantity;
    existing.availableShares = Math.max(0, Number(existing.availableShares || 0) - quantity);
    portfolio.positions = portfolio.positions.filter((position) => position.shares > 0);
  }

  portfolio.ledger.unshift({
    id: `trade-${Date.now()}`,
    type,
    code,
    name: stock.name,
    shares: quantity,
    price: tradePrice,
    amount: Number(gross.toFixed(2)),
    fee: Number((fee + stampDuty).toFixed(2)),
    note: String(note || "").trim(),
    avgCostAtSale: type === "sell" && existing ? Number(existing.avgCost.toFixed(3)) : undefined,
    time: now.toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    timestamp: now.getTime(),
    realizedProfit: Number(realizedProfit.toFixed(2)),
    tradeDate: session.tradeDate,
    session: session.phase,
  });
  persist();
  return { ok: true, message: `${type === "buy" ? "买入" : "卖出"} ${quantity} 股成功` };
}

export function addPriceAlert({ code, direction, target }) {
  const stock = getStock(code);
  const threshold = Number(target);
  if (!stock || !Number.isFinite(threshold) || threshold <= 0) {
    return { ok: false, message: "请输入有效的提醒价格" };
  }
  const duplicate = portfolio.alerts.find(
    (alert) => alert.code === code && alert.direction === direction && !alert.triggered,
  );
  if (duplicate) {
    duplicate.target = threshold;
  } else {
    portfolio.alerts.unshift({
      id: `alert-${Date.now()}`,
      code,
      name: stock.name,
      direction,
      target: threshold,
      createdAt: Date.now(),
      triggered: false,
      triggeredAt: null,
    });
  }
  persist();
  return { ok: true, message: "价格提醒已设置" };
}

export function removePriceAlert(id) {
  const index = portfolio.alerts.findIndex((alert) => alert.id === id);
  if (index >= 0) portfolio.alerts.splice(index, 1);
  persist();
}

export function markNotificationsRead() {
  portfolio.notifications.forEach((notification) => {
    notification.read = true;
  });
  persist();
}

export function updateMarketSettings(patch) {
  Object.assign(portfolio.settings, patch);
  persist();
}

function recordAccountSnapshot() {
  const marketValue = portfolio.positions.reduce((sum, position) => {
    const stock = getStock(position.code);
    return sum + (stock?.price || 0) * position.shares;
  }, 0);
  const value = portfolio.cash + marketValue;
  const last = portfolio.history.at(-1);
  if (last && Date.now() - last.time < 10000) return;
  portfolio.history.push({ time: Date.now(), value });
  portfolio.history = portfolio.history.slice(-30);
  persist();
}

function evaluateAlerts() {
  if (!tradingStatus.value.canTrade) return [];
  const triggered = [];
  portfolio.alerts.forEach((alert) => {
    if (alert.triggered) return;
    const stock = getStock(alert.code);
    if (!stock?.price) return;
    const matched =
      (alert.direction === "above" && stock.price >= alert.target) ||
      (alert.direction === "below" && stock.price <= alert.target);
    if (!matched) return;
    alert.triggered = true;
    alert.triggeredAt = Date.now();
    const notification = {
      id: `notice-${Date.now()}-${alert.code}`,
      code: alert.code,
      name: alert.name,
      type: "price-alert",
      message: `${alert.name} 已${alert.direction === "above" ? "涨至" : "跌至"} ¥${stock.price.toFixed(2)}，触发提醒价 ¥${alert.target.toFixed(2)}`,
      time: new Date().toISOString(),
      read: false,
    };
    portfolio.notifications.unshift(notification);
    triggered.push(notification);
  });
  if (triggered.length) persist();
  return triggered;
}

function applyQuote(target, quote) {
  if (!quote || !Number.isFinite(quote.price)) return;
  const wasLive = target.live;
  target.price = quote.price;
  target.prevClose = quote.prevClose;
  target.change = quote.change;
  target.changePercent = quote.changePercent;
  target.open = quote.open;
  target.high = quote.high;
  target.low = quote.low;
  target.volume = quote.volume;
  target.amount = quote.amount;
  target.turnover = quote.turnover;
  target.pe = quote.pe;
  target.pb = quote.pb;
  target.marketCap = quote.marketCap;
  target.volumeRatio = quote.volumeRatio;
  target.quoteTimestamp = quote.timestamp;
  target.live = true;
  if (target.history) {
    if (!wasLive) {
      target.history = target.prevClose ? [target.prevClose, quote.price] : [quote.price];
    } else {
      target.history.push(quote.price);
      target.history = target.history.slice(-24);
    }
  }
}

function applyQuoteResult(list, quotes) {
  const quoteMap = new Map(quotes.map((quote) => [quote.code, quote]));
  list.forEach((item) => {
    const quote = quoteMap.get(item.code);
    if (quote) applyQuote(item, quote);
  });
}

async function requestQuotes(items) {
  if (!items.length) return { quotes: [], stale: false };
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(`/api/quotes?secids=${encodeURIComponent(items.map((item) => item.secid).join(","))}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) throw new Error("实时行情接口请求失败");
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "实时行情接口返回异常");
      return {
        quotes: payload.quotes || [],
        stale: Boolean(payload.stale),
        source: payload.source || "公开行情接口",
        fallback: Boolean(payload.fallback),
      };
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }
  throw lastError;
}

async function requestSectors() {
  const response = await fetch("/api/sectors", { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("板块行情请求失败");
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || "板块行情返回异常");
  return { sectors: payload.sectors || [], stale: Boolean(payload.stale) };
}

export function refreshMarket({ includeSectors = false } = {}) {
  if (refreshPromise) return refreshPromise;
  marketMeta.lastAttempt = new Date();
  refreshPromise = (async () => {
    try {
      const activeStocks = stocks.slice(0, 30);
      const quoteResults = await Promise.allSettled([requestQuotes(indices), requestQuotes(activeStocks)]);
      const fulfilledQuotes = quoteResults.filter((result) => result.status === "fulfilled").map((result) => result.value);
      if (!fulfilledQuotes.length) {
        throw quoteResults[0]?.reason || quoteResults[1]?.reason || new Error("实时行情接口请求失败");
      }
      const [indexResult, stockResult] = quoteResults.map((result) =>
        result.status === "fulfilled" ? result.value : null,
      );
      if (indexResult) applyQuoteResult(indices, indexResult.quotes);
      if (stockResult) applyQuoteResult(activeStocks, stockResult.quotes);
      const partiallyUnavailable = quoteResults.some((result) => result.status === "rejected");
      const stale = partiallyUnavailable || fulfilledQuotes.some((result) => result.stale);
      if (includeSectors) {
        try {
          const sectorResult = await requestSectors();
          if (sectorResult.sectors.length) {
            sectorStats.splice(0, sectorStats.length, ...sectorResult.sectors);
            marketMeta.sectorUpdatedAt = new Date();
          }
        } catch {
          // Core quotes remain live even when the sector ranking endpoint is temporarily unavailable.
        }
      }
      const timestamps = fulfilledQuotes
        .flatMap((result) => result.quotes)
        .map((quote) => quote.timestamp)
        .filter(Boolean);
      lastUpdated.value = new Date();
      lastUpdated.live = !stale;
      lastUpdated.source = stale ? "最近缓存行情" : fulfilledQuotes[0]?.source || "公开行情接口";
      marketMeta.provider = fulfilledQuotes[0]?.fallback ? "备用行情源" : "主行情源";
      if (timestamps.length) lastUpdated.tradeTimestamp = new Date(Math.max(...timestamps));
      marketMeta.connection = stale ? "stale" : "live";
      marketMeta.error = stale ? "实时接口短时波动，已使用最近缓存行情" : "";
      settleT1();
      recordAccountSnapshot();
      const triggered = evaluateAlerts();
      return { ok: true, stale, triggered };
    } catch (error) {
      lastUpdated.live = false;
      marketMeta.connection = "error";
      marketMeta.error = error instanceof Error ? error.message : "行情连接失败";
      return { ok: false, message: marketMeta.error };
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export function resetPortfolio() {
  Object.assign(portfolio, cloneDefaultPortfolio());
  persist();
}

export function resetMarketPrices() {
  stocks.splice(
    0,
    stocks.length,
    ...seedStocks.map((stock) => ({
      ...stock,
      change: Number((stock.price - stock.prevClose).toFixed(2)),
      changePercent: Number((((stock.price - stock.prevClose) / stock.prevClose) * 100).toFixed(2)),
      history: createPriceHistory(stock),
      live: false,
      quoteTimestamp: null,
    })),
  );
  indices.splice(
    0,
    indices.length,
    ...marketIndices.map((index) => ({
      ...index,
      history: [...index.points],
      live: false,
      quoteTimestamp: null,
    })),
  );
  sectorStats.splice(0, sectorStats.length, ...fallbackSectors);
  lastUpdated.value = null;
  lastUpdated.live = false;
  lastUpdated.source = "等待连接";
  marketMeta.connection = "connecting";
  stocks.push(
    ...portfolio.customStocks
      .filter((item) => !seedStocks.some((stock) => stock.code === item.code))
      .map((item) =>
        reactive({
          ...item,
          mainNet: "—",
          dividend: "—",
          description: `${item.name}为实时查询的 A 股标的。行情由本地服务同步公开接口数据。`,
          tags: [item.market === "SH" ? "沪市" : "深市", "实时查询"],
          history: [item.prevClose || item.price || 0, item.price || 0],
          live: Boolean(item.price),
        }),
      ),
  );
}

export const holdings = computed(() =>
  portfolio.positions
    .map((position) => {
      const stock = getStock(position.code);
      if (!stock) return null;
      const marketValue = stock.price * position.shares;
      const profit = (stock.price - position.avgCost) * position.shares;
      return {
        ...position,
        stock,
        marketValue,
        profit,
        profitPercent: position.avgCost ? (profit / (position.avgCost * position.shares)) * 100 : 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.marketValue - a.marketValue),
);

export const account = computed(() => {
  const marketValue = holdings.value.reduce((sum, item) => sum + item.marketValue, 0);
  const totalAssets = portfolio.cash + marketValue;
  const yesterdayValue =
    portfolio.cash +
    holdings.value.reduce((sum, item) => sum + item.stock.prevClose * item.shares, 0);
  const dailyProfit = totalAssets - yesterdayValue;
  const totalProfit = holdings.value.reduce((sum, item) => sum + item.profit, 0);
  const invested = holdings.value.reduce((sum, item) => sum + item.avgCost * item.shares, 0);

  return {
    marketValue,
    totalAssets,
    dailyProfit,
    dailyPercent: yesterdayValue ? (dailyProfit / yesterdayValue) * 100 : 0,
    totalProfit,
    totalProfitPercent: invested ? (totalProfit / invested) * 100 : 0,
    positionPercent: totalAssets ? (marketValue / totalAssets) * 100 : 0,
  };
});

export function buildPortfolioSummary() {
  return {
    totalAssets: Number(account.value.totalAssets.toFixed(2)),
    marketValue: Number(account.value.marketValue.toFixed(2)),
    cash: Number(portfolio.cash.toFixed(2)),
    dailyProfit: Number(account.value.dailyProfit.toFixed(2)),
    dailyPercent: Number(account.value.dailyPercent.toFixed(3)),
    totalProfit: Number(account.value.totalProfit.toFixed(2)),
    totalProfitPercent: Number(account.value.totalProfitPercent.toFixed(3)),
    positionPercent: Number(account.value.positionPercent.toFixed(2)),
    holdingCount: holdings.value.length,
    positions: holdings.value.map((item) => ({
      code: item.code,
      name: item.stock.name,
      shares: item.shares,
      availableShares: item.availableShares ?? item.shares,
      avgCost: Number(item.avgCost.toFixed(3)),
      price: Number(item.stock.price.toFixed(2)),
      marketValue: Number(item.marketValue.toFixed(2)),
      profit: Number(item.profit.toFixed(2)),
      profitPercent: Number(item.profitPercent.toFixed(3)),
      changePercent: Number(item.stock.changePercent || 0),
    })),
  };
}

export const watchStocks = computed(() =>
  portfolio.watchlist.map((code) => getStock(code)).filter(Boolean),
);

export const recentStocks = computed(() =>
  portfolio.recentViews
    .map((item) => ({ ...item, stock: getStock(item.code) }))
    .filter((item) => item.stock),
);

export const suggestedStocks = computed(() =>
  stocks
    .filter((stock) => !portfolio.watchlist.includes(stock.code))
    .slice(0, 3),
);

export const unreadNotificationCount = computed(
  () => portfolio.notifications.filter((notification) => !notification.read).length,
);

export const activeAlertCount = computed(
  () => portfolio.alerts.filter((alert) => !alert.triggered).length,
);
