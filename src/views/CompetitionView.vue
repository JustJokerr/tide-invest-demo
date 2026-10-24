<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import CompetitorDetailSheet from "../components/CompetitorDetailSheet.vue";
import Icon from "../components/Icon.vue";
import { account, formatMoney } from "../stores/useMarket";
import { authState } from "../utils/auth";
import {
  createCompetition,
  fetchCompetition,
  getSavedCompetitionCode,
  joinCompetition,
  setSavedCompetitionCode,
  syncCompetitionSnapshot,
} from "../utils/competition";
import { formatPct, trendClass } from "../utils/display";

const emit = defineEmits(["back", "notify", "open-auth"]);
const mode = ref("create");
const roomName = ref("观潮好友竞技场");
const joinCode = ref("");
const room = ref(null);
const selectedParticipantId = ref("");
const selectedMetric = ref("returnPercent");
const loading = ref(false);
const error = ref("");
const lastSync = ref(null);
let pollTimer;

const myId = computed(() => authState.user?.id || "");
const metrics = [
  { id: "returnPercent", label: "总收益" },
  { id: "dailyPercent", label: "今日" },
  { id: "totalAssets", label: "总资产" },
  { id: "defense", label: "低集中度" },
];
const rankedParticipants = computed(() => {
  const participants = [...(room.value?.participants || [])];
  if (selectedMetric.value === "defense") {
    return participants.sort((a, b) => (a.maxHoldingPercent || 0) - (b.maxHoldingPercent || 0));
  }
  return participants.sort(
    (a, b) => Number(b[selectedMetric.value] || 0) - Number(a[selectedMetric.value] || 0),
  );
});
const myRank = computed(
  () => rankedParticipants.value.findIndex((item) => item.id === myId.value) + 1 || 0,
);
const selectedParticipant = computed(() =>
  room.value?.participants?.find((participant) => participant.id === selectedParticipantId.value),
);
const roomStats = computed(() => {
  const participants = room.value?.participants || [];
  const leader = [...participants].sort((a, b) => b.returnPercent - a.returnPercent)[0];
  const average = participants.length
    ? participants.reduce((sum, participant) => sum + participant.returnPercent, 0) / participants.length
    : 0;
  const me = participants.find((participant) => participant.id === myId.value);
  return {
    leader,
    average,
    gap: me && leader ? me.returnPercent - leader.returnPercent : 0,
  };
});

async function syncRoom() {
  if (!room.value?.code) return;
  try {
    await syncCompetitionSnapshot();
    room.value = await fetchCompetition(room.value.code);
    lastSync.value = new Date();
    error.value = "";
  } catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : "竞技数据同步失败";
  }
}

async function createRoom() {
  if (loading.value) return;
  loading.value = true;
  error.value = "";
  try {
    room.value = await createCompetition(roomName.value);
    lastSync.value = new Date();
  } catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : "创建竞技失败";
  } finally {
    loading.value = false;
  }
}

