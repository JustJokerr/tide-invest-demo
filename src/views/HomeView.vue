<script setup>
import { computed } from "vue";
import Icon from "../components/Icon.vue";
import Sparkline from "../components/Sparkline.vue";
import StockRow from "../components/StockRow.vue";
import {
  account,
  formatCompactMoney,
  formatMoney,
  formatSigned,
  indices,
  lastUpdated,
  marketMeta,
  portfolio,
  recentStocks,
  refreshMarket,
  clearRecentViews,
  tradingStatus,
  unreadNotificationCount,
  watchStocks,
} from "../stores/useMarket";
import { formatPct, trendClass } from "../utils/display";

const emit = defineEmits(["navigate", "select-stock", "open-ai", "open-alerts", "open-watch-picker", "notify"]);

const today = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
  weekday: "short",
}).format(new Date());

const risingIndexCount = computed(() => indices.filter((index) => index.changePercent > 0).length);
const averageIndexChange = computed(
  () => indices.reduce((sum, index) => sum + index.changePercent, 0) / indices.length,
);
const totalCashTurnover = computed(() => (indices[0]?.amount || 0) + (indices[1]?.amount || 0));

const portfolioSeries = computed(() => {
  return portfolio.history.map((item) => item.value);
});

async function reload() {
  const result = await refreshMarket({ includeSectors: true });
  emit("notify", result.ok ? (result.stale ? "接口波动，已使用最近缓存行情" : "真实 A 股行情已刷新") : result.message);
}
</script>

