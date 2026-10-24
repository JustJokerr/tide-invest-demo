<script setup>
import { nextTick, ref, watch } from "vue";
import Icon from "./Icon.vue";
import { account, formatMoney, holdings, portfolio } from "../stores/useMarket";

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "notify"]);

const input = ref("");
const loading = ref(false);
const messageList = ref(null);
const messages = ref([
  {
    id: 1,
    role: "assistant",
    text: "你好，我是观潮研究助手。我会用可解释的本地规则，结合实时行情与你的模拟账户做持仓复盘、风险梳理和条件情景分析，不会连接券商或执行真实交易。",
  },
]);

const suggestions = ["复盘我的持仓", "宁德时代的波动怎么看", "检查仓位集中度", "生成一份持仓笔记"];

watch(
  () => props.open,
  async (open) => {
    if (open) {
      await nextTick();
      scrollBottom();
    }
  },
);

function scrollBottom() {
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight;
  }
}

function buildReply(question) {
  const text = question.toLowerCase();
  const topHolding = holdings.value[0];
  const stockMessage = holdings.value
    .slice(0, 3)
    .map((item) => `${item.stock.name} ${item.profitPercent >= 0 ? "浮盈" : "浮亏"} ${Math.abs(item.profitPercent).toFixed(1)}%`)
    .join("，");

  if (text.includes("持仓") || text.includes("复盘")) {
    return `你的模拟账户当前总资产为 ¥${formatMoney(account.value.totalAssets)}，今日收益 ${account.value.dailyProfit >= 0 ? "+" : ""}¥${formatMoney(account.value.dailyProfit)}。\n\n主要持仓表现：${stockMessage || "暂无持仓"}。\n\n复盘建议：先检查单只股票是否超过总资产的 20%，再区分浮盈来自价格变化还是频繁交易。若某个方向持仓集中度过高，可以在模拟盘中练习分批调整。`;
  }
  if (text.includes("风险") || holdings.value.some((item) => text.includes(item.stock.name.toLowerCase()))) {
    const matchedHolding = holdings.value.find((item) => text.includes(item.stock.name.toLowerCase()));
    const stock = matchedHolding?.stock || holdings.value[0]?.stock;
    if (stock) {
      return `${stock.name} 当前价格为 ¥${stock.price.toFixed(2)}，今日涨跌 ${(((stock.price - stock.prevClose) / stock.prevClose) * 100).toFixed(2)}%，换手率 ${stock.turnover || "—"}%。\n\n可以从三个角度观察：\n1. 波动：今天日内振幅约 ${(((stock.high - stock.low) / stock.prevClose) * 100).toFixed(2)}%。\n2. 估值：当前动态市盈率 ${stock.pe || "—"}、市净率 ${stock.pb || "—"}。\n3. 仓位：如果它在账户中的占比过高，股价波动会被放大。\n\n以上是基于行情字段的观察，不构成买卖判断。`;
    }
      return "标的名称需要与当前行情对应。你可以输入具体股票名称，例如“宁德时代的波动怎么看”，我会结合实时行情字段和持仓进行分析。";
  }
  if (text.includes("稳健") || text.includes("策略")) {
    return `可以先建立三层模拟框架：\n1. 核心仓：选择波动和现金流更稳定的标的。\n2. 成长仓：控制在 1 至 2 个相关行业，避免重复押注。\n3. 现金仓：保留调整和纠错空间。\n\n当前账户仓位约 ${account.value.positionPercent.toFixed(1)}%，可用资金 ¥${formatMoney(portfolio.cash)}。这些只是情景框架，不是收益承诺。`;
  }
  if (text.includes("分化") || text.includes("市场") || text.includes("为什么")) {
      return "市场分化可以从三层观察：指数方向、行业相对强弱、个股量价关系。指数上涨并不代表所有持仓同时上涨，如果账户集中在一两个行业，组合体验可能与指数差异很大。可以进入行情页查看实时板块变化。";
  }
  if (text.includes("仓位") || text.includes("估值")) {
    return `账户当前仓位约 ${account.value.positionPercent.toFixed(1)}%，持仓市值 ¥${formatMoney(account.value.marketValue)}，可用资金 ¥${formatMoney(portfolio.cash)}。\n\n${account.value.positionPercent > 65 ? "仓位偏高，若市场快速回撤，账户波动会更明显。可在模拟盘中练习降低单一行业暴露。" : "仓位处于中等区间，仍有调整空间。"} 建议用模拟盘验证自己的阈值，而不是把固定比例当成标准答案。`;
  }
  if (topHolding) {
    return `当前最大持仓是 ${topHolding.stock.name}，实时价格 ¥${topHolding.stock.price.toFixed(2)}，模拟收益 ${topHolding.profitPercent >= 0 ? "+" : ""}${topHolding.profitPercent.toFixed(2)}%。\n\n可以继续观察成交量、今日价格区间和单一持仓占比。想深入分析时，可以直接问“${topHolding.stock.name}的波动怎么看”。`;
  }
  return "当前回答由本地规则生成。你可以让我解释账户收益、结合行情检查某个持仓，或生成一份模拟盘复盘。";
}

