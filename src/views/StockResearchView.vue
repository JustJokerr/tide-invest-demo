<script setup>
import { computed, onMounted, ref, watch } from "vue";
import Icon from "../components/Icon.vue";
import { formatCompactMoney, formatMoney, formatSigned } from "../stores/useMarket";
import { formatPct, formatPrice, trendClass } from "../utils/display";

const props = defineProps({
  stock: { type: Object, required: true },
});

const emit = defineEmits(["back", "notify"]);
const tab = ref("risk");
const loading = ref(true);
const error = ref("");
const data = ref(null);
let requestId = 0;

const quotePercent = computed(() => {
  if (!props.stock.prevClose) return 0;
  return ((props.stock.price - props.stock.prevClose) / props.stock.prevClose) * 100;
});

const riskTone = computed(() => {
  if (!data.value?.risk) return "neutral";
  return data.value.risk.score >= 68 ? "danger" : data.value.risk.score >= 45 ? "watch" : "safe";
});

const scoreStyle = computed(() => ({
  "--score": `${(data.value?.risk?.score || 0) * 2.95}deg`,
}));

const forecastBars = computed(() => {
  const scenarios = data.value?.forecast?.scenarios;
  if (!scenarios) return [];
  return [
    { key: "bullish", label: "偏强情景", value: scenarios.bullish, tone: "rise" },
    { key: "neutral", label: "震荡情景", value: scenarios.neutral, tone: "neutral" },
    { key: "bearish", label: "回落情景", value: scenarios.bearish, tone: "fall" },
  ];
});

