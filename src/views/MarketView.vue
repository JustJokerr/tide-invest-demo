<script setup>
import { computed, ref } from "vue";
import Icon from "../components/Icon.vue";
import Sparkline from "../components/Sparkline.vue";
import StockRow from "../components/StockRow.vue";
import {
  formatCompactMoney,
  activeAlertCount,
  indices,
  lastUpdated,
  marketMeta,
  refreshMarket,
  sectorStats,
  stocks,
  tradingStatus,
  watchStocks,
} from "../stores/useMarket";
import { formatPct, trendClass } from "../utils/display";

const emit = defineEmits(["navigate", "select-stock", "open-ai", "open-alerts", "open-watch-picker", "notify"]);
const tab = ref("watch");
const sort = ref("default");
const refreshing = ref(false);

const tabs = [
  { id: "watch", label: "自选" },
  { id: "all", label: "全部" },
  { id: "rise", label: "涨幅" },
  { id: "fall", label: "跌幅" },
];

const visibleStocks = computed(() => {
  let result = tab.value === "watch" ? [...watchStocks.value] : [...stocks];
  if (tab.value === "rise") result.sort((a, b) => b.price / b.prevClose - a.price / a.prevClose);
  if (tab.value === "fall") result.sort((a, b) => a.price / a.prevClose - b.price / b.prevClose);
  if (sort.value === "change") result.sort((a, b) => b.price / b.prevClose - a.price / a.prevClose);
  if (sort.value === "price") result.sort((a, b) => b.price - a.price);
  return result;
});

const updatedLabel = computed(() => {
  const value = lastUpdated.tradeTimestamp || lastUpdated.value;
  if (!value) return "等待同步";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
});

async function reload() {
  if (refreshing.value) return;
  refreshing.value = true;
  const result = await refreshMarket({ includeSectors: true });
  refreshing.value = false;
  emit("notify", result.ok ? (result.stale ? "接口波动，已使用最近缓存行情" : "真实 A 股行情已刷新") : result.message);
}

function cycleSort() {
  sort.value = sort.value === "default" ? "change" : sort.value === "change" ? "price" : "default";
}
</script>

<template>
  <div class="page market-view">
    <header class="view-header">
      <div>
        <span class="eyebrow">MARKET</span>
        <h1>行情</h1>
      </div>
      <div class="header-actions">
        <button type="button" class="icon-button" aria-label="刷新" @click="reload">
          <Icon name="refresh" :size="19" :class="{ spin: refreshing }" />
        </button>
        <button type="button" class="icon-button notification" aria-label="价格提醒" @click="emit('open-alerts')">
          <Icon name="bell" :size="19" />
          <i v-if="activeAlertCount" />
        </button>
        <button type="button" class="icon-button" aria-label="添加或管理自选" @click="emit('open-watch-picker')">
          <Icon name="star" :size="19" />
        </button>
        <button type="button" class="icon-button" aria-label="搜索" @click="emit('navigate', 'search')">
          <Icon name="search" :size="20" />
        </button>
      </div>
    </header>

    <button type="button" class="search-entry market-search" @click="emit('navigate', 'search')">
      <Icon name="search" :size="19" />
          <span>搜索全部 A 股</span>
          <span class="search-shortcut">名称 / 代码 / 拼音</span>
    </button>

    <div class="market-session-strip compact" :class="tradingStatus.phase">
      <span class="session-dot" />
      <div>
        <strong>{{ tradingStatus.label }}</strong>
        <small>{{ tradingStatus.detail }}</small>
      </div>
      <em>{{ lastUpdated.live ? "实时行情" : "缓存行情" }}</em>
    </div>

    <section class="market-overview">
      <article v-for="(index, i) in indices" :key="index.code" class="mini-index">
        <span>{{ index.shortName }}</span>
        <strong :class="trendClass(index.changePercent)">{{ index.price.toFixed(2) }}</strong>
        <small :class="trendClass(index.changePercent)">{{ formatPct(index.changePercent) }}</small>
        <Sparkline :values="index.history" :positive="index.changePercent >= 0" :width="86" :height="28" />
      </article>
    </section>

    <section class="market-map">
      <div class="section-heading compact">
        <div>
          <span>SECTOR MAP</span>
          <h2>行业热度</h2>
        </div>
        <em>公开资金流向</em>
      </div>
      <div class="sector-grid">
        <button
          v-for="sector in sectorStats"
          :key="sector.name"
          type="button"
          class="sector-tile"
          :class="[trendClass(sector.change), sector.change > 3 ? 'hot' : sector.change < 0 ? 'cool' : 'warm']"
          @click="emit('notify', `${sector.name}板块净流入 ${formatCompactMoney(sector.mainNet)}`)"
        >
          <span>{{ sector.name }}</span>
          <strong>{{ formatPct(sector.change) }}</strong>
        </button>
      </div>
    </section>

    <section class="market-list-section">
      <div class="market-list-head">
        <div class="segmented small">
          <button v-for="item in tabs" :key="item.id" type="button" :class="{ active: tab === item.id }" @click="tab = item.id">
            {{ item.label }}
          </button>
        </div>
        <button type="button" class="sort-button" @click="cycleSort">
          <Icon name="filter" :size="15" />
          {{ sort === "default" ? "默认" : sort === "change" ? "涨跌" : "价格" }}
        </button>
      </div>

      <div class="list-meta">
        <span>{{ visibleStocks.length }} 个自选 / 常用标的</span>
        <span><i class="live-dot" :class="{ stale: marketMeta.connection === 'stale' }" /> {{ lastUpdated.live ? "实时" : marketMeta.connection === "stale" ? "缓存" : "等待连接" }} · {{ updatedLabel }}</span>
      </div>
      <div class="stock-list full">
        <StockRow
          v-for="stock in visibleStocks"
          :key="stock.code"
          :stock="stock"
          @select="emit('select-stock', $event)"
        />
      </div>
    </section>

    <button type="button" class="ai-inline-card" @click="emit('open-ai')">
      <span><Icon name="sparkles" :size="19" /></span>
      <div>
        <strong>把自选股和实际持仓放在一起看</strong>
        <small>打开研究助手，梳理板块暴露与仓位风险</small>
      </div>
      <Icon name="arrowRight" :size="18" />
    </button>
  </div>
</template>
