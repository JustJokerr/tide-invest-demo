<script setup>
import { computed, useId } from "vue";

const props = defineProps({
  values: { type: Array, default: () => [] },
  positive: { type: Boolean, default: true },
  width: { type: Number, default: 84 },
  height: { type: Number, default: 32 },
  fill: { type: Boolean, default: true },
});

const gradientId = `spark-${useId().replaceAll(":", "")}`;

const geometry = computed(() => {
  const values = props.values.length ? props.values.map(Number) : [0, 0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = 2 + (index / (values.length - 1)) * (props.width - 4);
    const y = 3 + ((max - value) / range) * (props.height - 6);
    return [x, y];
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `M${points[0][0]},${props.height} L${line.replaceAll(" ", " L")} L${points.at(-1)[0]},${props.height} Z`;
  return { line, area };
});
</script>

<template>
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    :width="width"
    :height="height"
    class="sparkline"
    :class="positive ? 'spark-rise' : 'spark-fall'"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="currentColor" stop-opacity=".3" />
        <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path v-if="fill" :d="geometry.area" :fill="`url(#${gradientId})`" stroke="none" />
    <polyline :points="geometry.line" fill="none" stroke="currentColor" stroke-width="1.8" />
  </svg>
</template>
