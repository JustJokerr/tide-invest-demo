<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import Icon from "../components/Icon.vue";
import { account, formatMoney, holdings, portfolio } from "../stores/useMarket";
import { formatPct, formatPrice, trendClass } from "../utils/display";
import {
  POSTER_COLORS,
  drawBrand,
  drawMetricCard,
  drawPill,
  drawPosterBackground,
  roundRect,
} from "../utils/poster";

const emit = defineEmits(["back", "notify"]);
const periods = [
  { id: "day", label: "天", days: 1 },
  { id: "week", label: "周", days: 5 },
  { id: "month", label: "月", days: 22 },
  { id: "year", label: "年", days: 250 },
  { id: "history", label: "历史汇总", days: null },
];
const selected = ref("day");
const loading = ref(false);
const error = ref("");
const chartCache = reactive({});
const shareOpen = ref(false);
const previewUrl = ref("");
const canvasRef = ref(null);
let reportBlob = null;

const currentPeriod = computed(() => periods.find((item) => item.id === selected.value));

function closeForPeriod(code, item) {
  const points = chartCache[code];
  if (!points?.length) {
    return selected.value === "day" ? item.stock.prevClose : item.avgCost;
  }
  const offset = Math.min(currentPeriod.value.days + 1, points.length);
  return points[points.length - offset]?.close || points[0].close;
}

const rows = computed(() =>
  holdings.value.map((item) => {
    const startPrice =
      selected.value === "history" ? item.avgCost : closeForPeriod(item.code, item);
    const profit = (item.stock.price - startPrice) * item.shares;
    const profitPercent = startPrice ? (profit / (startPrice * item.shares)) * 100 : 0;
    return {
      ...item,
      startPrice,
      profit,
      profitPercent,
      estimated: selected.value !== "day" && selected.value !== "history" && !chartCache[item.code]?.length,
    };
  }),
);

const periodMilliseconds = computed(() => {
  if (selected.value === "day") return 86400000;
  if (selected.value === "week") return 7 * 86400000;
  if (selected.value === "month") return 31 * 86400000;
  if (selected.value === "year") return 366 * 86400000;
  return Number.POSITIVE_INFINITY;
});

const realizedTrades = computed(() =>
  portfolio.ledger.filter(
    (entry) =>
      entry.type === "sell" &&
      Number(entry.timestamp) &&
      Date.now() - Number(entry.timestamp) <= periodMilliseconds.value,
  ),
);

const realizedRows = computed(() => {
  const groups = {};
  realizedTrades.value.forEach((entry) => {
    const group = groups[entry.code] || {
      code: entry.code,
      name: entry.name,
      shares: 0,
      avgCost: 0,
      profit: 0,
      kind: "sold",
    };
    const shares = Number(entry.shares || 0);
    const priorValue = group.avgCost * group.shares;
    group.avgCost = (priorValue + Number(entry.avgCostAtSale || 0) * shares) / (group.shares + shares);
    group.shares += shares;
    group.profit += Number(entry.realizedProfit || 0);
    groups[entry.code] = group;
  });
  return Object.values(groups).map((item) => ({
    ...item,
    profitPercent: item.avgCost && item.shares ? (item.profit / (item.avgCost * item.shares)) * 100 : 0,
  }));
});

const realizedProfit = computed(() => realizedRows.value.reduce((sum, row) => sum + row.profit, 0));
const allReportRows = computed(() => [...rows.value.map((row) => ({ ...row, kind: "holding" })), ...realizedRows.value]);
const totalProfit = computed(() => rows.value.reduce((sum, row) => sum + row.profit, 0) + realizedProfit.value);
const periodLabel = computed(
  () =>
    ({
      day: "今日",
      week: "近 7 日",
      month: "近 30 日",
      year: "近 1 年",
      history: "历史累计",
    })[selected.value],
);

