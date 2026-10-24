<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import Icon from "../components/Icon.vue";
import StockRow from "../components/StockRow.vue";
import { searchStocks, stocks, suggestedStocks } from "../stores/useMarket";

const emit = defineEmits(["back", "select-stock"]);
const query = ref("");
const inputRef = ref(null);
const remoteResults = ref([]);
const loading = ref(false);
const error = ref("");
let debounceTimer;
let requestId = 0;

const localResults = computed(() => {
  const keyword = query.value.trim().toLowerCase();
  if (!keyword) return [];
  return stocks.filter((stock) =>
    `${stock.name} ${stock.code} ${stock.sector} ${stock.tags.join(" ")}`.toLowerCase().includes(keyword),
  );
});

const results = computed(() => {
  const localCodes = new Set(localResults.value.map((stock) => stock.code));
  return [
    ...localResults.value,
    ...remoteResults.value.filter((stock) => !localCodes.has(stock.code)),
  ];
});

const hotSearches = ["贵州茅台", "宁德时代", "600519", "中芯国际", "招商银行", "GZMT"];

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
      const items = await searchStocks(value);
      if (currentRequest === requestId) remoteResults.value = items;
    } catch (requestError) {
      if (currentRequest === requestId) {
        remoteResults.value = [];
        error.value = requestError instanceof Error ? requestError.message : "搜索服务暂时不可用";
      }
    } finally {
      if (currentRequest === requestId) loading.value = false;
    }
  }, 280);
});

onMounted(async () => {
  await nextTick();
  inputRef.value?.focus();
});
onBeforeUnmount(() => window.clearTimeout(debounceTimer));

function useKeyword(keyword) {
  query.value = keyword;
}

function select(stock) {
  emit("select-stock", stock);
}
</script>

<template>
  <div class="page search-view">
    <header class="search-header">
      <button type="button" class="icon-button" aria-label="返回" @click="emit('back')">
        <Icon name="arrowLeft" :size="21" />
      </button>
      <label class="search-field">
        <Icon name="search" :size="18" />
        <input ref="inputRef" v-model="query" type="search" placeholder="A 股名称、代码或拼音" enterkeyhint="search" />
        <button v-if="query" type="button" aria-label="清空" @click="query = ''"><Icon name="close" :size="16" /></button>
      </label>
      <button type="button" class="text-button" @click="emit('back')">取消</button>
    </header>

    <main>
      <section v-if="!query" class="search-discovery">
        <div class="section-heading compact">
          <div>
            <span>TRENDING</span>
            <h2>热门 A 股</h2>
          </div>
        </div>
        <div class="keyword-cloud">
          <button v-for="(keyword, index) in hotSearches" :key="keyword" type="button" @click="useKeyword(keyword)">
            <i v-if="index < 3">{{ index + 1 }}</i>
            {{ keyword }}
          </button>
        </div>

        <div class="section-heading compact discover-heading">
          <div>
            <span>FOR YOU</span>
            <h2>为你发现</h2>
          </div>
          <em>真实行情</em>
        </div>
        <div class="stock-list">
          <StockRow
            v-for="stock in suggestedStocks"
            :key="stock.secid"
            :stock="stock"
            @select="select"
          />
        </div>
      </section>

      <section v-else class="search-results">
        <div class="result-summary">
          <span v-if="loading">正在搜索全部 A 股…</span>
          <span v-else-if="error">{{ error }}</span>
          <span v-else>找到 <strong>{{ results.length }}</strong> 个结果</span>
        </div>
        <div v-if="results.length" class="stock-list remote-results">
          <template v-for="stock in results" :key="stock.secid || stock.code">
            <StockRow
              v-if="stock.price"
              :stock="stock"
              @select="select"
            />
            <button v-else type="button" class="remote-stock-row" @click="select(stock)">
              <span class="stock-monogram">{{ stock.name?.slice(0, 1) }}</span>
              <span class="stock-copy">
                <strong>{{ stock.name }}</strong>
                <small>{{ stock.code }} · {{ stock.type || stock.sector }}</small>
              </span>
              <span class="result-market">{{ stock.market }}</span>
              <Icon name="chevronRight" :size="16" />
            </button>
          </template>
        </div>
        <div v-else-if="!loading && !error" class="empty-state">
          <span><Icon name="search" :size="29" /></span>
          <strong>没有找到相关 A 股</strong>
          <p>试试完整股票名称、6 位代码或名称拼音。</p>
        </div>
      </section>
    </main>
  </div>
</template>
