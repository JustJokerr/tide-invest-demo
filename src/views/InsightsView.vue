<script setup>
import { computed, ref } from "vue";
import Icon from "../components/Icon.vue";
import { account, formatMoney, holdings, portfolio } from "../stores/useMarket";
import { formatPct, trendClass } from "../utils/display";

const emit = defineEmits(["open-ai", "navigate"]);
const stressPercent = ref(-10);

const concentration = computed(() => {
  if (!holdings.value.length) return 0;
  return (holdings.value[0].marketValue / account.value.totalAssets) * 100;
});

const riskScore = computed(() => {
  const concentrationPenalty = Math.max(0, concentration.value - 20) * 1.8;
  const positionPenalty = Math.max(0, account.value.positionPercent - 55) * 0.35;
  return Math.round(Math.max(28, Math.min(88, 84 - concentrationPenalty - positionPenalty)));
});

const radarPoints = computed(() => {
  const values = [
    88 - concentration.value * 0.6,
    account.positionPercent > 65 ? 48 : 76,
    account.totalProfit >= 0 ? 82 : 58,
    Math.max(35, 88 - portfolio.ledger.length * 2),
    holdings.value.length >= 3 ? 80 : 52,
  ];
  return values
    .map((value, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / values.length;
      const radius = (value / 100) * 48;
      return `${(60 + Math.cos(angle) * radius).toFixed(1)},${(60 + Math.sin(angle) * radius).toFixed(1)}`;
    })
    .join(" ");
});

const radarLabels = ["分散度", "仓位", "盈利力", "交易纪律", "行业覆盖"];

const sectorRows = computed(() => {
  const groups = {};
  holdings.value.forEach((holding) => {
    groups[holding.stock.sector] = (groups[holding.stock.sector] || 0) + holding.marketValue;
  });
  if (portfolio.cash) groups["现金"] = portfolio.cash;
  const colors = ["#ff736a", "#6d8dff", "#33d1a4", "#f1c269"];
  return Object.entries(groups)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      percent: (value / account.value.totalAssets) * 100,
      color: colors[index % colors.length],
    }));
});

const contributions = computed(() => {
  const items = holdings.value.map((holding) => ({
    ...holding,
    dailyContribution: (holding.stock.price - holding.stock.prevClose) * holding.shares,
  }));
  const max = Math.max(1, ...items.map((item) => Math.abs(item.dailyContribution)));
  return items
    .sort((a, b) => b.dailyContribution - a.dailyContribution)
    .map((item) => ({ ...item, width: (Math.abs(item.dailyContribution) / max) * 100 }));
});

const stressLoss = computed(() => account.value.marketValue * (stressPercent.value / 100));
const stressedAssets = computed(() => account.value.totalAssets + stressLoss.value);

function setStress(value) {
  stressPercent.value = value;
}
</script>

