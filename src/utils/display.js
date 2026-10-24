export function formatPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount === 0) return "—";
  return amount.toFixed(2);
}

export function formatPct(value) {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `${amount > 0 ? "+" : ""}${amount.toFixed(2)}%`;
}

export function trendClass(value) {
  if (Number(value) > 0) return "rise";
  if (Number(value) < 0) return "fall";
  return "flat";
}

export function formatCompactMoney(value) {
  const amount = Number(value || 0);
  if (Math.abs(amount) >= 100000000) return `${(amount / 100000000).toFixed(2)}亿`;
  if (Math.abs(amount) >= 10000) return `${(amount / 10000).toFixed(2)}万`;
  return amount.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
}
