<script setup>
import { computed, ref, watch } from "vue";
import Icon from "../components/Icon.vue";
import SharePoster from "../components/SharePoster.vue";
import StockChart from "../components/StockChart.vue";
import {
  addPriceAlert,
  formatCompactMoney,
  formatMoney,
  formatVolume,
  getPosition,
  portfolio,
  tradingStatus,
  toggleWatch,
} from "../stores/useMarket";
import { formatPct, formatPrice, trendClass } from "../utils/display";

const props = defineProps({
  stock: { type: Object, required: true },
});

const emit = defineEmits(["back", "open-trade", "open-ai", "open-alerts", "open-research", "notify"]);

const alertDirection = ref("above");
const alertTarget = ref("");
const shareOpen = ref(false);
const percent = computed(() => {
  if (!props.stock.prevClose) return 0;
  return ((props.stock.price - props.stock.prevClose) / props.stock.prevClose) * 100;
});
const isWatched = computed(() => portfolio.watchlist.includes(props.stock.code));
const position = computed(() => getPosition(props.stock.code));
const stockAlerts = computed(() =>
  portfolio.alerts.filter((alert) => alert.code === props.stock.code && !alert.triggered),
);
const amplitude = computed(() => {
  if (!props.stock.prevClose) return 0;
  return ((props.stock.high - props.stock.low) / props.stock.prevClose) * 100;
});
const dayRange = computed(() => {
  const low = props.stock.low || 0;
  const high = props.stock.high || 0;
  return high > low ? Math.min(100, Math.max(0, ((props.stock.price - low) / (high - low)) * 100)) : 50;
});

watch(
  () => props.stock.code,
  () => {
    alertTarget.value = props.stock.price ? (props.stock.price * 1.02).toFixed(2) : "";
  },
  { immediate: true },
);

watch(
  () => props.stock.price,
  (price) => {
    if (price && !alertTarget.value) alertTarget.value = (price * 1.02).toFixed(2);
  },
);

function watchStock() {
  const added = toggleWatch(props.stock.code);
  emit("notify", added ? "已加入自选" : "已移出自选");
}

function createAlert() {
  const result = addPriceAlert({
    code: props.stock.code,
    direction: alertDirection.value,
    target: alertTarget.value,
  });
  emit("notify", result.message);
}
</script>

