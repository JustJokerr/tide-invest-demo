<script setup>
import { computed, onMounted, ref } from "vue";
import Icon from "../components/Icon.vue";
import {
  activeAlertCount,
  getStock,
  markNotificationsRead,
  portfolio,
  removePriceAlert,
} from "../stores/useMarket";
import { formatPrice, trendClass } from "../utils/display";

const emit = defineEmits(["back", "select-stock", "notify"]);
const tab = ref("active");

const visibleAlerts = computed(() =>
  portfolio.alerts.filter((alert) => (tab.value === "active" ? !alert.triggered : alert.triggered)),
);

function stockOf(alert) {
  return getStock(alert.code);
}

function remove(alert) {
  removePriceAlert(alert.id);
  emit("notify", "价格提醒已删除");
}

function openStock(alert) {
  const stock = stockOf(alert);
  if (stock) emit("select-stock", stock);
}

onMounted(markNotificationsRead);
</script>

<template>
  <div class="page alerts-view">
    <header class="detail-header alerts-header">
      <button type="button" class="icon-button" aria-label="返回" @click="emit('back')">
        <Icon name="arrowLeft" :size="21" />
      </button>
      <div class="detail-title">
        <strong>价格提醒</strong>
        <span>真实行情触发 · 本地通知</span>
      </div>
      <span class="alert-count-badge">{{ activeAlertCount }}</span>
    </header>

    <main>
      <section class="alerts-summary">
        <span class="alerts-summary-icon"><Icon name="bell" :size="21" /></span>
        <div>
          <span>正在监控</span>
          <strong>{{ activeAlertCount }} 条价格提醒</strong>
        </div>
        <small>页面打开时自动刷新</small>
      </section>

      <div class="segmented alert-tabs">
        <button type="button" :class="{ active: tab === 'active' }" @click="tab = 'active'">监控中</button>
        <button type="button" :class="{ active: tab === 'triggered' }" @click="tab = 'triggered'">已触发</button>
      </div>

      <section v-if="visibleAlerts.length" class="alert-list">
        <article v-for="alert in visibleAlerts" :key="alert.id" class="alert-card">
          <button type="button" class="alert-stock" @click="openStock(alert)">
            <span>{{ alert.name.slice(0, 1) }}</span>
            <div>
              <strong>{{ alert.name }}</strong>
              <small>{{ alert.code }} · {{ alert.direction === "above" ? "价格高于" : "价格低于" }} ¥{{ formatPrice(alert.target) }}</small>
            </div>
            <Icon name="chevronRight" :size="16" />
          </button>
          <div class="alert-progress">
            <div>
              <span>最新价</span>
              <strong :class="trendClass(stockOf(alert)?.changePercent)">
                ¥{{ formatPrice(stockOf(alert)?.price) }}
              </strong>
            </div>
            <div>
              <span>目标价</span>
              <strong>¥{{ formatPrice(alert.target) }}</strong>
            </div>
            <button type="button" @click="remove(alert)">删除</button>
          </div>
        </article>
      </section>

      <div v-else class="empty-state alerts-empty">
        <span><Icon :name="tab === 'active' ? 'bell' : 'check'" :size="28" /></span>
        <strong>{{ tab === "active" ? "暂无监控中的提醒" : "还没有触发记录" }}</strong>
        <p>在任意股票详情页点击“价格提醒”，设置你的目标价格。</p>
      </div>

      <section class="alert-help">
        <div class="section-heading compact">
          <div>
            <span>HOW IT WORKS</span>
            <h2>提醒如何工作</h2>
          </div>
        </div>
        <p>开启自动刷新后，应用会按设定间隔读取实时行情并检查目标价。提醒保存在当前浏览器，关闭页面后不会在后台运行。</p>
        <p>由于公开行情存在短时延迟，提醒触发价格仅用于学习与观察，不用于真实交易执行。</p>
      </section>
    </main>
  </div>
</template>
