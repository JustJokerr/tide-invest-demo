<script setup>
import { computed, ref, watch } from "vue";
import Icon from "./Icon.vue";
import { executeTrade, formatMoney, getPosition, tradingStatus } from "../stores/useMarket";
import { formatPrice } from "../utils/display";

const props = defineProps({
  open: { type: Boolean, default: false },
  stock: { type: Object, default: null },
  initialType: { type: String, default: "buy" },
  cash: { type: Number, default: 0 },
});

const emit = defineEmits(["close", "complete"]);
const type = ref("buy");
const shares = ref(100);
const note = ref("");

watch(
  () => [props.open, props.initialType],
  ([open, nextType]) => {
    if (open) {
      type.value = nextType || "buy";
      shares.value = 100;
      note.value = "";
    }
  },
  { immediate: true },
);

const position = computed(() => (props.stock ? getPosition(props.stock.code) : null));
const gross = computed(() => (props.stock?.price || 0) * shares.value);
const fee = computed(() => Math.max(5, gross.value * 0.00025) + (type.value === "sell" ? gross.value * 0.0005 : 0));
const total = computed(() => gross.value + fee.value);
const availableShares = computed(() =>
  Math.min(position.value?.availableShares ?? position.value?.shares ?? 0, position.value?.shares ?? 0),
);

function changeShares(amount) {
  shares.value = Math.max(100, shares.value + amount);
}

function submit() {
  const result = executeTrade({
    code: props.stock.code,
    type: type.value,
    shares: shares.value,
    price: props.stock.price,
    note: note.value,
  });
  emit("complete", result);
  if (result.ok) emit("close");
}
</script>

<template>
  <Transition name="sheet">
    <div v-if="open && stock" class="sheet-backdrop" @click.self="$emit('close')">
      <section class="bottom-sheet trade-sheet" role="dialog" aria-modal="true" aria-label="模拟交易">
        <div class="sheet-handle" />
        <header class="sheet-header">
          <div>
            <p>虚拟资金交易</p>
            <h2>{{ stock.name }} <small>{{ stock.code }}</small></h2>
          </div>
          <button type="button" class="icon-button" aria-label="关闭" @click="$emit('close')">
            <Icon name="close" :size="20" />
          </button>
        </header>

        <div class="trade-toggle">
          <button type="button" :class="{ active: type === 'buy', buy: type === 'buy' }" @click="type = 'buy'">买入</button>
          <button type="button" :class="{ active: type === 'sell', sell: type === 'sell' }" @click="type = 'sell'">卖出</button>
        </div>

        <div class="session-trade-banner" :class="{ open: tradingStatus.canTrade }">
          <Icon :name="tradingStatus.canTrade ? 'check' : 'clock'" :size="16" />
          <div>
            <strong>{{ tradingStatus.label }}</strong>
            <span>{{ tradingStatus.detail }}</span>
          </div>
        </div>

        <div class="trade-price-row">
          <span>委托价</span>
          <strong>¥ {{ formatPrice(stock.price) }}</strong>
          <small>模拟现价</small>
        </div>

        <label class="trade-field">
          <span>数量</span>
          <div class="stepper">
            <button type="button" aria-label="减少数量" @click="changeShares(-100)"><Icon name="minus" :size="17" /></button>
            <input v-model.number="shares" type="number" min="100" step="100" inputmode="numeric" />
            <span>股</span>
            <button type="button" aria-label="增加数量" @click="changeShares(100)"><Icon name="plus" :size="17" /></button>
          </div>
        </label>

        <div class="quantity-chips">
          <button v-for="amount in [100, 300, 500, 1000]" :key="amount" type="button" :class="{ active: shares === amount }" @click="shares = amount">
            {{ amount }}
          </button>
        </div>

        <label class="trade-note-field">
          <span>交易理由（可选）</span>
          <textarea v-model="note" maxlength="100" rows="2" placeholder="例如：按计划分批建仓，记录本次判断…" />
        </label>

        <div class="trade-available">
          <span v-if="type === 'buy'">可用资金 <strong>¥ {{ formatMoney(cash) }}</strong></span>
          <span v-else>可卖数量 <strong>{{ availableShares }} 股</strong></span>
          <span>预计费用 ¥{{ fee.toFixed(2) }}</span>
        </div>
        <p v-if="position?.pendingShares" class="t1-note">
          {{ position.pendingShares }} 股为当日买入，按 T+1 规则下一交易日可卖
        </p>

        <div class="trade-total">
          <span>{{ type === "buy" ? "预计支出" : "预计到账" }}</span>
          <strong>¥ {{ formatMoney(type === "buy" ? total : gross - fee) }}</strong>
        </div>

        <button type="button" class="primary-button trade-submit" :class="{ sell: type === 'sell' }" :disabled="!tradingStatus.canTrade" @click="submit">
          {{ tradingStatus.canTrade ? (type === "buy" ? "确认买入" : "确认卖出") : `${tradingStatus.label}，暂停成交` }}
        </button>
        <p class="legal-note">按 A 股交易时段模拟成交，执行 T+1 可卖规则；不构成投资建议。</p>
      </section>
    </div>
  </Transition>
</template>