async function joinRoom() {
  if (loading.value) return;
  if (!/^\d{6}$/.test(joinCode.value.trim())) {
    error.value = "请输入 6 位数字竞技口令";
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    room.value = await joinCompetition(joinCode.value);
    lastSync.value = new Date();
  } catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : "加入竞技失败";
  } finally {
    loading.value = false;
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

async function shareCode() {
  if (!room.value) return;
  const text = `观潮好友竞技口令：${room.value.code}\n打开观潮 App，进入“我的 → 好友竞技”，输入口令即可同步参赛。参赛后按模拟资产收益率实时排名。`;
  if (navigator.share) {
    try {
      await navigator.share({ title: "观潮好友竞技", text });
      return;
    } catch {
      // Falling back to clipboard also handles a dismissed share sheet.
    }
  }
  await copyText(text);
  emit("notify", "竞技口令已复制");
}

function leaveRoom() {
  setSavedCompetitionCode("");
  room.value = null;
  joinCode.value = "";
  emit("notify", "已退出当前竞技展示");
}

function openParticipant(participant) {
  selectedParticipantId.value = participant.id;
}

async function restoreRoom() {
  if (!authState.user) return;
  const savedCode = getSavedCompetitionCode();
  if (savedCode) {
    loading.value = true;
    try {
      room.value = await fetchCompetition(savedCode);
    } catch {
      setSavedCompetitionCode("");
    } finally {
      loading.value = false;
    }
  }
}

watch(() => authState.user, restoreRoom);

onMounted(async () => {
  await restoreRoom();
  pollTimer = window.setInterval(() => {
    if (room.value && document.visibilityState === "visible") syncRoom();
  }, 8000);
});

onBeforeUnmount(() => window.clearInterval(pollTimer));
</script>

<template>
  <div class="page competition-view">
    <header class="detail-header competition-header">
      <button type="button" class="icon-button" aria-label="返回" @click="emit('back')">
        <Icon name="arrowLeft" :size="21" />
      </button>
      <div class="detail-title">
        <strong>好友竞技</strong>
        <span>同一时间段 · 收益率排名</span>
      </div>
      <button type="button" class="icon-button" aria-label="刷新" @click="syncRoom">
        <Icon name="refresh" :size="19" />
      </button>
    </header>

    <main>
      <section v-if="!room" class="contest-intro">
        <span class="contest-trophy"><Icon name="trend" :size="28" /></span>
        <h1>和好友来一场<br />零风险的 A 股模拟赛</h1>
        <p>每位参赛者以加入时的模拟总资产为基准，按后续收益率同步排名。创建口令后发给好友，在同一局域网服务下即可参赛。</p>
      </section>

      <section v-if="!authState.user" class="contest-login-gate">
        <span><Icon name="user" :size="23" /></span>
        <strong>登录后才能参加好友竞技</strong>
        <p>账号会把同一用户的模拟资产同步到不同手机，并用于生成唯一参赛身份，避免不同设备的数据混在一起。</p>
        <button type="button" class="primary-button" @click="emit('open-auth')">登录或创建账号</button>
      </section>

      <template v-else-if="!room">
        <div class="contest-account-chip">
          <Icon name="user" :size="16" />
          <span>当前账号</span>
          <strong>{{ authState.user.displayName || authState.user.username }}</strong>
        </div>

        <div class="segmented contest-mode">
          <button type="button" :class="{ active: mode === 'create' }" @click="mode = 'create'">创建竞技</button>
          <button type="button" :class="{ active: mode === 'join' }" @click="mode = 'join'">输入口令</button>
        </div>

        <section v-if="mode === 'create'" class="contest-form-card">
          <label class="contest-field">
            <span>竞技名称</span>
            <input v-model="roomName" maxlength="24" />
          </label>
          <div class="contest-base">
            <span>起始模拟资产</span>
            <strong>¥{{ formatMoney(account.totalAssets) }}</strong>
          </div>
          <button type="button" class="primary-button contest-submit" :disabled="loading" @click="createRoom">
            {{ loading ? "正在创建…" : "生成竞技口令" }}
          </button>
        </section>

        <section v-else class="contest-form-card">
          <label class="contest-field">
            <span>6 位竞技口令</span>
            <input v-model="joinCode" class="contest-code-input" maxlength="6" inputmode="numeric" placeholder="000000" />
          </label>
          <div class="contest-base">
            <span>加入后以当前模拟资产开始计算收益</span>
            <strong>¥{{ formatMoney(account.totalAssets) }}</strong>
          </div>
          <button type="button" class="primary-button contest-submit" :disabled="loading" @click="joinRoom">
            {{ loading ? "正在加入…" : "加入好友竞技" }}
          </button>
        </section>

        <p v-if="error" class="competition-error">{{ error }}</p>
        <p class="contest-note">竞技数据保存在运行本应用的电脑服务中，服务重启后仍会保留；关闭服务后其他设备将无法加入。</p>
      </template>

      <template v-else>
        <section class="contest-room-head">
          <div>
            <span>{{ room.name }}</span>
            <h1>{{ room.code }}</h1>
            <p>把你的模拟资产收益率与好友同步比较</p>
          </div>
          <button type="button" @click="shareCode"><Icon name="share" :size="18" /> 分享口令</button>
        </section>

        <div class="contest-live-row">
          <span><i /> 同步竞技中 · {{ room.participants.length }} 人</span>
          <em>你当前第 {{ myRank }} 名</em>
        </div>

        <div class="contest-summary-grid">
          <div>
            <span>领先收益</span>
            <strong :class="trendClass(roomStats.leader?.returnPercent)">{{ formatPct(roomStats.leader?.returnPercent) }}</strong>
            <small>{{ roomStats.leader?.name || "等待数据" }}</small>
          </div>
          <div>
            <span>平均收益</span>
            <strong :class="trendClass(roomStats.average)">{{ formatPct(roomStats.average) }}</strong>
            <small>{{ room.participants.length }} 位参赛者</small>
          </div>
          <div>
            <span>距第一名</span>
            <strong :class="trendClass(roomStats.gap)">{{ formatPct(roomStats.gap) }}</strong>
            <small>按总收益率</small>
          </div>
        </div>

        <div class="contest-metric-tabs">
          <button
            v-for="item in metrics"
            :key="item.id"
            type="button"
            :class="{ active: selectedMetric === item.id }"
            @click="selectedMetric = item.id"
          >
            {{ item.label }}
          </button>
        </div>

        <section class="contest-leaderboard">
          <button
            v-for="(participant, index) in rankedParticipants"
            :key="participant.id"
            type="button"
            class="contest-entry"
            :class="{ me: participant.id === myId }"
            @click="openParticipant(participant)"
          >
            <span class="contest-rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
            <div class="contest-person">
              <strong>{{ participant.name }}<em v-if="participant.id === myId">我</em></strong>
              <small>{{ participant.holdingCount || participant.positions?.length || 0 }} 个持仓 · {{ participant.positions?.[0]?.name || "等待同步" }}</small>
            </div>
            <div class="contest-assets">
              <strong>¥{{ formatMoney(participant.totalAssets, 0) }}</strong>
              <small :class="trendClass(participant.returnPercent)">{{ formatPct(participant.returnPercent) }}</small>
            </div>
            <div class="contest-submetrics">
              <span>今日 <b :class="trendClass(participant.dailyPercent)">{{ formatPct(participant.dailyPercent || 0) }}</b></span>
              <span>仓位 <b>{{ formatPct(participant.positionPercent || 0) }}</b></span>
              <span>最大单仓 <b>{{ formatPct(participant.maxHoldingPercent || 0) }}</b></span>
              <span>持仓盈亏 <b :class="trendClass(participant.totalProfit)">{{ Number(participant.totalProfit || 0) >= 0 ? "+" : "" }}¥{{ formatMoney(participant.totalProfit || 0, 0) }}</b></span>
            </div>
            <Icon name="chevronRight" :size="15" class="contest-entry-arrow" />
          </button>
        </section>

        <section class="contest-rules">
          <strong>竞技规则</strong>
          <p>收益率 =（当前模拟总资产 - 加入时模拟总资产）÷ 加入时模拟总资产。页面打开期间约每 8 秒同步一次，资产基准不会因后续加入而重置。</p>
        </section>

        <div class="contest-room-actions">
          <button type="button" class="secondary-button" @click="syncRoom">立即同步</button>
          <button type="button" class="secondary-button" @click="leaveRoom">退出展示</button>
        </div>
        <p v-if="error" class="competition-error">{{ error }}</p>
        <p class="contest-note" v-if="lastSync">最近同步：{{ lastSync.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) }}</p>
      </template>
    </main>

    <CompetitorDetailSheet
      :open="Boolean(selectedParticipant)"
      :participant="selectedParticipant"
      :room-code="room?.code || ''"
      :is-me="selectedParticipant?.id === myId"
      @close="selectedParticipantId = ''"
      @notify="emit('notify', $event)"
    />
  </div>
</template>
