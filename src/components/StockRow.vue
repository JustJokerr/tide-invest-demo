<script setup>
import { computed } from "vue";
import Sparkline from "./Sparkline.vue";
import { formatPct, formatPrice, trendClass } from "../utils/display";

const props = defineProps({
  stock: { type: Object, required: true },
  compact: { type: Boolean, default: false },
});

defineEmits(["select"]);

const percent = computed(() => {
  if (!props.stock.prevClose) return 0;
  return ((props.stock.price - props.stock.prevClose) / props.stock.prevClose) * 100;
});
</script>

<template>
  <button class="stock-row" :class="{ compact }" type="button" @click="$emit('select', stock)">
    <span class="stock-identity">
      <span class="stock-monogram">{{ stock.name.slice(0, 1) }}</span>
      <span class="stock-copy">
        <strong>{{ stock.name }}</strong>
        <small>{{ stock.code }} · {{ stock.sector }}</small>
      </span>
    </span>
    <span class="stock-spark">
      <Sparkline :values="stock.history" :positive="percent >= 0" :width="58" :height="25" />
    </span>
    <span class="stock-price" :class="trendClass(percent)">
      <strong>{{ formatPrice(stock.price) }}</strong>
      <small>{{ formatPct(percent) }}</small>
    </span>
  </button>
</template>
