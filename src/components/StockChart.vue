<script setup>
import { computed, onMounted, ref, useId, watch } from "vue";
import Icon from "./Icon.vue";
import { formatPct, formatPrice, trendClass } from "../utils/display";

const props = defineProps({
  stock: { type: Object, required: true },
});

const mode = ref("intraday");
const period = ref("3M");
const activeIndex = ref(-1);
const loading = ref(false);
const error = ref("");
const trendPoints = ref([]);
const candlePoints = ref([]);
const preClose = ref(0);
const gradientId = `chart-${useId().replaceAll(":", "")}`;
const chartCache = new Map();

const width = 360;
const height = 218;
const plot = { left: 8, right: 352, top: 18, bottom: 178 };
const periods = [
  { id: "1M", label: "1月", limit: 24 },
  { id: "3M", label: "3月", limit: 66 },
  { id: "6M", label: "6月", limit: 132 },
  { id: "1Y", label: "1年", limit: 250 },
];

const percent = computed(() => {
  if (!props.stock.prevClose) return 0;
  return ((props.stock.price - props.stock.prevClose) / props.stock.prevClose) * 100;
});

const intradayGeometry = computed(() => {
  if (!trendPoints.value.length) return { points: [], line: "", area: "", previousY: 0 };
  const values = [...trendPoints.value.map((item) => item.price), preClose.value || props.stock.prevClose];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = trendPoints.value.map((item, index) => {
    const x = plot.left + (index / Math.max(1, trendPoints.value.length - 1)) * (plot.right - plot.left);
    const y = plot.top + ((max - item.price) / range) * (plot.bottom - plot.top);
    return { x, y, value: item.price, time: item.time, average: item.average, index };
  });
  const line = points.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `M${points[0].x},${plot.bottom} L${line.replaceAll(" ", " L")} L${points.at(-1).x},${plot.bottom} Z`;
  const previousY = plot.top + ((max - (preClose.value || props.stock.prevClose)) / range) * (plot.bottom - plot.top);
  return { points, line, area, min, max, previousY };
});

const candleGeometry = computed(() => {
  if (!candlePoints.value.length) return [];
  const allValues = candlePoints.value.flatMap((item) => [item.high, item.low]);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;
  const available = plot.right - plot.left;
  const step = available / candlePoints.value.length;
  const candleWidth = Math.max(0.85, step * 0.55);
  return candlePoints.value.map((item, index) => {
    const center = plot.left + step * index + step / 2;
    const y = (value) => plot.top + ((max - value) / range) * (plot.bottom - plot.top);
    return {
      ...item,
      index,
      center,
      candleWidth,
      wickTop: y(item.high),
      wickBottom: y(item.low),
      bodyTop: y(Math.max(item.open, item.close)),
      bodyHeight: Math.max(1.1, Math.abs(y(item.open) - y(item.close))),
      rising: item.close >= item.open,
    };
  });
});

const activeIntraday = computed(() => {
  if (mode.value !== "intraday" || !intradayGeometry.value.points.length) return null;
  const index = activeIndex.value >= 0 ? activeIndex.value : intradayGeometry.value.points.length - 1;
  return intradayGeometry.value.points[index];
});

const activeCandle = computed(() => {
  if (mode.value !== "candle" || !candleGeometry.value.length) return null;
  const index = activeIndex.value >= 0 ? activeIndex.value : candleGeometry.value.length - 1;
  return candleGeometry.value[index];
});

const intradayTooltipLeft = computed(() =>
  activeIntraday.value ? Math.min(86, Math.max(14, (activeIntraday.value.x / width) * 100)) : 50,
);
const candleTooltipLeft = computed(() =>
  activeCandle.value ? Math.min(83, Math.max(17, (activeCandle.value.center / width) * 100)) : 50,
);

const times = computed(() => {
  if (mode.value === "candle") {
    const data = candlePoints.value;
    if (!data.length) return [];
    const indexes = [0, Math.floor((data.length - 1) / 3), Math.floor(((data.length - 1) * 2) / 3), data.length - 1];
    return indexes.map((index) => data[index].date.slice(5));
  }
  const data = trendPoints.value;
  if (!data.length) return [];
  const indexes = [0, Math.floor((data.length - 1) / 4), Math.floor((data.length - 1) / 2), Math.floor(((data.length - 1) * 3) / 4), data.length - 1];
  return indexes.map((index) => data[index].time);
});

async function loadChart() {
  const key = `${props.stock.secid}:${mode.value}:${mode.value === "candle" ? period.value : "1D"}`;
  if (chartCache.has(key)) {
    const cached = chartCache.get(key);
    trendPoints.value = cached.trendPoints || [];
    candlePoints.value = cached.candlePoints || [];
    preClose.value = cached.preClose || props.stock.prevClose;
    error.value = "";
    return;
  }

  loading.value = true;
  error.value = "";
  activeIndex.value = -1;
  try {
    const limit = mode.value === "candle" ? periods.find((item) => item.id === period.value)?.limit || 66 : 1;
    const query = new URLSearchParams({
      secid: props.stock.secid,
      mode: mode.value === "candle" ? "kline" : "trend",
      limit: String(limit),
    });
    const response = await fetch(`/api/chart?${query}`, { headers: { Accept: "application/json" } });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "图表数据加载失败");
    const cacheValue = {
      trendPoints: mode.value === "intraday" ? payload.points : [],
      candlePoints: mode.value === "candle" ? payload.points : [],
      preClose: payload.preClose || props.stock.prevClose,
    };
    chartCache.set(key, cacheValue);
    trendPoints.value = cacheValue.trendPoints;
    candlePoints.value = cacheValue.candlePoints;
    preClose.value = cacheValue.preClose;
  } catch (requestError) {
    trendPoints.value = [];
    candlePoints.value = [];
    error.value = requestError instanceof Error ? requestError.message : "图表数据加载失败";
  } finally {
    loading.value = false;
  }
}

