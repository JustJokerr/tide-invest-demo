<script setup>
import { computed, ref } from "vue";
import Icon from "../components/Icon.vue";
import Sparkline from "../components/Sparkline.vue";
import { account, formatMoney, holdings, portfolio, tradingStatus } from "../stores/useMarket";
import { formatPct, trendClass } from "../utils/display";

const emit = defineEmits(["navigate", "select-stock", "open-ai", "open-trade-picker", "open-report", "notify"]);
const ledgerOpen = ref(true);

const chartValues = computed(() => {
  return portfolio.history.map((item) => item.value);
});

const composition = computed(() => {
  const colors = ["#ff736a", "#6d8dff", "#33d1a4", "#f1c269"];
  const result = holdings.value.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
  }));
  if (portfolio.cash > 0) {
    result.push({
      code: "cash",
      stock: { name: "现金" },
      marketValue: portfolio.cash,
      color: "#23364c",
    });
  }
  return result;
});

const donutStyle = computed(() => {
  let position = 0;
  const segments = composition.value.map((item) => {
    const start = position;
    position += (item.marketValue / account.value.totalAssets) * 100;
    return `${item.color} ${start.toFixed(1)}% ${position.toFixed(1)}%`;
  });
  return { background: `conic-gradient(${segments.join(", ")})` };
});

const strongestHolding = computed(() =>
  [...holdings.value].sort((a, b) => b.profitPercent - a.profitPercent)[0],
);
const concentration = computed(() => {
  if (!holdings.value.length) return 0;
  return (holdings.value[0].marketValue / account.value.totalAssets) * 100;
});

function tradeNew() {
  emit("open-trade-picker");
}
</script>