async function loadHistory() {
  if (selected.value === "day" || selected.value === "history") return;
  const missing = holdings.value.map((item) => item.stock).filter((stock) => !chartCache[stock.code]);
  if (!missing.length) return;
  loading.value = true;
  error.value = "";
  const results = await Promise.allSettled(
    missing.map(async (stock) => {
      const response = await fetch(`/api/chart?secid=${stock.secid}&mode=kline&limit=251`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "历史行情不可用");
      return [stock.code, payload.points || []];
    }),
  );
  results.forEach((result) => {
    if (result.status === "fulfilled") chartCache[result.value[0]] = result.value[1];
  });
  if (results.every((result) => result.status === "rejected")) {
    error.value = "历史行情暂时不可用，已使用平均成本估算";
  }
  loading.value = false;
}

watch(selected, loadHistory);
onMounted(loadHistory);

async function createReportImage() {
  if (!canvasRef.value) return;
  await document.fonts?.ready;
  const canvas = canvasRef.value;
  const context = canvas.getContext("2d");
  const rowHeight = 95;
  const height = Math.max(1080, 565 + allReportRows.value.length * rowHeight + 150);
  canvas.width = 1080;
  canvas.height = height;
  const width = canvas.width;
  drawPosterBackground(context, width, height, "#77d6ce");
  drawBrand(context);
  drawPill(context, `${periodLabel.value}财报`, 812, 68, POSTER_COLORS.gold);

  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 20px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(`模拟投资总结 · ${new Date().toLocaleDateString("zh-CN")}`, 72, 190);
  context.fillStyle = POSTER_COLORS.text;
  context.font = '700 58px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(`¥${formatMoney(account.value.totalAssets)}`, 72, 266);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 19px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("模拟总资产", 74, 298);

  context.fillStyle = totalProfit.value >= 0 ? POSTER_COLORS.rise : POSTER_COLORS.fall;
  context.font = '700 42px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(`${totalProfit.value >= 0 ? "+" : ""}¥${formatMoney(totalProfit.value)}`, 716, 260);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 18px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(`${periodLabel.value}盈亏`, 718, 291);

  const summaryCards = [
    ["持仓市值", `¥${formatMoney(account.value.marketValue, 0)}`, "按实时行情计算"],
    ["可用资金", `¥${formatMoney(portfolio.cash, 0)}`, "可用于模拟交易"],
    ["已实现盈亏", `${realizedProfit.value >= 0 ? "+" : ""}¥${formatMoney(realizedProfit.value, 0)}`, "来自已卖出持仓"],
  ];
  summaryCards.forEach(([label, value, note], index) => {
    drawMetricCard(context, {
      x: 72 + index * 321,
      y: 335,
      width: 294,
      height: 94,
      label,
      value,
      note,
      tone: index === 2 ? (realizedProfit.value >= 0 ? POSTER_COLORS.rise : POSTER_COLORS.fall) : POSTER_COLORS.text,
    });
  });

  roundRect(context, 72, 458, 936, 58, 16);
  context.fillStyle = "rgba(23, 54, 68, .88)";
  context.fill();
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '600 17px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("股票 / 持仓", 98, 493);
  context.fillText("平均买入价", 508, 493);
  context.fillText("期初参考", 704, 493);
  context.fillText("盈亏金额", 846, 493);

  allReportRows.value.forEach((row, index) => {
    const y = 527 + index * rowHeight;
    context.fillStyle = index % 2 === 0 ? "rgba(20, 49, 63, .72)" : "rgba(16, 41, 55, .56)";
    roundRect(context, 72, y, 936, 84, 14);
    context.fill();
    context.fillStyle = POSTER_COLORS.text;
    context.font = '600 23px "Microsoft YaHei", "PingFang SC", sans-serif';
    context.fillText((row.name || row.stock?.name || "").slice(0, 8), 98, y + 36);
    context.fillStyle = POSTER_COLORS.faint;
    context.font = '500 15px "Avenir Next", sans-serif';
    context.fillText(`${row.code} · ${row.shares} 股${row.kind === "sold" ? " · 已卖出" : ""}`, 98, y + 62);
    context.fillStyle = "#dbe7ec";
    context.font = '600 21px "Avenir Next", sans-serif';
    context.fillText(`¥${formatPrice(row.avgCost)}`, 508, y + 50);
    context.fillText(`¥${formatPrice(row.startPrice || row.avgCost)}`, 704, y + 50);
    context.fillStyle = row.profit >= 0 ? POSTER_COLORS.rise : POSTER_COLORS.fall;
    context.font = '700 22px "Avenir Next", "Microsoft YaHei", sans-serif';
    context.fillText(`${row.profit >= 0 ? "+" : ""}¥${formatMoney(row.profit, 0)}`, 846, y + 36);
    context.font = '600 15px "Avenir Next", sans-serif';
    context.fillText(formatPct(row.profitPercent), 846, y + 61);
  });

  const footerY = 560 + allReportRows.value.length * rowHeight;
  drawPill(context, "模拟财报 · 非投资建议", 72, footerY, POSTER_COLORS.gold);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 16px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("天/周/月/年按对应期初收盘价估算，历史汇总按平均买入成本计算；不含真实资金。", 72, footerY + 68);
  context.fillStyle = POSTER_COLORS.cyan;
  context.font = '600 17px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("观潮 · A股行情与模拟交易", 72, footerY + 102);

  previewUrl.value = canvas.toDataURL("image/png");
  canvas.toBlob((value) => {
    reportBlob = value;
  }, "image/png");
}