<template>
  <div class="page home-view">
    <header class="home-header">
      <div class="brand-lockup">
        <span class="brand-mark"><i /><i /><i /></span>
        <div>
          <strong>观潮</strong>
          <small>TIDE MARKET LAB</small>
        </div>
      </div>
      <div class="header-actions">
        <span class="demo-chip" :class="{ offline: !lastUpdated.live }">{{ lastUpdated.live ? "LIVE" : marketMeta.connection === "stale" ? "CACHE" : "等待连接" }}</span>
        <button type="button" class="icon-button" aria-label="刷新行情" @click="reload">
          <Icon name="refresh" :size="19" />
        </button>
        <button type="button" class="icon-button notification" aria-label="价格提醒与通知" @click="emit('open-alerts')">
          <Icon name="bell" :size="20" />
          <i v-if="unreadNotificationCount || portfolio.alerts.some((alert) => !alert.triggered)" />
        </button>
      </div>
    </header>

    <main>
      <section class="welcome-block">
        <p>{{ today }} · {{ tradingStatus.label }}</p>
        <h1>先看懂潮向，<br /><span>再做出选择。</span></h1>
      </section>

      <button type="button" class="search-entry" @click="emit('navigate', 'search')">
        <Icon name="search" :size="19" />
          <span>搜索 A 股代码、名称拼音或公司</span>
        <kbd>搜索</kbd>
      </button>

      <div class="market-session-strip" :class="[tradingStatus.phase, { stale: marketMeta.connection === 'stale' }]">
        <span class="session-dot" />
        <div>
          <strong>{{ tradingStatus.label }}</strong>
          <small>{{ marketMeta.connection === "stale" ? "实时接口波动，当前显示最近缓存行情" : tradingStatus.detail }}</small>
        </div>
        <em>{{ tradingStatus.canTrade ? "可模拟成交" : "暂停成交" }}</em>
      </div>

      <section class="index-scroller" aria-label="大盘指数">
        <article v-for="(index, indexNumber) in indices" :key="index.code" class="index-card" :class="{ featured: indexNumber === 0 }">
          <div class="index-title">
            <span>{{ index.shortName }}</span>
            <small>{{ index.code }}</small>
          </div>
          <strong :class="trendClass(index.changePercent)">{{ index.price.toFixed(2) }}</strong>
          <div class="index-meta" :class="trendClass(index.changePercent)">
            <span>{{ formatSigned(index.change) }}</span>
            <span>{{ formatPct(index.changePercent) }}</span>
          </div>
          <Sparkline :values="index.history" :positive="index.changePercent >= 0" :width="124" :height="38" />
        </article>
      </section>

      <section class="portfolio-hero">
        <div class="hero-glow" />
        <header>
          <div>
            <span>模拟总资产 <Icon name="eye" :size="15" /></span>
            <strong>¥ {{ formatMoney(account.totalAssets) }}</strong>
          </div>
          <button type="button" aria-label="进入模拟盘" @click="emit('navigate', 'portfolio')">
            <Icon name="arrowRight" :size="19" />
          </button>
        </header>
        <div class="hero-pnl" :class="trendClass(account.dailyProfit)">
          <span>今日收益</span>
          <strong>{{ account.dailyProfit >= 0 ? "+" : "" }}¥{{ formatMoney(account.dailyProfit) }}</strong>
          <em>{{ formatPct(account.dailyPercent) }}</em>
        </div>
        <div v-if="portfolioSeries.length > 1" class="hero-chart">
          <Sparkline :values="portfolioSeries" :positive="account.dailyProfit >= 0" :width="310" :height="58" />
          <span>本次会话 {{ portfolioSeries.length }} 次采样</span>
        </div>
        <div v-else class="hero-account-mix">
          <div>
            <span>持仓</span>
            <i><b :style="{ width: `${account.positionPercent}%` }" /></i>
            <span>现金</span>
          </div>
          <small>打开页面后开始记录实时资产变化</small>
        </div>
        <div class="hero-stats">
          <div><span>持仓市值</span><strong>¥{{ formatMoney(account.marketValue, 0) }}</strong></div>
          <div><span>可用资金</span><strong>¥{{ formatMoney(portfolio.cash, 0) }}</strong></div>
          <div><span>仓位</span><strong>{{ account.positionPercent.toFixed(1) }}%</strong></div>
        </div>
      </section>

      <section class="quick-actions">
        <button type="button" class="quick-action" @click="emit('navigate', 'market')">
          <span class="quick-icon coral"><Icon name="market" :size="22" /></span>
            <span>A 股行情</span>
            <small>指数与个股</small>
        </button>
        <button type="button" class="quick-action" @click="emit('navigate', 'search')">
          <span class="quick-icon blue"><Icon name="search" :size="22" /></span>
          <span>快速查股</span>
          <small>代码 / 名称</small>
        </button>
        <button type="button" class="quick-action" @click="emit('open-ai')">
          <span class="quick-icon gold"><Icon name="sparkles" :size="22" /></span>
            <span>持仓研究</span>
            <small>关联分析</small>
        </button>
        <button type="button" class="quick-action" @click="emit('navigate', 'insights')">
          <span class="quick-icon green"><Icon name="chart" :size="22" /></span>
          <span>资产分析</span>
          <small>诊断与归因</small>
        </button>
      </section>

      <section class="section-block watch-section">
        <div class="section-heading">
          <div>
            <span>WATCHLIST</span>
            <h2>我的自选</h2>
          </div>
          <div class="watch-heading-actions">
            <button type="button" @click="emit('open-watch-picker')"><Icon name="plus" :size="14" /> 添加</button>
            <button type="button" @click="emit('navigate', 'market')">全部 <Icon name="chevronRight" :size="15" /></button>
          </div>
        </div>
        <div class="stock-list">
          <StockRow
            v-for="stock in watchStocks.slice(0, 4)"
            :key="stock.code"
            :stock="stock"
            @select="emit('select-stock', $event)"
          />
        </div>
      </section>

      <section class="section-block recent-section">
        <div class="section-heading">
          <div>
            <span>RECENTLY VIEWED</span>
            <h2>最近浏览</h2>
          </div>
          <button v-if="recentStocks.length" type="button" @click="clearRecentViews(); emit('notify', '最近浏览已清空')">清空</button>
        </div>
        <div v-if="recentStocks.length" class="recent-stock-scroller">
          <button
            v-for="item in recentStocks"
            :key="item.code + item.viewedAt"
            type="button"
            class="recent-stock-card"
            @click="emit('select-stock', item.stock)"
          >
            <span class="stock-monogram">{{ item.stock.name.slice(0, 1) }}</span>
            <span>
              <strong>{{ item.stock.name }}</strong>
              <small>{{ item.stock.code }}</small>
            </span>
            <em :class="trendClass(item.stock.changePercent)">{{ formatPct(item.stock.changePercent) }}</em>
          </button>
        </div>
        <div v-else class="recent-empty">
          <Icon name="clock" :size="18" />
          <span>浏览过的股票会保存在这里，方便快速返回。</span>
        </div>
      </section>

      <section class="pulse-card">
        <div class="section-heading compact">
          <div>
            <span>MARKET PULSE</span>
            <h2>市场温度</h2>
          </div>
          <em class="temperature">{{ risingIndexCount >= 2 ? "指数偏暖" : "指数偏弱" }} {{ risingIndexCount }}/3</em>
        </div>
        <div class="breadth-numbers">
          <span :class="trendClass(indices[0]?.changePercent)"><strong>{{ formatPct(indices[0]?.changePercent) }}</strong>上证</span>
          <span :class="trendClass(indices[1]?.changePercent)"><strong>{{ formatPct(indices[1]?.changePercent) }}</strong>深证</span>
          <span :class="trendClass(indices[2]?.changePercent)"><strong>{{ formatPct(indices[2]?.changePercent) }}</strong>创业板</span>
        </div>
        <div class="breadth-bar">
          <i :class="trendClass(averageIndexChange)" :style="{ width: `${Math.min(100, 25 + Math.abs(averageIndexChange) * 20)}%` }" />
          <i class="flat" :style="{ width: '24%' }" />
        </div>
        <div class="pulse-meta">
          <span><small>沪深成交额</small><strong>{{ totalCashTurnover ? formatCompactMoney(totalCashTurnover) : "—" }}</strong></span>
          <span><small>指数平均涨跌</small><strong :class="trendClass(averageIndexChange)">{{ formatPct(averageIndexChange) }}</strong></span>
          <span><small>行情状态</small><strong :class="{ rise: lastUpdated.live }">{{ lastUpdated.live ? "已同步" : marketMeta.connection === "stale" ? "缓存行情" : marketMeta.connection === "error" ? "连接失败" : "连接中" }}</strong></span>
        </div>
      </section>

      <button type="button" class="ai-brief" @click="emit('open-ai')">
        <span class="ai-orb"><Icon name="sparkles" :size="22" /></span>
        <span class="ai-brief-copy">
          <small>观潮研究 · 持仓简报</small>
          <strong>从真实行情看你的模拟组合</strong>
          <span>结合持仓、当日涨跌和仓位给出解读</span>
        </span>
        <Icon name="arrowRight" :size="19" />
      </button>
    </main>
  </div>
</template>
