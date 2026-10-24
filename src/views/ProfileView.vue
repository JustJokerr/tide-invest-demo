<script setup>
import { computed } from "vue";
import Icon from "../components/Icon.vue";
import { account, activeAlertCount, formatMoney, holdings, portfolio, updateMarketSettings } from "../stores/useMarket";

const props = defineProps({
  themeMode: { type: String, default: "auto" },
  resolvedTheme: { type: String, default: "dark" },
  authUser: { type: Object, default: null },
  authOnline: { type: Boolean, default: false },
});

const emit = defineEmits(["notify", "reset", "navigate", "set-theme", "toggle-theme", "open-auth", "logout"]);

const menuGroups = computed(() => [
  {
    title: "我的工具",
    items: [
      { icon: "portfolio", label: "模拟账户", detail: "资金与持仓", action: "portfolio" },
      { icon: "edit", label: "资金记账", detail: `${portfolio.ledger.length} 笔记录`, action: "portfolio" },
      { icon: "bell", label: "价格提醒", detail: `${activeAlertCount.value} 条正在监控`, action: "alerts" },
      { icon: "sliders", label: "持仓压力测试", detail: "在分析页调整假设跌幅", action: "insights" },
      { icon: "trend", label: "好友竞技", detail: "分享口令并同步收益率排名", action: "competition" },
    ],
  },
  {
    title: "设置与说明",
    items: [
      {
        icon: "shield",
        label: "数据与隐私",
        detail: props.authUser ? "账号数据保存在本地服务" : "游客数据只保存在当前浏览器",
        action: props.authUser
          ? `账号 ${props.authUser.username} 的模拟数据保存在运行服务的电脑中`
          : "游客账户、持仓、交易笔记与价格提醒均保存在当前浏览器",
      },
      { icon: "info", label: "行情说明", detail: "公开接口与延迟", action: "行情来自公开市场接口，短时延迟可能影响价格提醒" },
    ],
  },
]);

function handleItem(item) {
  if (["portfolio", "alerts", "insights", "competition"].includes(item.action)) emit("navigate", item.action);
  else emit("notify", item.action);
}

function toggleAutoRefresh() {
  updateMarketSettings({ autoRefresh: !portfolio.settings.autoRefresh });
  emit("notify", portfolio.settings.autoRefresh ? "自动刷新已开启" : "已切换为手动刷新");
}

function setRefreshSeconds(seconds) {
  updateMarketSettings({ refreshSeconds: seconds });
}
</script>

