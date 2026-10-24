<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import AiSheet from "./components/AiSheet.vue";
import AuthSheet from "./components/AuthSheet.vue";
import BottomNav from "./components/BottomNav.vue";
import Icon from "./components/Icon.vue";
import StockPickerSheet from "./components/StockPickerSheet.vue";
import TradeSheet from "./components/TradeSheet.vue";
import {
  buildPortfolioSummary,
  getStock,
  hydratePortfolioState,
  portfolio,
  recordRecentView,
  refreshMarket,
  registerStock,
  resetMarketPrices,
  resetPortfolio,
  tradingStatus,
  unreadNotificationCount,
} from "./stores/useMarket";
import { authState, logoutAccount, restoreSession, saveUserState } from "./utils/auth";
import { resolvedTheme, setThemeMode, themeMode, toggleTheme } from "./utils/theme";
import { setSavedCompetitionCode, syncCompetitionSnapshot } from "./utils/competition";
import AlertsView from "./views/AlertsView.vue";
import CompetitionView from "./views/CompetitionView.vue";
import HomeView from "./views/HomeView.vue";
import InsightsView from "./views/InsightsView.vue";
import MarketView from "./views/MarketView.vue";
import PortfolioView from "./views/PortfolioView.vue";
import PortfolioReportView from "./views/PortfolioReportView.vue";
import ProfileView from "./views/ProfileView.vue";
import SearchView from "./views/SearchView.vue";
import StockDetailView from "./views/StockDetailView.vue";
import StockResearchView from "./views/StockResearchView.vue";

const mainViews = ["home", "market", "portfolio", "insights", "profile"];
const route = reactive({ view: "home", code: null });
const history = [];
const aiOpen = ref(false);
const authOpen = ref(false);
const tradeOpen = ref(false);
const tradeStock = ref(null);
const tradeType = ref("buy");
const pickerOpen = ref(false);
const pickerMode = ref("trade");
const resetOpen = ref(false);
const toast = reactive({ visible: false, message: "" });
let toastTimer;
let autoRefreshTimer;
let competitionTimer;
let accountSaveTimer;

const showBottomNav = computed(() => mainViews.includes(route.view));
const currentStock = computed(() => getStock(route.code) || null);

function scrollAppTop() {
  document.querySelector(".app-scroll")?.scrollTo({ top: 0, behavior: "auto" });
}

function navigate(view, payload = {}) {
  history.push({ ...route });
  route.view = view;
  route.code = payload.code || (view === "detail" ? route.code : null);
  scrollAppTop();
}

function goBack() {
  const previous = history.pop() || { view: "home", code: null };
  Object.assign(route, previous);
  scrollAppTop();
}

function selectStock(stock) {
  if (!stock) return;
  const registered = registerStock(stock);
  recordRecentView(registered.code);
  navigate("detail", { code: registered.code });
  if (!registered.live) {
    refreshMarket().then((result) => {
      if (!result.ok) notify(result.message);
    });
  }
}

function openTrade(payload) {
  tradeStock.value = payload.stock;
  tradeType.value = payload.type || "buy";
  tradeOpen.value = true;
}

function openTradePicker() {
  pickerMode.value = "trade";
  pickerOpen.value = true;
}

function openWatchPicker() {
  pickerMode.value = "watch";
  pickerOpen.value = true;
}

function selectFromPicker(stock) {
  if (pickerMode.value === "trade") {
    pickerOpen.value = false;
    openTrade({ stock, type: "buy" });
  }
}

function notify(message) {
  window.clearTimeout(toastTimer);
  toast.message = message;
  toast.visible = true;
  toastTimer = window.setTimeout(() => {
    toast.visible = false;
  }, 2400);
}

function completeTrade(result) {
  notify(result.message);
  if (result.ok) syncCompetitionSnapshot().catch(() => {});
}