<template>
  <div class="page insights-view">
    <header class="view-header">
      <div>
        <span class="eyebrow">PORTFOLIO INSIGHTS</span>
        <h1>资产分析</h1>
      </div>
      <span class="update-badge"><i /> 已同步模拟账户</span>
    </header>

    <section class="health-card">
      <div class="health-copy">
        <span>组合健康度</span>
        <h2>{{ riskScore >= 75 ? "结构健康" : "仍有优化空间" }}</h2>
        <p>{{ riskScore >= 75 ? "仓位与分散度处于合理区间，继续关注高波动持仓。" : "单一持仓与高波动标的占比较高，建议增加模拟现金缓冲。" }}</p>
        <button type="button" @click="emit('open-ai')">查看组合观察 <Icon name="arrowRight" :size="14" /></button>
      </div>
      <div class="health-score">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="47" />
          <circle cx="60" cy="60" r="47" class="progress" :style="{ strokeDasharray: `${riskScore * 2.95} 999` }" />
        </svg>
        <span><strong>{{ riskScore }}</strong><small>健康分</small></span>
      </div>
    </section>

    <section class="analysis-grid">
      <article class="metric-card">
        <span>累计收益</span>
        <strong :class="trendClass(account.totalProfit)">{{ account.totalProfit >= 0 ? "+" : "" }}¥{{ formatMoney(account.totalProfit, 0) }}</strong>
        <small :class="trendClass(account.totalProfit)">{{ formatPct(account.totalProfitPercent) }} 收益率</small>
      </article>
      <article class="metric-card">
        <span>组合当日表现</span>
        <strong :class="trendClass(account.dailyPercent)">{{ formatPct(account.dailyPercent) }}</strong>
        <small class="muted">按实时价格与昨收计算</small>
      </article>
    </section>

    <section class="contribution-card">
      <div class="section-heading compact">
        <div>
          <span>TODAY'S CONTRIBUTION</span>
          <h2>今日收益贡献</h2>
        </div>
        <em :class="trendClass(account.dailyProfit)">{{ account.dailyProfit >= 0 ? "+" : "" }}¥{{ formatMoney(account.dailyProfit, 0) }}</em>
      </div>
      <div class="contribution-list">
        <article v-for="item in contributions" :key="item.code">
          <div>
            <strong>{{ item.stock.name }}</strong>
            <small>{{ item.shares }} 股 · {{ formatPct(item.stock.changePercent) }}</small>
          </div>
          <div class="contribution-bar">
            <i
              :class="trendClass(item.dailyContribution)"
              :style="{ width: `${item.width}%` }"
            />
          </div>
          <strong :class="trendClass(item.dailyContribution)">
            {{ item.dailyContribution >= 0 ? "+" : "" }}¥{{ formatMoney(item.dailyContribution, 0) }}
          </strong>
        </article>
      </div>
    </section>

    <section class="stress-card">
      <div class="section-heading compact">
        <div>
          <span>SCENARIO TEST</span>
          <h2>持仓压力测试</h2>
        </div>
        <em>不含未来预测</em>
      </div>
      <div class="stress-result">
        <div>
          <span>假设持仓整体变动</span>
          <strong :class="trendClass(stressPercent)">{{ formatPct(stressPercent) }}</strong>
        </div>
        <div>
          <span>估算总资产</span>
          <strong>¥{{ formatMoney(stressedAssets, 0) }}</strong>
        </div>
        <div>
          <span>估算浮动</span>
          <strong :class="trendClass(stressLoss)">{{ stressLoss >= 0 ? "+" : "" }}¥{{ formatMoney(stressLoss, 0) }}</strong>
        </div>
      </div>
      <input v-model.number="stressPercent" class="stress-slider" type="range" min="-30" max="30" step="1" aria-label="持仓整体变动幅度" />
      <div class="stress-actions">
        <button v-for="value in [-5, -10, -20, -30]" :key="value" type="button" :class="{ active: stressPercent === value }" @click="setStress(value)">
          {{ value }}%
        </button>
      </div>
      <p>仅按当前持仓市值做线性估算，未考虑个股涨跌差异、流动性和手续费。</p>
    </section>

    <section class="radar-card">
      <div class="section-heading compact">
        <div>
          <span>RISK PROFILE</span>
          <h2>五维画像</h2>
        </div>
        <em>随账户变化</em>
      </div>
      <div class="radar-layout">
        <div class="radar-chart">
          <svg viewBox="0 0 120 120">
            <polygon v-for="scale in [0.33, 0.66, 1]" :key="scale" :points="`60,${60 - 48 * scale} ${60 + 45.6 * scale},${60 - 14.8 * scale} ${60 + 28.2 * scale},${60 + 38.8 * scale} ${60 - 28.2 * scale},${60 + 38.8 * scale} ${60 - 45.6 * scale},${60 - 14.8 * scale}`" />
            <polygon :points="radarPoints" class="radar-shape" />
            <line v-for="index in 5" :key="index" x1="60" y1="60" :x2="60 + Math.cos(-Math.PI / 2 + ((index - 1) * Math.PI * 2) / 5) * 48" :y2="60 + Math.sin(-Math.PI / 2 + ((index - 1) * Math.PI * 2) / 5) * 48" />
          </svg>
        </div>
        <div class="radar-legend">
          <span v-for="label in radarLabels" :key="label">{{ label }}</span>
        </div>
      </div>
    </section>

    <section class="allocation-analysis">
      <div class="section-heading compact">
        <div>
          <span>EXPOSURE</span>
          <h2>行业暴露</h2>
        </div>
        <em>{{ holdings.length }} 个持仓</em>
      </div>
      <div v-for="sector in sectorRows" :key="sector.name" class="exposure-row">
        <div class="exposure-label">
          <span><i :style="{ background: sector.color }" />{{ sector.name }}</span>
          <strong>{{ sector.percent.toFixed(1) }}%</strong>
        </div>
        <div class="exposure-track"><i :style="{ width: `${sector.percent}%`, background: sector.color }" /></div>
      </div>
    </section>

    <section class="behavior-card">
      <div class="section-heading compact">
        <div>
          <span>BEHAVIOR</span>
          <h2>投资行为</h2>
        </div>
        <em>本地记录</em>
      </div>
      <div class="behavior-grid">
        <div>
          <span class="behavior-icon"><Icon name="clock" :size="18" /></span>
          <strong>{{ portfolio.ledger.length }} 笔</strong>
          <small>累计交易</small>
        </div>
        <div>
          <span class="behavior-icon blue"><Icon name="chart" :size="18" /></span>
          <strong>{{ concentration.toFixed(0) }}%</strong>
          <small>最大单仓</small>
        </div>
        <div>
          <span class="behavior-icon green"><Icon name="shield" :size="18" /></span>
          <strong>{{ account.positionPercent.toFixed(0) }}%</strong>
          <small>当前仓位</small>
        </div>
      </div>
      <p><Icon name="sliders" :size="15" /> 当前最大单仓占总资产 {{ concentration.toFixed(1) }}%，现金占比 {{ (100 - account.positionPercent).toFixed(1) }}%。可在压力测试中观察不同跌幅下的资产变化。</p>
    </section>

    <button type="button" class="analysis-cta" @click="emit('open-ai')">
      <span><Icon name="message" :size="20" /></span>
      <div><strong>和观潮助手复盘当前组合</strong><small>结合实时行情与本地交易记录</small></div>
      <Icon name="arrowRight" :size="18" />
    </button>
  </div>
</template>