<template>
  <div class="page profile-view">
    <header class="profile-hero">
      <div class="profile-top">
        <div class="brand-lockup small">
          <span class="brand-mark"><i /><i /><i /></span>
          <strong>观潮</strong>
        </div>
        <button type="button" class="icon-button" aria-label="切换昼夜模式" @click="emit('toggle-theme')">
          <Icon :name="resolvedTheme === 'light' ? 'moon' : 'sun'" :size="20" />
        </button>
      </div>
      <div class="profile-user">
        <span class="avatar">澜<small>Lv.3</small></span>
        <div>
          <h1>{{ authUser?.displayName || "访客体验官" }}</h1>
          <p>{{ authUser ? `@${authUser.username} · 数据已绑定账号` : "本地访客 · 登录后可跨设备同步" }}</p>
        </div>
      </div>
      <div class="profile-stats">
        <div><strong>{{ portfolio.ledger.length }}</strong><span>累计交易</span></div>
        <div><strong>{{ holdings.length }}</strong><span>当前持仓</span></div>
        <div><strong>{{ portfolio.watchlist.length }}</strong><span>自选标的</span></div>
      </div>
    </header>

    <main>
      <button type="button" class="profile-asset-link" @click="emit('navigate', 'portfolio')">
        <div>
          <span>模拟账户总资产</span>
          <strong>¥ {{ formatMoney(account.totalAssets) }}</strong>
        </div>
        <span>查看详情 <Icon name="chevronRight" :size="15" /></span>
      </button>

      <section class="account-status-card" :class="{ online: authUser }">
        <span><Icon :name="authUser ? 'shield' : 'user'" :size="19" /></span>
        <div>
          <strong>{{ authUser ? "观潮账号已登录" : "登录或创建账号" }}</strong>
          <small>{{ authUser ? `${authUser.displayName || authUser.username} · 模拟持仓跨设备同步` : "让不同手机看到同一套模拟资产与竞技身份" }}</small>
        </div>
        <button v-if="authUser" type="button" @click="emit('logout')">退出</button>
        <button v-else type="button" @click="emit('open-auth')">登录</button>
      </section>

      <section class="appearance-card">
        <div class="appearance-head">
          <span class="appearance-icon"><Icon :name="resolvedTheme === 'light' ? 'sun' : 'moon'" :size="18" /></span>
          <div>
            <strong>外观模式</strong>
            <small>自动模式在每天 07:00 至 19:00 使用日间主题</small>
          </div>
          <em>{{ resolvedTheme === "light" ? "日间" : "夜间" }}</em>
        </div>
        <div class="appearance-options">
          <button type="button" :class="{ active: themeMode === 'auto' }" @click="emit('set-theme', 'auto')">
            <Icon name="clock" :size="15" /> 自动
          </button>
          <button type="button" :class="{ active: themeMode === 'day' }" @click="emit('set-theme', 'day')">
            <Icon name="sun" :size="15" /> 日间
          </button>
          <button type="button" :class="{ active: themeMode === 'night' }" @click="emit('set-theme', 'night')">
            <Icon name="moon" :size="15" /> 夜间
          </button>
        </div>
      </section>

      <section class="refresh-settings-card">
        <div class="refresh-settings-copy">
          <span><Icon name="refresh" :size="18" /></span>
          <div>
            <strong>真实行情自动刷新</strong>
            <small>页面保持打开时读取公开行情</small>
          </div>
          <button type="button" class="switch-button" :class="{ active: portfolio.settings.autoRefresh }" role="switch" :aria-checked="portfolio.settings.autoRefresh" @click="toggleAutoRefresh">
            <i />
          </button>
        </div>
        <div v-if="portfolio.settings.autoRefresh" class="refresh-interval">
          <span>刷新间隔</span>
          <button v-for="seconds in [10, 15, 30]" :key="seconds" type="button" :class="{ active: portfolio.settings.refreshSeconds === seconds }" @click="setRefreshSeconds(seconds)">
            {{ seconds }} 秒
          </button>
        </div>
      </section>

      <section class="learning-card">
        <div class="learning-visual">
          <span>05</span>
          <i />
        </div>
        <div>
          <span>今日投资小课</span>
          <h2>K 线不是预言，<br />而是共识的脚印。</h2>
          <p>用 3 分钟认识影线、实体与成交量。</p>
          <button type="button" @click="emit('notify', '课程内容为演示占位')">开始学习 <Icon name="arrowRight" :size="14" /></button>
        </div>
      </section>

      <section v-for="group in menuGroups" :key="group.title" class="profile-menu-group">
        <h2>{{ group.title }}</h2>
        <div class="profile-menu">
          <button v-for="item in group.items" :key="item.label" type="button" @click="handleItem(item)">
            <span class="menu-icon"><Icon :name="item.icon" :size="18" /></span>
            <span class="menu-copy"><strong>{{ item.label }}</strong><small>{{ item.detail }}</small></span>
            <Icon name="chevronRight" :size="17" />
          </button>
        </div>
      </section>

      <button type="button" class="reset-demo" @click="emit('reset')">
        <Icon name="refresh" :size="17" />
        重置模拟账户与行情缓存
      </button>

      <footer class="profile-footer">
        <span class="brand-mark small"><i /><i /><i /></span>
        <strong>观潮 · A 股行情与模拟交易</strong>
        <p>课程设计 · Version 4.1.0</p>
        <small>行情来自公开市场接口，可能存在延时。模拟账户、交易笔记与价格提醒仅保存在本机，不构成投资建议。</small>
      </footer>
    </main>
  </div>
</template>