async function handleAuthenticated(user) {
  if (user?.portfolio) hydratePortfolioState(user.portfolio);
  authState.user = user;
  authState.online = true;
  accountSaveTimer && window.clearTimeout(accountSaveTimer);
  await refreshMarket({ includeSectors: true });
  syncCompetitionSnapshot().catch(() => {});
}

async function handleLogout() {
  await logoutAccount();
  setSavedCompetitionCode("");
  resetPortfolio();
  resetMarketPrices();
  notify("已退出账号，已切回默认本地模拟账户");
}

function resetDemo() {
  resetPortfolio();
  resetMarketPrices();
  resetOpen.value = false;
  navigate("home");
  notify("模拟账户与行情已重置");
}

function handleEscape(event) {
  if (event.key !== "Escape") return;
  if (tradeOpen.value) tradeOpen.value = false;
  else if (aiOpen.value) aiOpen.value = false;
  else if (authOpen.value) authOpen.value = false;
  else if (resetOpen.value) resetOpen.value = false;
}

function applyAutoRefresh() {
  window.clearInterval(autoRefreshTimer);
  if (!portfolio.settings.autoRefresh) return;
  const interval = Math.max(8, Number(portfolio.settings.refreshSeconds) || 15) * 1000;
  autoRefreshTimer = window.setInterval(() => {
    if (document.visibilityState === "visible" && tradingStatus.value.phase === "trading") {
      refreshMarket();
    }
  }, interval);
}

function refreshOnVisible() {
  if (document.visibilityState === "visible" && tradingStatus.value.phase === "trading") refreshMarket();
}

function persistAccountState() {
  if (!authState.user) return;
  saveUserState(JSON.parse(JSON.stringify(portfolio)), {
    ...buildPortfolioSummary(),
  }).catch(() => {});
}

function flushAccountState() {
  window.clearTimeout(accountSaveTimer);
  persistAccountState();
}

watch(
  () => [portfolio.settings.autoRefresh, portfolio.settings.refreshSeconds],
  applyAutoRefresh,
);

watch(unreadNotificationCount, (count, previous) => {
  if (count > previous) notify("有一条价格提醒已触发");
});

watch(
  portfolio,
  () => {
    if (!authState.user) return;
    window.clearTimeout(accountSaveTimer);
    accountSaveTimer = window.setTimeout(persistAccountState, 900);
  },
  { deep: true },
);

onMounted(async () => {
  window.addEventListener("keydown", handleEscape);
  document.addEventListener("visibilitychange", refreshOnVisible);
  window.addEventListener("pagehide", flushAccountState);
  const restoredUser = await restoreSession();
  if (restoredUser?.portfolio) hydratePortfolioState(restoredUser.portfolio);
  else setSavedCompetitionCode("");
  await refreshMarket({ includeSectors: true });
  applyAutoRefresh();
  competitionTimer = window.setInterval(() => {
    if (document.visibilityState === "visible") syncCompetitionSnapshot().catch(() => {});
  }, 12000);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEscape);
  document.removeEventListener("visibilitychange", refreshOnVisible);
  window.removeEventListener("pagehide", flushAccountState);
  window.clearTimeout(toastTimer);
  window.clearInterval(autoRefreshTimer);
  window.clearInterval(competitionTimer);
  window.clearTimeout(accountSaveTimer);
});
</script>

