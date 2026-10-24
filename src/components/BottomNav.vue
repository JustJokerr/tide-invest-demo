<script setup>
import Icon from "./Icon.vue";

defineProps({
  active: { type: String, default: "home" },
});

defineEmits(["navigate"]);

const items = [
  { id: "home", label: "首页", icon: "home" },
  { id: "market", label: "行情", icon: "market" },
  { id: "portfolio", label: "模拟盘", icon: "portfolio" },
  { id: "insights", label: "分析", icon: "insights" },
  { id: "profile", label: "我的", icon: "user" },
];
</script>

<template>
  <nav class="bottom-nav" aria-label="主导航">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="nav-item"
      :class="{ active: active === item.id }"
      @click="$emit('navigate', item.id)"
    >
      <span class="nav-icon">
        <Icon :name="item.icon" :size="21" />
        <i v-if="active === item.id" />
      </span>
      <span>{{ item.label }}</span>
    </button>
  </nav>
</template>