async function loadAnalysis() {
  const currentRequest = ++requestId;
  loading.value = true;
  error.value = "";
  try {
    const query = new URLSearchParams({
      secid: props.stock.secid,
      name: props.stock.name,
      industry: props.stock.sector || "",
      turnover: String(props.stock.turnover || 0),
    });
    const response = await fetch(`/api/stock-analysis?${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "深度分析暂时不可用");
    if (currentRequest === requestId) data.value = payload;
  } catch (requestError) {
    if (currentRequest === requestId) {
      error.value = requestError instanceof Error ? requestError.message : "深度分析暂时不可用";
    }
  } finally {
    if (currentRequest === requestId) loading.value = false;
  }
}

function flowLabel(value) {
  const number = Number(value || 0);
  return `${number > 0 ? "+" : ""}${formatCompactMoney(number)}`;
}

watch(() => props.stock.secid, loadAnalysis);
onMounted(loadAnalysis);
</script>

<template>
  <div class="page research-view">
    <header class="detail-header research-header">
      <button type="button" class="icon-button" aria-label="返回" @click="emit('back')">
        <Icon name="arrowLeft" :size="21" />
      </button>
      <div class="detail-title">
        <strong>{{ stock.name }} · 深度分析</strong>
        <span>{{ stock.code }} · 风险、预测与财务诊断</span>
      </div>
      <button type="button" class="icon-button" aria-label="刷新分析" @click="loadAnalysis">
        <Icon name="refresh" :size="19" :class="{ spin: loading }" />
      </button>
    </header>

    <main>
      <section class="research-quote-line">
        <div>
          <span>现价</span>
          <strong :class="trendClass(quotePercent)">¥{{ formatPrice(stock.price) }}</strong>
        </div>
        <div>
          <span>今日涨跌</span>
          <strong :class="trendClass(quotePercent)">{{ formatPct(quotePercent) }}</strong>
        </div>
        <div>
          <span>换手率</span>
          <strong>{{ stock.turnover ? `${Number(stock.turnover).toFixed(2)}%` : "—" }}</strong>
        </div>
        <em v-if="data?.stale">缓存数据</em>
      </section>

      <div class="segmented research-tabs">
        <button type="button" :class="{ active: tab === 'risk' }" @click="tab = 'risk'">风险分析</button>
        <button type="button" :class="{ active: tab === 'forecast' }" @click="tab = 'forecast'">趋势预测</button>
        <button type="button" :class="{ active: tab === 'financial' }" @click="tab = 'financial'">财务诊股</button>
      </div>

      <div v-if="loading" class="research-loading">
        <i class="loading-ring" />
        <strong>正在计算 {{ tab === "financial" ? "财务指标" : tab === "forecast" ? "趋势模型" : "风险指标" }}</strong>
        <span>正在组合实时行情、历史K线与公开财务数据</span>
      </div>

      <div v-else-if="error" class="research-error">
        <span><Icon name="info" :size="26" /></span>
        <strong>分析数据暂时不可用</strong>
        <p>{{ error }}</p>
        <button type="button" class="primary-button" @click="loadAnalysis">重新加载</button>
      </div>

      <template v-else-if="data">
        <section v-if="tab === 'risk'" class="research-panel">
          <div class="risk-overview" :class="riskTone">
            <div>
              <span>综合风险</span>
              <h2>{{ data.risk.level }}风险</h2>
              <p>{{ data.risk.abnormal.label }}，{{ data.risk.turnover.label }}换手，近5日主力{{ data.risk.mainFlow.sum5 >= 0 ? "净流入" : "净流出" }} {{ flowLabel(Math.abs(data.risk.mainFlow.sum5)) }}。</p>
            </div>
            <div class="risk-gauge" :style="scoreStyle">
              <span><strong>{{ data.risk.score }}</strong><small>/100</small></span>
            </div>
          </div>

          <div class="risk-metric-grid">
            <article>
              <span class="risk-metric-icon"><Icon name="trend" :size="18" /></span>
              <small>价格异动</small>
              <strong>{{ data.risk.abnormal.label }}</strong>
              <em>涨跌 {{ formatPct(data.risk.abnormal.changePercent) }} · 振幅 {{ data.risk.abnormal.amplitude }}%</em>
            </article>
            <article>
              <span class="risk-metric-icon flow"><Icon name="wallet" :size="18" /></span>
              <small>今日主力资金</small>
              <strong :class="trendClass(data.risk.mainFlow.latest)">{{ flowLabel(data.risk.mainFlow.latest) }}</strong>
              <em>净占比 {{ formatPct(data.risk.mainFlow.latestPercent) }}</em>
            </article>
            <article>
              <span class="risk-metric-icon sector"><Icon name="market" :size="18" /></span>
              <small>所属板块</small>
              <strong>{{ data.risk.sector.name }}</strong>
              <em :class="trendClass(data.risk.sector.changePercent)">板块 {{ formatPct(data.risk.sector.changePercent) }}</em>
            </article>
            <article>
              <span class="risk-metric-icon turnover"><Icon name="refresh" :size="18" /></span>
              <small>换手率</small>
              <strong>{{ Number(data.risk.turnover.value).toFixed(2) }}%</strong>
              <em>{{ data.risk.turnover.label }}</em>
            </article>
          </div>

          <section class="flow-panel">
            <div class="section-heading compact">
              <div>
                <span>MAIN FLOW</span>
                <h2>近 5 日主力资金</h2>
              </div>
              <em>公开资金流数据</em>
            </div>
            <div class="flow-chart">
              <div v-for="item in data.risk.mainFlow.trend" :key="item.date" class="flow-column">
                <span>{{ flowLabel(item.mainNet) }}</span>
                <i
                  :class="trendClass(item.mainNet)"
                  :style="{ height: `${Math.max(8, Math.min(100, Math.abs(item.mainNet) / 400000000 * 100))}%` }"
                />
                <small>{{ item.date.slice(5) }}</small>
              </div>
            </div>
            <p class="research-disclaimer">主力资金按公开接口的资金流字段展示，不等同于机构真实持仓变化，也不代表未来走势。</p>
          </section>

          <section class="sector-verdict">
            <span><Icon name="market" :size="19" /></span>
            <div>
              <strong>板块解析</strong>
              <p>
                {{ data.risk.sector.name }} 板块当日 {{ formatPct(data.risk.sector.changePercent) }}，
                个股相对板块 {{ data.risk.sector.relative === null ? "暂无法比较" : `${formatSigned(data.risk.sector.relative)}%` }}。
                {{ data.risk.sector.relative > 0 ? "个股表现强于板块。" : data.risk.sector.relative < 0 ? "个股弱于板块，注意板块联动压力。" : "个股与板块表现接近。" }}
              </p>
            </div>
          </section>
        </section>

        <section v-else-if="tab === 'forecast'" class="research-panel">
          <div class="forecast-hero">
            <div>
              <span>规则模型 · 未来 5 日情景</span>
              <h2>{{ data.forecast.score >= 62 ? "趋势偏强" : data.forecast.score <= 38 ? "趋势偏弱" : "震荡等待方向" }}</h2>
              <p>{{ data.forecast.paragraph }}</p>
            </div>
            <div class="forecast-score">
              <strong>{{ data.forecast.score }}</strong>
              <small>趋势分</small>
            </div>
          </div>

          <section class="scenario-card">
            <div class="section-heading compact">
              <div>
                <span>SCENARIO WEIGHTS</span>
                <h2>情景权重</h2>
              </div>
              <em>非概率承诺</em>
            </div>
            <div v-for="item in forecastBars" :key="item.key" class="scenario-row">
              <span>{{ item.label }}</span>
              <div><i :class="item.tone" :style="{ width: `${item.value}%` }" /></div>
              <strong :class="item.tone">{{ item.value }}%</strong>
            </div>
          </section>

          <div class="forecast-levels">
            <article><span>支撑参考</span><strong class="fall">¥{{ formatPrice(data.forecast.support) }}</strong></article>
            <article><span>阻力参考</span><strong class="rise">¥{{ formatPrice(data.forecast.resistance) }}</strong></article>
          </div>

          <section class="indicator-card">
            <div class="section-heading compact">
              <div>
                <span>TECHNICAL SIGNALS</span>
                <h2>模型指标</h2>
              </div>
            </div>
            <div class="indicator-grid">
              <div><span>MA5</span><strong>{{ formatPrice(data.forecast.ma5) }}</strong></div>
              <div><span>MA10</span><strong>{{ formatPrice(data.forecast.ma10) }}</strong></div>
              <div><span>MA20</span><strong>{{ formatPrice(data.forecast.ma20) }}</strong></div>
              <div><span>RSI(14)</span><strong>{{ Number(data.forecast.rsi || 0).toFixed(1) }}</strong></div>
              <div><span>MACD</span><strong>{{ Number(data.forecast.macd || 0).toFixed(2) }}</strong></div>
              <div><span>年化波动</span><strong>{{ Number(data.forecast.annualizedVolatility || 0).toFixed(1) }}%</strong></div>
            </div>
          </section>
          <p class="research-disclaimer">趋势预测由均线、RSI、MACD、动量与波动率按固定规则计算，仅用于课程演示和风险认知，不构成收益预测或投资建议。</p>
        </section>

        <section v-else class="research-panel financial-panel">
          <div v-if="!data.financial?.available" class="research-error small">
            <span><Icon name="info" :size="24" /></span>
            <strong>财务数据暂不可用</strong>
            <p>这家公司可能尚未披露可用财务报告，或上游财务接口暂时波动。</p>
          </div>
          <template v-else>
            <div class="diagnosis-head">
              <div>
                <span>{{ data.financial.report }} · 截至 {{ data.financial.noticeDate }}</span>
                <h2>财务健康度 {{ data.financial.overallScore }}</h2>
                <p>按成长、盈利、运营、收益质量与财务风险五组公开指标综合计算。</p>
              </div>
              <strong>{{ data.financial.overallScore }}</strong>
            </div>

            <article v-for="group in data.financial.groups" :key="group.id" class="diagnosis-card">
              <header>
                <span><Icon :name="group.icon" :size="18" /></span>
                <div><strong>{{ group.title }}</strong><small>指标得分</small></div>
                <em>{{ group.score ?? "—" }}</em>
              </header>
              <div class="diagnosis-score-bar"><i :style="{ width: `${group.score || 0}%` }" /></div>
              <div class="diagnosis-metrics">
                <div v-for="item in group.items" :key="item.label">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.display }}</strong>
                </div>
              </div>
            </article>

            <p class="research-disclaimer">财务诊断依据公司最近一期公开报告计算。不同行业财务结构差异较大，单项指标不应脱离行业背景解读。</p>
          </template>
        </section>
      </template>
    </main>
  </div>
</template>