<template>
  <div class="app-stage">
    <div class="ambient ambient-one" />
    <div class="ambient ambient-two" />
    <div class="phone-shell">
      <div class="app-scroll">
        <HomeView
          v-if="route.view === 'home'"
          @navigate="navigate"
          @select-stock="selectStock"
          @open-ai="aiOpen = true"
          @open-alerts="navigate('alerts')"
          @open-watch-picker="openWatchPicker"
          @notify="notify"
        />
        <MarketView
          v-else-if="route.view === 'market'"
          @navigate="navigate"
          @select-stock="selectStock"
          @open-ai="aiOpen = true"
          @open-alerts="navigate('alerts')"
          @open-watch-picker="openWatchPicker"
          @notify="notify"
        />
        <PortfolioView
          v-else-if="route.view === 'portfolio'"
          @navigate="navigate"
          @select-stock="selectStock"
          @open-ai="aiOpen = true"
          @open-trade="openTrade"
          @open-trade-picker="openTradePicker"
          @open-report="navigate('report')"
          @notify="notify"
        />
        <PortfolioReportView
          v-else-if="route.view === 'report'"
          @back="goBack"
          @notify="notify"
        />
        <InsightsView
          v-else-if="route.view === 'insights'"
          @navigate="navigate"
          @open-ai="aiOpen = true"
        />
        <ProfileView
          v-else-if="route.view === 'profile'"
          @notify="notify"
          @navigate="navigate"
          @reset="resetOpen = true"
          :theme-mode="themeMode"
          :resolved-theme="resolvedTheme"
          :auth-user="authState.user"
          :auth-online="authState.online"
          @set-theme="setThemeMode"
          @toggle-theme="toggleTheme"
          @open-auth="authOpen = true"
          @logout="handleLogout"
        />
        <SearchView
          v-else-if="route.view === 'search'"
          @back="goBack"
          @select-stock="selectStock"
        />
        <StockDetailView
          v-else-if="route.view === 'detail' && currentStock"
          :stock="currentStock"
          @back="goBack"
          @open-trade="openTrade"
          @open-ai="aiOpen = true"
          @open-alerts="navigate('alerts')"
          @open-research="navigate('research', { code: currentStock.code })"
          @notify="notify"
        />
        <StockResearchView
          v-else-if="route.view === 'research' && currentStock"
          :stock="currentStock"
          @back="goBack"
          @notify="notify"
        />
        <CompetitionView
          v-else-if="route.view === 'competition'"
          @back="goBack"
          @open-auth="authOpen = true"
          @notify="notify"
        />
        <AlertsView
          v-else-if="route.view === 'alerts'"
          @back="goBack"
          @select-stock="selectStock"
          @notify="notify"
        />
        <div v-else class="page fallback-page">
          <span><Icon name="search" :size="26" /></span>
          <h1>没有找到该标的</h1>
          <button type="button" class="primary-button" @click="navigate('home')">返回首页</button>
        </div>
      </div>

      <BottomNav v-if="showBottomNav" :active="route.view" @navigate="navigate" />
    </div>

    <Transition name="toast">
      <div v-if="toast.visible" class="toast-message" role="status">
        <Icon name="check" :size="16" />
        {{ toast.message }}
      </div>
    </Transition>

    <TradeSheet
      :open="tradeOpen"
      :stock="tradeStock"
      :initial-type="tradeType"
      :cash="portfolio.cash"
      @close="tradeOpen = false"
      @complete="completeTrade"
    />
    <StockPickerSheet
      :open="pickerOpen"
      :mode="pickerMode"
      @close="pickerOpen = false"
      @select="selectFromPicker"
      @notify="notify"
    />
    <AiSheet
      :open="aiOpen"
      @close="aiOpen = false"
      @notify="notify"
    />
    <AuthSheet
      :open="authOpen"
      @close="authOpen = false"
      @authenticated="handleAuthenticated"
      @notify="notify"
    />

    <Transition name="fade">
      <div v-if="resetOpen" class="confirm-backdrop" @click.self="resetOpen = false">
        <section class="confirm-modal" role="alertdialog" aria-modal="true">
          <span class="confirm-icon"><Icon name="refresh" :size="21" /></span>
          <h2>重置演示账户？</h2>
          <p>交易记录、自选列表和模拟资金将恢复初始状态。此操作不会删除浏览器之外的数据。</p>
          <div>
            <button type="button" class="secondary-button" @click="resetOpen = false">取消</button>
            <button type="button" class="primary-button" @click="resetDemo">确认重置</button>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>