<template>
  <div class="page detail-view">
    <header class="detail-header">
      <button type="button" class="icon-button" aria-label="返回" @click="emit('back')">
        <Icon name="arrowLeft" :size="21" />
      </button>
      <div class="detail-title">
        <strong>{{ stock.name }}</strong>
        <span>{{ stock.code }} · {{ stock.market }} A股</span>
      </div>
      <div class="detail-actions">
        <button type="button" class="icon-button" :class="{ starred: isWatched }" aria-label="收藏" @click="watchStock">
          <Icon name="star" :size="20" />
        </button>
        <button type="button" class="icon-button alert-header-button" aria-label="价格提醒" @click="emit('open-alerts')">
          <Icon name="bell" :size="19" />
          <i v-if="stockAlerts.length" />
        </button>
        <button type="button" class="icon-button" aria-label="生成分享图片" @click="shareOpen = true">
          <Icon name="share" :size="19" />
        </button>
      </div>
    </header>

    <main>
      <section class="quote-hero">
        <div class="quote-main">
          <div>
            <span class="market-tag" :class="{ offline: !stock.live }">
              <i /> {{ stock.live ? "实时行情" : "行情缓存" }}
            </span>
            <strong :class="trendClass(percent)">¥ {{ formatPrice(stock.price) }}</strong>
            <div class="quote-change" :class="trendClass(percent)">
              <span>{{ stock.price - stock.prevClose >= 0 ? "+" : "" }}{{ formatPrice(stock.price - stock.prevClose) }}</span>
              <span>{{ formatPct(percent) }}</span>
            </div>
          </div>
          <div class="quote-seal">
            <span>{{ stock.name.slice(0, 1) }}</span>
            <small>{{ stock.sector }}</small>
          </div>
        </div>
        <div class="tag-list">
          <span v-for="tag in stock.tags" :key="tag">{{ tag }}</span>
          <span class="session-inline-badge" :class="{ open: tradingStatus.canTrade }">{{ tradingStatus.label }}</span>
        </div>
      </section>

      <StockChart :stock="stock" />

      <section class="quote-facts">
        <div><span>今开</span><strong>{{ formatPrice(stock.open) }}</strong></div>
        <div><span>最高</span><strong class="rise">{{ formatPrice(stock.high) }}</strong></div>
        <div><span>最低</span><strong class="fall">{{ formatPrice(stock.low) }}</strong></div>
        <div><span>昨收</span><strong>{{ formatPrice(stock.prevClose) }}</strong></div>
        <div><span>成交量</span><strong>{{ formatVolume(stock.volume) }}</strong></div>
        <div><span>成交额</span><strong>{{ formatCompactMoney(stock.amount) }}</strong></div>
      </section>

      <section class="insight-card">
        <div class="insight-head">
          <span><Icon name="chart" :size="19" /></span>
          <div><strong>盘面速读</strong><small>根据当前行情字段生成</small></div>
          <em>非投资建议</em>
        </div>
        <p>
          {{ stock.name }} 当前{{ percent >= 0 ? "上涨" : "下跌" }} {{ Math.abs(percent).toFixed(2) }}%，
          日内振幅 {{ amplitude.toFixed(2) }}%，量比 {{ stock.volumeRatio ? Number(stock.volumeRatio).toFixed(2) : "—" }}。
          现价位于今日 {{ dayRange.toFixed(0) }}% 的价格区间位置。
        </p>
        <button type="button" @click="emit('open-ai')">查看持仓关联分析 <Icon name="arrowRight" :size="14" /></button>
      </section>

      <section class="day-range-card">
        <div class="section-heading compact">
          <div>
            <span>DAY RANGE</span>
            <h2>今日价格区间</h2>
          </div>
          <em>实时字段</em>
        </div>
        <div class="day-range-values">
          <span><small>最低</small><strong class="fall">{{ formatPrice(stock.low) }}</strong></span>
          <span><small>现价</small><strong :class="trendClass(percent)">{{ formatPrice(stock.price) }}</strong></span>
          <span><small>最高</small><strong class="rise">{{ formatPrice(stock.high) }}</strong></span>
        </div>
        <div class="day-range-track"><i :style="{ left: `${dayRange}%` }" /></div>
      </section>

      <button type="button" class="research-entry-card" @click="emit('open-research')">
        <span class="research-entry-icon"><Icon name="shield" :size="22" /></span>
        <span>
          <small>DEEP RESEARCH</small>
          <strong>风险 · 趋势预测 · 财务诊股</strong>
          <em>异动、主力资金、板块、换手率与五类财务指标</em>
        </span>
        <Icon name="arrowRight" :size="18" />
      </button>

      <section class="alert-setup-card">
        <div class="alert-setup-head">
          <span><Icon name="bell" :size="18" /></span>
          <div><strong>价格提醒</strong><small>到达目标价时在页面内通知</small></div>
          <button type="button" @click="emit('open-alerts')">管理 {{ stockAlerts.length ? `(${stockAlerts.length})` : "" }}</button>
        </div>
        <div class="alert-form">
          <div class="alert-direction">
            <button type="button" :class="{ active: alertDirection === 'above' }" @click="alertDirection = 'above'">高于</button>
            <button type="button" :class="{ active: alertDirection === 'below' }" @click="alertDirection = 'below'">低于</button>
          </div>
          <label>
            <span>¥</span>
            <input v-model="alertTarget" type="number" inputmode="decimal" step="0.01" :placeholder="formatPrice(stock.price)" />
          </label>
          <button type="button" class="alert-add-button" @click="createAlert">设置提醒</button>
        </div>
      </section>

      <section class="fundamentals-card">
        <div class="section-heading compact">
          <div>
            <span>QUOTE DATA</span>
            <h2>行情数据</h2>
          </div>
          <em>公开接口</em>
        </div>
        <div class="fundamentals-grid">
          <div><span>总市值</span><strong>{{ formatCompactMoney(stock.marketCap) }}</strong></div>
          <div><span>市盈率</span><strong>{{ stock.pe || "—" }}</strong></div>
          <div><span>市净率</span><strong>{{ stock.pb || "—" }}</strong></div>
          <div><span>换手率</span><strong>{{ stock.turnover ? `${stock.turnover}%` : "—" }}</strong></div>
          <div><span>量比</span><strong>{{ stock.volumeRatio || "—" }}</strong></div>
          <div><span>所属行业</span><strong>{{ stock.sector }}</strong></div>
        </div>
      </section>

      <section class="company-card">
        <div class="section-heading compact">
          <div>
            <span>COMPANY</span>
            <h2>上市公司</h2>
          </div>
        </div>
        <p>{{ stock.description }}</p>
      </section>

      <section class="detail-news">
        <div class="section-heading compact">
          <div>
            <span>DATA NOTE</span>
            <h2>行情说明</h2>
          </div>
        </div>
        <article>
          <span>来源</span>
          <div><strong>公开行情接口</strong><p>页面通过本地服务转发公开市场数据。公开接口可能短暂延迟，请以证券交易所最终数据为准。</p></div>
        </article>
        <article>
          <span>交易</span>
          <div><strong>模拟盘</strong><p>所有买卖仅使用虚拟资金并记录在本机，不会向券商发送委托。</p></div>
        </article>
      </section>

      <section v-if="position" class="position-card">
        <span>当前模拟持仓</span>
        <strong>{{ position.shares }} 股</strong>
        <small>成本 {{ position.avgCost.toFixed(2) }} · 市值 ¥{{ formatMoney(position.shares * stock.price) }}</small>
      </section>
    </main>

    <div class="trade-dock">
      <button type="button" class="secondary-button watch-button" @click="watchStock">
        <Icon name="star" :size="18" :class="{ filled: isWatched }" />
        {{ isWatched ? "已自选" : "加自选" }}
      </button>
      <button type="button" class="sell-button" :disabled="!tradingStatus.canTrade" @click="emit('open-trade', { stock, type: 'sell' })">{{ tradingStatus.canTrade ? "模拟卖出" : "休市" }}</button>
      <button type="button" class="buy-button" :disabled="!tradingStatus.canTrade" @click="emit('open-trade', { stock, type: 'buy' })">{{ tradingStatus.canTrade ? "模拟买入" : "休市" }}</button>
    </div>
    <SharePoster :open="shareOpen" :stock="stock" @close="shareOpen = false" @notify="emit('notify', $event)" />
  </div>
</template>
