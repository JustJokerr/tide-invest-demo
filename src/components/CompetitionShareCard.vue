<script setup>
import { nextTick, ref, watch } from "vue";
import Icon from "./Icon.vue";
import { formatMoney } from "../stores/useMarket";
import { formatPct, formatPrice } from "../utils/display";
import {
  POSTER_COLORS,
  drawBrand,
  drawMetricCard,
  drawPill,
  drawPosterBackground,
  roundRect,
} from "../utils/poster";

const props = defineProps({
  open: { type: Boolean, default: false },
  participant: { type: Object, default: null },
  roomCode: { type: String, default: "" },
});
const emit = defineEmits(["close", "notify"]);
const canvasRef = ref(null);
const previewUrl = ref("");
let blob = null;

function formatSignedMoney(value) {
  const number = Number(value) || 0;
  return `${number > 0 ? "+" : ""}¥${formatMoney(number, 0)}`;
}

async function drawCard() {
  if (!props.participant || !canvasRef.value) return;
  await document.fonts?.ready;
  const participant = props.participant;
  const positions = participant.positions || [];
  const canvas = canvasRef.value;
  const rowHeight = 88;
  const height = Math.max(1080, 746 + positions.length * rowHeight + 90);
  canvas.width = 1080;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  drawPosterBackground(context, width, height, "#e4bd6a");
  drawBrand(context);
  drawPill(context, `竞技排行 #${participant.rank || "—"}`, 790, 68, POSTER_COLORS.gold);

  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 20px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(`观潮好友竞技 · 口令 ${props.roomCode}`, 72, 190);
  context.fillStyle = POSTER_COLORS.text;
  context.font = '700 60px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(participant.name, 72, 267);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 20px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("模拟组合战绩卡", 74, 302);

  const totalReturn = Number(participant.returnPercent) || 0;
  context.fillStyle = totalReturn >= 0 ? POSTER_COLORS.rise : POSTER_COLORS.fall;
  context.font = '700 72px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(formatPct(totalReturn), 72, 402);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 19px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("加入以来总收益率", 74, 435);

  context.fillStyle = POSTER_COLORS.text;
  context.font = '700 47px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(`¥${formatMoney(participant.totalAssets, 0)}`, 638, 397);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 18px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("当前模拟总资产", 640, 427);

  const metrics = [
    ["今日收益", formatPct(participant.dailyPercent || 0), "最近交易日"],
    ["持仓盈亏", formatSignedMoney(participant.totalProfit), "模拟持仓"],
    ["当前仓位", formatPct(participant.positionPercent || 0), `${participant.holdingCount || positions.length} 个持仓`],
    ["最大单仓", formatPct(participant.maxHoldingPercent || 0), "集中度"],
  ];
  metrics.forEach(([label, value, note], index) => {
    drawMetricCard(context, {
      x: 72 + index * 236,
      y: 474,
      width: 216,
      height: 96,
      label,
      value,
      note,
      tone:
        value.startsWith("-")
          ? POSTER_COLORS.fall
          : value.startsWith("+")
            ? POSTER_COLORS.rise
            : POSTER_COLORS.text,
    });
  });

  roundRect(context, 72, 601, 936, 54, 14);
  context.fillStyle = "rgba(23, 53, 66, .9)";
  context.fill();
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '600 16px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("持仓股票", 98, 635);
  context.fillText("平均成本", 492, 635);
  context.fillText("现价", 658, 635);
  context.fillText("持仓盈亏", 825, 635);

  positions.forEach((position, index) => {
    const y = 669 + index * rowHeight;
    context.fillStyle = index % 2 ? "rgba(16, 41, 54, .58)" : "rgba(22, 52, 66, .72)";
    roundRect(context, 72, y, 936, 77, 14);
    context.fill();
    context.fillStyle = POSTER_COLORS.text;
    context.font = '600 21px "Microsoft YaHei", "PingFang SC", sans-serif';
    context.fillText((position.name || "").slice(0, 8), 98, y + 32);
    context.fillStyle = POSTER_COLORS.faint;
    context.font = '500 14px "Avenir Next", sans-serif';
    context.fillText(`${position.code || ""} · ${position.shares || 0} 股`, 98, y + 57);
    context.fillStyle = "#dce7ed";
    context.font = '600 20px "Avenir Next", sans-serif';
    context.fillText(`¥${formatPrice(position.avgCost)}`, 492, y + 45);
    context.fillText(`¥${formatPrice(position.price)}`, 658, y + 45);
    context.fillStyle = Number(position.profit) >= 0 ? POSTER_COLORS.rise : POSTER_COLORS.fall;
    context.font = '700 21px "Avenir Next", "Microsoft YaHei", sans-serif';
    context.fillText(formatSignedMoney(position.profit), 825, y + 35);
    context.font = '600 14px "Avenir Next", sans-serif';
    context.fillText(formatPct(position.profitPercent), 825, y + 58);
  });

  const footerY = 746 + positions.length * rowHeight;
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 16px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("比赛按加入时模拟资产为基准计算收益率；持仓数据由参赛账号同步。", 72, footerY);
  context.fillStyle = POSTER_COLORS.cyan;
  context.font = '600 17px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("观潮 · 好友模拟投资竞技", 72, footerY + 35);

  previewUrl.value = canvas.toDataURL("image/png");
  canvas.toBlob((result) => {
    blob = result;
  }, "image/png");
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    await nextTick();
    await drawCard();
  },
);

function save() {
  if (!previewUrl.value || !props.participant) return;
  const link = document.createElement("a");
  link.href = previewUrl.value;
  link.download = `观潮-竞技-${props.participant.name}.png`;
  link.click();
}

async function share() {
  if (!blob || !props.participant) return;
  const file = new File([blob], `观潮-竞技-${props.participant.name}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `${props.participant.name} 竞技战绩`, text: "观潮好友竞技战绩卡" });
      return;
    } catch {
      // Fall back to downloading the generated image.
    }
  }
  save();
  emit("notify", "已生成竞技战绩图并开始下载");
}
</script>

<template>
  <Transition name="sheet">
    <div v-if="open && participant" class="share-backdrop" @click.self="$emit('close')">
      <section class="share-sheet competitor-share-sheet" role="dialog" aria-modal="true">
        <header class="share-sheet-header">
          <div><span>COMPETITION CARD</span><h2>好友竞技战绩图</h2></div>
          <button type="button" class="icon-button" aria-label="关闭" @click="$emit('close')"><Icon name="close" :size="20" /></button>
        </header>
        <div class="share-preview"><img v-if="previewUrl" :src="previewUrl" alt="好友竞技战绩图片" /></div>
        <div class="share-actions">
          <button type="button" class="secondary-button" @click="save" :disabled="!previewUrl">保存图片</button>
          <button type="button" class="primary-button" @click="share" :disabled="!previewUrl">分享战绩</button>
        </div>
        <canvas ref="canvasRef" class="share-canvas" />
      </section>
    </div>
  </Transition>
</template>