async function send(text = input.value) {
  const question = String(text || "").trim();
  if (!question || loading.value) return;
  messages.value.push({ id: Date.now(), role: "user", text: question });
  input.value = "";
  loading.value = true;
  await nextTick();
  scrollBottom();

  window.setTimeout(async () => {
    messages.value.push({
      id: Date.now() + 1,
      role: "assistant",
      text: buildReply(question),
    });
    loading.value = false;
    await nextTick();
    scrollBottom();
  }, 650);
}
</script>

<template>
  <Transition name="sheet">
    <div v-if="open" class="ai-overlay">
      <section class="ai-screen" role="dialog" aria-modal="true" aria-label="观潮研究助手">
        <header class="ai-header">
          <button type="button" class="icon-button" aria-label="关闭研究助手" @click="$emit('close')">
            <Icon name="close" :size="21" />
          </button>
          <div class="ai-identity">
            <span class="ai-avatar"><Icon name="sparkles" :size="18" /></span>
            <div>
            <strong>观潮助手</strong>
            <small>本地研究工具 · 非投资顾问</small>
            </div>
          </div>
          <button type="button" class="icon-button" aria-label="更多信息" @click="$emit('notify', '研究内容由本地规则生成，不连接外部 AI 服务')">
            <Icon name="info" :size="19" />
          </button>
        </header>

        <div ref="messageList" class="ai-messages">
          <div class="ai-day">今天</div>
          <article v-for="message in messages" :key="message.id" class="ai-message" :class="message.role">
            <span v-if="message.role === 'assistant'" class="ai-avatar mini"><Icon name="sparkles" :size="15" /></span>
            <div class="bubble">{{ message.text }}</div>
          </article>

          <article v-if="loading" class="ai-message assistant">
            <span class="ai-avatar mini"><Icon name="sparkles" :size="15" /></span>
            <div class="bubble typing"><i /><i /><i /></div>
          </article>
        </div>

        <div class="ai-composer">
          <div v-if="messages.length < 3" class="ai-suggestions">
            <button v-for="item in suggestions" :key="item" type="button" @click="send(item)">{{ item }}</button>
          </div>
          <form class="ai-input" @submit.prevent="send()">
            <input v-model="input" type="text" placeholder="问问持仓、风险或市场…" enterkeyhint="send" />
            <button type="submit" :disabled="!input.trim() || loading" aria-label="发送">
              <Icon name="send" :size="19" />
            </button>
          </form>
          <p>研究内容不构成投资建议 · 行情来自公开接口并可能延迟</p>
        </div>
      </section>
    </div>
  </Transition>
</template>
