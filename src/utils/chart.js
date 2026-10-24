export function hashString(value) {
  return String(value)
    .split("")
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
}

export function seededRandom(seed) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createIntradaySeries(stock, count = 48) {
  const random = seededRandom(hashString(`${stock.code}-${stock.price}`));
  const previous = Number(stock.prevClose);
  const current = Number(stock.price);
  const opening = Number(stock.open);
  const values = [];
  let value = opening;

  for (let index = 0; index < count; index += 1) {
    const progress = index / (count - 1);
    const pullToClose = (current - value) * (progress ** 3) * 0.16;
    const volatility = previous * (0.0007 + random() * 0.0015);
    value += (random() - 0.48) * volatility + pullToClose;
    values.push(Number(value.toFixed(2)));
  }

  values[0] = opening;
  values[values.length - 1] = current;
  return values;
}

export function createCandles(stock, count = 28) {
  const random = seededRandom(hashString(`${stock.code}-candles`));
  const result = [];
  let close = Number(stock.prevClose) * 0.93;

  for (let index = 0; index < count - 1; index += 1) {
    const open = close * (0.992 + random() * 0.016);
    const wave = Math.sin(index / 3.9) * 0.012;
    close = open * (0.987 + random() * 0.029 + wave * 0.08);
    const high = Math.max(open, close) * (1.004 + random() * 0.014);
    const low = Math.min(open, close) * (0.983 + random() * 0.01);
    result.push({
      open: Number(open.toFixed(2)),
      close: Number(close.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
    });
  }

  const lastClose = Number(stock.price);
  const lastOpen = lastClose * (0.986 + random() * 0.016);
  result.push({
    open: Number(lastOpen.toFixed(2)),
    close: lastClose,
    high: Number((Math.max(lastOpen, lastClose) * 1.009).toFixed(2)),
    low: Number((Math.min(lastOpen, lastClose) * 0.991).toFixed(2)),
  });
  return result;
}

export function createSparklinePoints(seed, count = 18) {
  const random = seededRandom(hashString(seed));
  const points = [];
  let value = 32 + random() * 20;

  for (let index = 0; index < count; index += 1) {
    value += (random() - 0.46) * 6;
    points.push(value);
  }
  return points;
}