<template>
  <div class="page portfolio-view">
    <header class="view-header">
      <div>
        <span class="eyebrow">SIMULATED ACCOUNT</span>
        <h1>模拟盘</h1>
      </div>
      <button type="button" class="icon-button" aria-label="组合分析" @click="emit('open-ai')">
        <Icon name="chart" :size="20" />
      </button>
    </header>

    <section class="asset-hero">
      <div class="asset-topline">
        <span>总资产（CNY） <Icon name="eye" :size="14" /></span>
        <span class="simulated-tag">虚拟资金</span>
      </div>
      <strong>¥ {{ formatMoney(account.totalAssets) }}</strong>
      <div class="asset-delta" :class="trendClass(account.dailyProfit)">
        <span>今日 {{ account.dailyProfit >= 0 ? "+" : "" }}¥{{ formatMoney(account.dailyProfit) }}</span>
        <em>{{ formatPct(account.dailyPercent) }}</em>
      </div>
      <div v-if="chartValues.length > 1" class="asset-chart">
        <Sparkline :values="chartValues" :positive="account.totalProfit >= 0" :width="330" :height="80" />
        <div class="chart-periods"><span>本次会话 {{ chartValues.length }} 次采样</span></div>
      </div>
      <div v-else class="asset-composition-strip">
        <div><span>持仓</span><strong>{{ account.positionPercent.toFixed(1) }}%</strong></div>
        <i><b :style="{ width: `${account.positionPercent}%` }" /></i>
        <div><span>现金</span><strong>{{ (100 - account.positionPercent).toFixed(1) }}%</strong></div>
      </div>
    </section>

    <section class="account-metrics">
      <div><span>持仓市值</span><strong>¥{{ formatMoney(account.marketValue, 0) }}</strong></div>
      <div><span>可用资金</span><strong>¥{{ formatMoney(portfolio.cash, 0) }}</strong></div>
      <div><span>累计收益</span><strong :class="trendClass(account.totalProfit)">{{ account.totalProfit >= 0 ? "+" : "" }}¥{{ formatMoney(account.totalProfit, 0) }}</strong></div>
    </section>

    <div class="portfolio-session-note" :class="tradingStatus.phase">
      <Icon :name="tradingStatus.canTrade ? 'check' : 'clock'" :size="16" />
      <span><strong>{{ tradingStatus.label }}</strong> {{ tradingStatus.detail }}</span>
    </div>

    <section class="portfolio-actions">
      <button type="button" class="primary-button" :disabled="!tradingStatus.canTrade" @click="tradeNew">
        <Icon name="plus" :size="18" /> {{ tradingStatus.canTrade ? "模拟交易" : `${tradingStatus.label}，暂停成交` }}
      </button>
      <button type="button" class="secondary-button" @click="ledgerOpen = !ledgerOpen">
        <Icon name="edit" :size="18" /> 资金记账
      </button>
      <button type="button" class="secondary-button" @click="emit('open-report')">
        <Icon name="share" :size="18" /> 个人财报
      </button>
    </section>

    <section class="section-block holdings-section">
      <div class="section-heading">
        <div>
          <span>POSITIONS</span>
          <h2>我的持仓</h2>
        </div>
        <em>{{ holdings.length }} 个标的</em>
      </div>
      <div class="holding-list">
        <button
          v-for="holding in holdings"
          :key="holding.code"
          type="button"
          class="holding-row"
          @click="emit('select-stock', holding.stock)"
        >
          <span class="holding-logo">{{ holding.stock.name.slice(0, 1) }}</span>
          <span class="holding-info">
            <strong>{{ holding.stock.name }}</strong>
            <small>{{ holding.shares }} 股 · 可卖 {{ holding.availableShares ?? holding.shares }} · 成本 {{ holding.avgCost.toFixed(2) }}</small>
          </span>
          <span class="holding-value">
            <strong>¥{{ formatMoney(holding.marketValue, 0) }}</strong>
            <small :class="trendClass(holding.profit)">{{ formatPct(holding.profitPercent) }}</small>
          </span>
        </button>
      </div>
    </section>

    <section class="allocation-card">
      <div class="allocation-donut" :style="donutStyle">
        <span><strong>{{ account.positionPercent.toFixed(0) }}%</strong><small>仓位</small></span>
      </div>
      <div class="allocation-copy">
        <span>ASSET ALLOCATION</span>
        <h3>资产分布</h3>
        <div class="allocation-legend">
          <span v-for="item in composition" :key="item.code">
            <i :style="{ background: item.color }" />
            {{ item.stock.name }}
            <em>{{ ((item.marketValue / account.totalAssets) * 100).toFixed(0) }}%</em>
          </span>
        </div>
      </div>
    </section>

    <section class="smart-check">
      <div class="smart-check-head">
        <span class="smart-icon"><Icon name="shield" :size="19" /></span>
        <div>
          <strong>模拟仓体检</strong>
          <small>基于当前账户数据</small>
        </div>
        <em>{{ concentration < 25 ? "较稳健" : "需关注" }}</em>
      </div>
      <p>
        最大单仓占比 {{ concentration.toFixed(1) }}%，
        <template v-if="concentration > 25">账户对单一标的较为依赖，可在模拟盘中练习分批调整。</template>
        <template v-else>持仓集中度处于合理区间，仍建议保留一定现金。</template>
      </p>
      <button type="button" @click="emit('navigate', 'insights')">查看压力测试 <Icon name="arrowRight" :size="14" /></button>
    </section>

    <section v-if="ledgerOpen" class="ledger-section">
      <div class="section-heading compact">
        <div>
          <span>LEDGER</span>
          <h2>资金流水</h2>
        </div>
        <em>自动记账</em>
      </div>
      <div class="ledger-list">
        <article v-for="entry in portfolio.ledger.slice(0, 5)" :key="entry.id">
          <span class="ledger-icon" :class="entry.type">
            <Icon :name="entry.type === 'buy' ? 'plus' : 'minus'" :size="16" />
          </span>
          <div>
            <strong>{{ entry.type === "buy" ? "买入" : "卖出" }} {{ entry.name }}</strong>
            <small>{{ entry.time }} · {{ entry.shares }} 股</small>
            <p v-if="entry.note" class="ledger-note">{{ entry.note }}</p>
          </div>
          <span class="ledger-amount" :class="entry.type">
            {{ entry.type === "buy" ? "-" : "+" }}¥{{ formatMoney(entry.amount) }}
          </span>
        </article>
      </div>
    </section>

    <p v-if="strongestHolding" class="account-insight">
      <Icon name="trend" :size="15" />
      当前贡献最高的是 {{ strongestHolding.stock.name }}，模拟收益 {{ formatPct(strongestHolding.profitPercent) }}。
    </p>
  </div>
</template>