function setMode(nextMode) {
  mode.value = nextMode;
  loadChart();
}

function setPeriod(nextPeriod) {
  period.value = nextPeriod;
  if (mode.value === "candle") loadChart();
}

function setActive(event) {
  const count = mode.value === "intraday" ? trendPoints.value.length : candlePoints.value.length;
  if (!count) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  activeIndex.value = Math.round(ratio * (count - 1));
}

watch(
  () => props.stock.secid,
  () => {
    chartCache.clear();
    mode.value = "intraday";
    loadChart();
  },
);

onMounted(loadChart);
</script>

<template>
  <section class="chart-card">
    <div class="chart-summary">
      <div>
        <span class="muted">当前价格 · 实时</span>
        <strong :class="trendClass(percent)">{{ formatPrice(stock.price) }}</strong>
      </div>
      <div class="chart-change" :class="trendClass(percent)">
        <span>{{ formatPct(percent) }}</span>
        <small>较昨收 {{ stock.price - stock.prevClose >= 0 ? "+" : "" }}{{ formatPrice(stock.price - stock.prevClose) }}</small>
      </div>
    </div>

    <div class="chart-toolbar">
      <div class="chart-tabs" role="tablist">
        <button type="button" :class="{ active: mode === 'intraday' }" @click="setMode('intraday')">
          分时
        </button>
        <button type="button" :class="{ active: mode === 'candle' }" @click="setMode('candle')">
          日 K
        </button>
      </div>
      <div v-if="mode === 'candle'" class="chart-periods compact">
        <button
          v-for="item in periods"
          :key="item.id"
          type="button"
          :class="{ active: period === item.id }"
          @click="setPeriod(item.id)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="chart-stage" @pointerdown="setActive" @pointermove="setActive">
      <div v-if="loading" class="chart-state">
        <i class="loading-ring" />
        <span>正在读取公开行情图表</span>
      </div>
      <div v-else-if="error" class="chart-state error">
        <Icon name="info" :size="22" />
        <strong>图表暂不可用</strong>
        <span>{{ error }}</span>
        <button type="button" @click="loadChart">重新加载</button>
      </div>

      <svg v-else :viewBox="`0 0 ${width} ${height}`" class="stock-chart" preserveAspectRatio="none">
        <defs>
          <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="percent >= 0 ? '#ff6b6b' : '#31d2a4'" stop-opacity=".22" />
            <stop offset="100%" :stop-color="percent >= 0 ? '#ff6b6b' : '#31d2a4'" stop-opacity="0" />
          </linearGradient>
        </defs>

        <line v-for="index in 4" :key="index" x1="8" x2="352" :y1="18 + index * 32" :y2="18 + index * 32" class="chart-grid" />
        <line x1="8" x2="352" y1="178" y2="178" class="chart-axis" />

        <template v-if="mode === 'intraday'">
          <line x1="8" x2="352" :y1="intradayGeometry.previousY" :y2="intradayGeometry.previousY" class="previous-line" />
          <path :d="intradayGeometry.area" :fill="`url(#${gradientId})`" />
          <polyline
            :points="intradayGeometry.line"
            fill="none"
            :stroke="percent >= 0 ? '#ff6b6b' : '#31d2a4'"
            stroke-width="2.1"
            stroke-linecap="round"
          />
          <line v-if="activeIntraday" :x1="activeIntraday.x" :x2="activeIntraday.x" y1="18" y2="178" class="crosshair" />
          <circle
            v-if="activeIntraday"
            :cx="activeIntraday.x"
            :cy="activeIntraday.y"
            r="4"
            fill="#fff"
            :stroke="percent >= 0 ? '#ff6b6b' : '#31d2a4'"
            stroke-width="2"
          />
        </template>

        <template v-else>
          <g v-for="candle in candleGeometry" :key="candle.index">
            <line
              :x1="candle.center"
              :x2="candle.center"
              :y1="candle.wickTop"
              :y2="candle.wickBottom"
              :stroke="candle.rising ? '#ff6b6b' : '#31d2a4'"
              stroke-width="1.1"
            />
            <rect
              :x="candle.center - candle.candleWidth / 2"
              :y="candle.bodyTop"
              :width="candle.candleWidth"
              :height="candle.bodyHeight"
              :fill="candle.rising ? '#ff6b6b' : '#31d2a4'"
              rx=".6"
            />
          </g>
          <line v-if="activeCandle" :x1="activeCandle.center" :x2="activeCandle.center" y1="18" y2="178" class="crosshair" />
        </template>
      </svg>

      <div v-if="activeIntraday && !loading && !error" class="chart-tooltip" :style="{ left: `${intradayTooltipLeft}%` }">
        <span>{{ activeIntraday.time || "最新" }}</span>
        <strong>{{ formatPrice(activeIntraday.value) }}</strong>
      </div>
      <div v-if="activeCandle && !loading && !error" class="chart-tooltip candle-tip" :style="{ left: `${candleTooltipLeft}%` }">
        <span>{{ activeCandle.date }}</span>
        <strong>收 {{ formatPrice(activeCandle.close) }}</strong>
      </div>
    </div>

    <div v-if="times.length && !loading && !error" class="chart-labels">
      <span v-for="time in times" :key="time">{{ time }}</span>
    </div>
    <p class="chart-note">数据源：公开行情接口 · 点击或滑动图表可查看数据点</p>
  </section>
</template>