async function openShare() {
  shareOpen.value = true;
  await nextTick();
  await createReportImage();
}

function saveReport() {
  if (!previewUrl.value) return;
  const link = document.createElement("a");
  link.href = previewUrl.value;
  link.download = `观潮-个人财报-${selected.value}.png`;
  link.click();
}

async function shareReport() {
  if (!reportBlob) return;
  const file = new File([reportBlob], `观潮-个人财报-${selected.value}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "观潮个人模拟财报", text: "我的 A 股模拟投资财报" });
      return;
    } catch {
      // Fall back to downloading when the system share sheet is unavailable.
    }
  }
  saveReport();
  emit("notify", "已生成财报图片并开始下载");
}
</script>

<template>
  <div class="page report-view">
    <header class="detail-header report-header">
      <button type="button" class="icon-button" aria-label="返回" @click="emit('back')">
        <Icon name="arrowLeft" :size="21" />
      </button>
      <div class="detail-title">
        <strong>个人财报</strong>
        <span>收益汇总与持仓明细</span>
      </div>
      <button type="button" class="icon-button" aria-label="分享财报" @click="openShare">
        <Icon name="share" :size="19" />
      </button>
    </header>

    <main>
      <section class="report-hero">
        <span>模拟账户总资产</span>
        <strong>¥{{ formatMoney(account.totalAssets) }}</strong>
        <div>
          <span>{{ selected === "history" ? "累计盈亏" : "本期盈亏" }}</span>
          <strong :class="trendClass(totalProfit)">{{ totalProfit >= 0 ? "+" : "" }}¥{{ formatMoney(totalProfit) }}</strong>
        </div>
        <em>{{ periodLabel }}</em>
      </section>

      <div class="segmented report-periods">
        <button v-for="item in periods" :key="item.id" type="button" :class="{ active: selected === item.id }" @click="selected = item.id">
          {{ item.label }}
        </button>
      </div>

      <div v-if="loading" class="report-loading"><i class="loading-ring" />正在读取历史收盘价</div>
      <p v-else-if="error" class="report-warning"><Icon name="info" :size="14" />{{ error }}</p>

      <section class="report-summary">
        <div><span>持仓市值</span><strong>¥{{ formatMoney(account.marketValue, 0) }}</strong></div>
        <div><span>可用资金</span><strong>¥{{ formatMoney(portfolio.cash, 0) }}</strong></div>
        <div><span>已实现盈亏</span><strong :class="trendClass(realizedProfit)">{{ realizedProfit >= 0 ? "+" : "" }}¥{{ formatMoney(realizedProfit, 0) }}</strong></div>
      </section>

      <section class="report-holdings">
        <div class="section-heading compact">
          <div>
            <span>POSITION DETAIL</span>
            <h2>每只股票盈亏</h2>
          </div>
          <em>{{ rows.length }} 个持仓</em>
        </div>
        <article v-for="row in rows" :key="row.code">
          <div class="report-stock-name">
            <span class="stock-monogram">{{ row.stock.name.slice(0, 1) }}</span>
            <div><strong>{{ row.stock.name }}</strong><small>{{ row.code }} · {{ row.shares }} 股</small></div>
          </div>
          <div><span>平均买入价</span><strong>¥{{ formatPrice(row.avgCost) }}</strong></div>
          <div><span>期初参考</span><strong>¥{{ formatPrice(row.startPrice) }}</strong></div>
          <div><span>盈亏金额</span><strong :class="trendClass(row.profit)">{{ row.profit >= 0 ? "+" : "" }}¥{{ formatMoney(row.profit, 0) }}</strong></div>
          <div><span>收益率</span><strong :class="trendClass(row.profitPercent)">{{ formatPct(row.profitPercent) }}</strong></div>
          <em v-if="row.estimated">成本估算</em>
        </article>
      </section>

      <section v-if="realizedRows.length" class="report-holdings">
        <div class="section-heading compact">
          <div>
            <span>REALIZED DETAIL</span>
            <h2>已卖出股票</h2>
          </div>
          <em>{{ realizedRows.length }} 个标的</em>
        </div>
        <article v-for="row in realizedRows" :key="row.code">
          <div class="report-stock-name">
            <span class="stock-monogram">{{ row.name.slice(0, 1) }}</span>
            <div><strong>{{ row.name }}</strong><small>{{ row.code }} · {{ row.shares }} 股 · 已卖出</small></div>
          </div>
          <div><span>平均买入价</span><strong>¥{{ formatPrice(row.avgCost) }}</strong></div>
          <div><span>实现盈亏</span><strong :class="trendClass(row.profit)">{{ row.profit >= 0 ? "+" : "" }}¥{{ formatMoney(row.profit, 0) }}</strong></div>
          <div><span>已实现收益率</span><strong :class="trendClass(row.profitPercent)">{{ formatPct(row.profitPercent) }}</strong></div>
        </article>
      </section>

      <button type="button" class="report-share-button" @click="openShare">
        <Icon name="share" :size="18" />
        生成并分享个人财报
      </button>
      <p class="research-disclaimer">日、周、月、年盈亏按对应期初收盘价至当前价估算；历史汇总按模拟持仓的平均买入成本计算。统计不含真实证券资金。</p>
    </main>

    <Transition name="sheet">
      <div v-if="shareOpen" class="share-backdrop" @click.self="shareOpen = false">
        <section class="share-sheet report-share-sheet" role="dialog" aria-modal="true">
          <header class="share-sheet-header">
            <div><span>REPORT CARD</span><h2>{{ periodLabel }}财报图片</h2></div>
            <button type="button" class="icon-button" aria-label="关闭" @click="shareOpen = false"><Icon name="close" :size="20" /></button>
          </header>
          <div class="share-preview"><img v-if="previewUrl" :src="previewUrl" alt="个人模拟财报图片" /></div>
          <div class="share-actions">
            <button type="button" class="secondary-button" @click="saveReport">保存图片</button>
            <button type="button" class="primary-button" @click="shareReport">分享财报</button>
          </div>
          <canvas ref="canvasRef" class="share-canvas" />
        </section>
      </div>
    </Transition>
  </div>
</template>
