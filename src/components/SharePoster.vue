<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import Icon from "./Icon.vue";
import { formatCompactMoney, formatVolume } from "../stores/useMarket";
import { formatPct, formatPrice } from "../utils/display";
import {
  POSTER_COLORS,
  drawBrand,
  drawLineChart,
  drawMetricCard,
  drawPill,
  drawPosterBackground,
  roundRect,
} from "../utils/poster";

const props = defineProps({
  open: { type: Boolean, default: false },
  stock: { type: Object, default: null },
});

const emit = defineEmits(["close", "notify"]);
const canvasRef = ref(null);
const previewUrl = ref("");
const generating = ref(false);
let blob = null;

function stockPercent() {
  if (!props.stock?.prevClose) return 0;
  return ((props.stock.price - props.stock.prevClose) / props.stock.prevClose) * 100;
}

function drawPoster() {
  if (!props.stock || !canvasRef.value) return;
  generating.value = true;
  const canvas = canvasRef.value;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const stock = props.stock;
  const change = stockPercent();
  const accent = change >= 0 ? POSTER_COLORS.rise : POSTER_COLORS.fall;

  drawPosterBackground(context, width, height, "#6ed8d6");
  drawBrand(context);
  drawPill(context, stock.live ? "公开实时行情" : "最近行情", 836, 68, accent);

  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 21px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(`${stock.market || "A股"} · ${stock.sector || "上市公司"} · ${new Date().toLocaleDateString("zh-CN")}`, 72, 196);

  context.fillStyle = POSTER_COLORS.text;
  context.font = '700 67px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(stock.name, 72, 279);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 24px "Avenir Next", sans-serif';
  context.fillText(`${stock.code} · 模拟行情分享`, 74, 318);

  context.fillStyle = accent;
  context.font = '700 88px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(`¥${formatPrice(stock.price)}`, 72, 430);
  context.font = '600 27px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(`${change >= 0 ? "+" : ""}${formatPrice(stock.price - stock.prevClose)}   ${formatPct(change)}`, 75, 473);

  roundRect(context, 72, 525, 936, 328, 30);
  context.fillStyle = POSTER_COLORS.panel;
  context.fill();
  context.strokeStyle = POSTER_COLORS.line;
  context.lineWidth = 1.5;
  context.stroke();

  context.fillStyle = POSTER_COLORS.text;
  context.font = '600 21px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("行情轨迹", 103, 568);
  context.fillStyle = POSTER_COLORS.faint;
  context.font = '500 15px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("盘中/最近价格变化", 103, 593);
  const values =
    stock.history?.length > 2
      ? stock.history.slice(-24)
      : [stock.prevClose || stock.price, (stock.prevClose + stock.price) / 2, stock.price];
  drawLineChart(context, values, { x: 104, y: 607, width: 862, height: 210 }, accent);

  const metricWidth = 294;
  const metrics = [
    { label: "今开", value: formatPrice(stock.open), note: "当日开盘" },
    { label: "最高", value: formatPrice(stock.high), note: "日内高点", tone: POSTER_COLORS.rise },
    { label: "最低", value: formatPrice(stock.low), note: "日内低点", tone: POSTER_COLORS.fall },
    { label: "成交量", value: formatVolume(stock.volume), note: "公开行情" },
    { label: "成交额", value: formatCompactMoney(stock.amount), note: "公开行情" },
    {
      label: "换手率",
      value: stock.turnover ? `${Number(stock.turnover).toFixed(2)}%` : "—",
      note: "流通活跃度",
    },
  ];
  metrics.forEach((metric, index) => {
    drawMetricCard(context, {
      x: 72 + (index % 3) * 321,
      y: 890 + Math.floor(index / 3) * 118,
      width: metricWidth,
      height: 102,
      ...metric,
    });
  });

  context.strokeStyle = "rgba(147, 194, 204, 0.13)";
  context.beginPath();
  context.moveTo(72, 1181);
  context.lineTo(1008, 1181);
  context.stroke();

  drawPill(context, "模拟分析参考", 72, 1203, POSTER_COLORS.gold);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 17px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("数据来自公开市场接口，可能存在延迟；不构成投资建议。", 72, 1282);
  context.fillStyle = POSTER_COLORS.cyan;
  context.font = '600 18px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("观潮 · A股行情与模拟交易", 72, 1318);

  previewUrl.value = canvas.toDataURL("image/png");
  canvas.toBlob((result) => {
    blob = result;
    generating.value = false;
  }, "image/png");
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    await nextTick();
    await document.fonts?.ready;
    drawPoster();
  },
);

onBeforeUnmount(() => {
  blob = null;
});

async function shareImage() {
  if (!blob || !props.stock) return;
  const file = new File([blob], `观潮-${props.stock.code}-行情分享.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `${props.stock.name} 行情`,
        text: `${props.stock.name} ${formatPrice(props.stock.price)} ${formatPct(stockPercent())}｜观潮`,
      });
      return;
    } catch {
      // The download fallback also handles a dismissed system share sheet.
    }
  }
  saveImage();
  emit("notify", "当前浏览器不支持系统分享，已改为下载图片");
}

function saveImage() {
  if (!previewUrl.value || !props.stock) return;
  const link = document.createElement("a");
  link.href = previewUrl.value;
  link.download = `观潮-${props.stock.code}-行情分享.png`;
  link.click();
}
</script>

<template>
  <Transition name="sheet">
    <div v-if="open && stock" class="share-backdrop" @click.self="$emit('close')">
      <section class="share-sheet" role="dialog" aria-modal="true" aria-label="生成分享图片">
        <header class="share-sheet-header">
          <div>
            <span>SHARE CARD</span>
            <h2>行情分享图</h2>
          </div>
          <button type="button" class="icon-button" aria-label="关闭" @click="$emit('close')">
            <Icon name="close" :size="20" />
          </button>
        </header>
        <div class="share-preview">
          <img v-if="previewUrl" :src="previewUrl" alt="股票行情分享图片" />
          <div v-else class="share-loading"><i class="loading-ring" /> 正在生成图片</div>
        </div>
        <div class="share-actions">
          <button type="button" class="secondary-button" @click="saveImage" :disabled="!previewUrl">保存图片</button>
          <button type="button" class="primary-button" @click="shareImage" :disabled="!previewUrl || generating">分享行情图</button>
        </div>
        <canvas ref="canvasRef" width="1080" height="1350" class="share-canvas" />
      </section>
    </div>
  </Transition>
</template>
