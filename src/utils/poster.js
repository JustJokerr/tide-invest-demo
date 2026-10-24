export const POSTER_COLORS = {
  background: "#071520",
  backgroundEnd: "#0a1b27",
  panel: "rgba(18, 45, 60, 0.78)",
  panelLight: "rgba(28, 62, 78, 0.58)",
  line: "rgba(150, 207, 214, 0.16)",
  text: "#f2f7f9",
  muted: "#7d97a6",
  faint: "#5d7888",
  cyan: "#8ee5e4",
  rise: "#f1736b",
  fall: "#2bc89b",
  gold: "#e7c373",
};

export function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

export function drawPosterBackground(context, width, height, accent = "#71d4d5") {
  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#06121d");
  background.addColorStop(0.52, "#0b2432");
  background.addColorStop(1, "#07141f");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(width * 0.82, 40, 20, width * 0.82, 40, width * 0.55);
  glow.addColorStop(0, hexToRgba(accent, 0.23));
  glow.addColorStop(1, hexToRgba(accent, 0));
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height * 0.58);

  context.strokeStyle = hexToRgba(accent, 0.08);
  context.lineWidth = 1.5;
  for (let radius = 180; radius < 620; radius += 78) {
    context.beginPath();
    context.arc(width - 60, 30, radius, Math.PI * 0.25, Math.PI * 1.65);
    context.stroke();
  }

  const vignette = context.createLinearGradient(0, height * 0.7, 0, height);
  vignette.addColorStop(0, "rgba(4, 12, 19, 0)");
  vignette.addColorStop(1, "rgba(3, 10, 16, 0.46)");
  context.fillStyle = vignette;
  context.fillRect(0, height * 0.7, width, height * 0.3);
}

export function drawBrand(context, x = 72, y = 60) {
  context.fillStyle = "#9fe9e9";
  roundRect(context, x, y, 56, 56, 16);
  context.fill();
  context.fillStyle = "#0a2630";
  [18, 30, 42].forEach((barHeight, index) => {
    context.fillRect(x + 10 + index * 11, y + 45 - barHeight, 7, barHeight);
  });
  context.fillStyle = POSTER_COLORS.text;
  context.font = '600 36px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("观潮", x + 74, y + 40);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '600 15px "Avenir Next", sans-serif';
  context.fillText("TIDE MARKET LAB · 模拟投资记录", x + 75, y + 66);
}

export function drawPill(context, text, x, y, color = POSTER_COLORS.cyan) {
  context.font = '600 17px "Microsoft YaHei", "PingFang SC", sans-serif';
  const width = context.measureText(text).width + 28;
  roundRect(context, x, y, width, 34, 17);
  context.fillStyle = hexToRgba(color, 0.12);
  context.fill();
  context.strokeStyle = hexToRgba(color, 0.24);
  context.lineWidth = 1;
  context.stroke();
  context.fillStyle = color;
  context.fillText(text, x + 14, y + 23);
  return width;
}

export function drawMetricCard(context, { x, y, width, height, label, value, note, tone = POSTER_COLORS.text }) {
  roundRect(context, x, y, width, height, 18);
  context.fillStyle = POSTER_COLORS.panelLight;
  context.fill();
  context.strokeStyle = POSTER_COLORS.line;
  context.stroke();
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 17px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(label, x + 20, y + 30);
  context.fillStyle = tone;
  context.font = '700 29px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(value, x + 20, y + 67);
  if (note) {
    context.fillStyle = POSTER_COLORS.faint;
    context.font = '500 14px "Microsoft YaHei", "PingFang SC", sans-serif';
    context.fillText(note, x + 20, y + 90);
  }
}

export function drawLineChart(context, values, box, color) {
  const { x, y, width, height } = box;
  if (!values?.length) return;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => ({
    x: x + (index / Math.max(1, values.length - 1)) * width,
    y: y + height - ((value - min) / range) * (height - 18),
  }));

  context.strokeStyle = "rgba(164, 205, 214, 0.09)";
  context.lineWidth = 1;
  context.setLineDash([6, 8]);
  for (let index = 0; index < 4; index += 1) {
    const gridY = y + (index * height) / 3;
    context.beginPath();
    context.moveTo(x, gridY);
    context.lineTo(x + width, gridY);
    context.stroke();
  }
  context.setLineDash([]);

  const fill = context.createLinearGradient(0, y, 0, y + height);
  fill.addColorStop(0, hexToRgba(color, 0.3));
  fill.addColorStop(1, hexToRgba(color, 0));
  context.beginPath();
  context.moveTo(points[0].x, y + height);
  points.forEach((point) => context.lineTo(point.x, point.y));
  context.lineTo(points.at(-1).x, y + height);
  context.closePath();
  context.fillStyle = fill;
  context.fill();

  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else {
      const previous = points[index - 1];
      const controlX = (previous.x + point.x) / 2;
      context.bezierCurveTo(controlX, previous.y, controlX, point.y, point.x, point.y);
    }
  });
  context.strokeStyle = color;
  context.lineWidth = 4.2;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();

  const last = points.at(-1);
  context.beginPath();
  context.arc(last.x, last.y, 6, 0, Math.PI * 2);
  context.fillStyle = "#ffffff";
  context.fill();
  context.beginPath();
  context.arc(last.x, last.y, 3, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
}

export function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
