<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import Icon from "./Icon.vue";
import {
  holdings,
  portfolio,
  registerStock,
  searchStocks,
  stocks,
  toggleWatch,
  watchStocks,
} from "../stores/useMarket";
import { formatPct, formatPrice, trendClass } from "../utils/display";

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: "trade" },
});

const emit = defineEmits(["close", "select", "notify"]);
const query = ref("");
const inputRef = ref(null);
const remoteResults = ref([]);
const loading = ref(false);
const error = ref("");
let debounceTimer;
let requestId = 0;

const quickItems = computed(() => {
  if (props.mode === "watch") {
    return [
      ...watchStocks.value,
      ...stocks.filter((stock) => !portfolio.watchlist.includes(stock.code)),
    ].slice(0, 10);
  }
  const heldCodes = new Set(holdings.value.map((item) => item.code));
  return [
    ...holdings.value.map((item) => item.stock),
    ...watchStocks.value.filter((stock) => !heldCodes.has(stock.code)),
    ...stocks,
  ]
    .filter((stock, index, list) => list.findIndex((item) => item.code === stock.code) === index)
    .slice(0, 10);
});

const localSearchResults = computed(() => {
  const keyword = query.value.trim().toLowerCase();
  if (!keyword) return [];
  return stocks.filter((stock) =>
    `${stock.name} ${stock.code} ${stock.sector} ${stock.market}`.toLowerCase().includes(keyword),
  );
});

const visibleItems = computed(() => {
  if (!query.value.trim()) return quickItems.value;
  const localCodes = new Set(localSearchResults.value.map((stock) => stock.code));
  return [
    ...localSearchResults.value,
    ...remoteResults.value.filter((stock) => !localCodes.has(stock.code)),
  ];
});

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    query.value = "";
    remoteResults.value = [];
    error.value = "";
    await nextTick();
    inputRef.value?.focus();
  },
);

watch(query, (value) => {
  window.clearTimeout(debounceTimer);
  error.value = "";
  if (!value.trim()) {
    remoteResults.value = [];
    loading.value = false;
    return;
  }
  debounceTimer = window.setTimeout(async () => {
    const currentRequest = ++requestId;
    loading.value = true;
    try {
      const result = await searchStocks(value);
      if (currentRequest === requestId) remoteResults.value = result;
    } catch (requestError) {
      if (currentRequest === requestId) {
        remoteResults.value = [];
        error.value = requestError instanceof Error ? requestError.message : "搜索失败";
      }
    } finally {
      if (currentRequest === requestId) loading.value = false;
    }
  }, 260);
});

onBeforeUnmount(() => window.clearTimeout(debounceTimer));

function choose(item) {
  const stock = registerStock(item);
  if (props.mode === "trade") {
    emit("select", stock);
    return;
  }
  const added = toggleWatch(stock.code);
  emit("notify", added ? `${stock.name} 已加入自选` : `${stock.name} 已移出自选`);
  if (query.value && added) query.value = "";
}

function isWatched(item) {
  return portfolio.watchlist.includes(item.code);
}
</script>

<template>
  <Transition name="sheet">
    <div v-if="open" class="sheet-backdrop picker-backdrop" @click.self="$emit('close')">
      <section class="bottom-sheet stock-picker-sheet" role="dialog" aria-modal="true" :aria-label="mode === 'trade' ? '选择交易股票' : '添加自选股票'">
        <div class="sheet-handle" />
        <header class="sheet-header picker-header">
          <div>
            <p>{{ mode === "trade" ? "SIMULATED ORDER" : "WATCHLIST" }}</p>
            <h2>{{ mode === "trade" ? "选择交易股票" : "管理自选股票" }}</h2>
          </div>
          <button type="button" class="icon-button" aria-label="关闭" @click="$emit('close')">
            <Icon name="close" :size="20" />
          </button>
        </header>

        <label class="picker-search">
          <Icon name="search" :size="17" />
          <input ref="inputRef" v-model="query" type="search" placeholder="搜索任意 A 股名称或代码" />
          <button v-if="query" type="button" aria-label="清空" @click="query = ''"><Icon name="close" :size="15" /></button>
        </label>

        <div class="picker-meta">
          <span>{{ query ? `搜索结果 ${visibleItems.length} 个` : mode === "trade" ? "持仓与自选优先" : "常用 A 股" }}</span>
          <span v-if="loading"><i class="loading-dot" /> 搜索中</span>
          <span v-else>数据来自公开行情接口</span>
        </div>

        <div class="picker-list">
          <article v-for="item in visibleItems" :key="item.secid || item.code" class="picker-row">
            <button type="button" class="picker-stock-button" @click="choose(item)">
              <span class="stock-monogram">{{ item.name.slice(0, 1) }}</span>
              <span class="pick-copy">
                <strong>{{ item.name }}</strong>
                <small>{{ item.code }} · {{ item.sector || item.type || item.market }}</small>
              </span>
            </button>
            <span v-if="item.price" class="pick-quote" :class="trendClass(item.changePercent)">
              <strong>{{ formatPrice(item.price) }}</strong>
              <small>{{ formatPct(item.changePercent) }}</small>
            </span>
            <button
              v-if="mode === 'trade'"
              type="button"
              class="pick-action"
              @click="choose(item)"
            >
              选择
            </button>
            <button
              v-else
              type="button"
              class="pick-action"
              :class="{ active: isWatched(item) }"
              @click="choose(item)"
            >
              {{ isWatched(item) ? "移出" : "添加" }}
            </button>
          </article>

          <div v-if="error" class="picker-empty">
            <strong>搜索服务暂时不可用</strong>
            <span>{{ error }}</span>
          </div>
          <div v-else-if="query && !loading && !visibleItems.length" class="picker-empty">
            <strong>没有找到相关 A 股</strong>
            <span>请尝试完整名称、代码或拼音缩写。</span>
          </div>
        </div>

        <p class="picker-note">
          {{ mode === "trade" ? "选择后将进入买入面板，仍可使用卖出切换方向。" : "自选列表会与首页、行情页和股票详情页同步。" }}
        </p>
      </section>
    </div>
  </Transition>
</template>
