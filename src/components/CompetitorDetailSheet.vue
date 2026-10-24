<script setup>
import { computed, ref } from "vue";
import CompetitionShareCard from "./CompetitionShareCard.vue";
import Icon from "./Icon.vue";
import { formatMoney } from "../stores/useMarket";
import { formatPct, formatPrice, trendClass } from "../utils/display";

const props = defineProps({
  open: { type: Boolean, default: false },
  participant: { type: Object, default: null },
  roomCode: { type: String, default: "" },
  isMe: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "notify"]);
const shareOpen = ref(false);

const positions = computed(() =>
  (props.participant?.positions || []).map((position) => ({
    ...position,
    weight: props.participant?.totalAssets
      ? (Number(position.marketValue) / Number(props.participant.totalAssets)) * 100
      : 0,
  })),
);
</script>

<template>
  <Transition name="sheet">
    <div v-if="open && participant" class="sheet-backdrop competitor-backdrop" @click.self="$emit('close')">
      <section class="bottom-sheet competitor-sheet" role="dialog" aria-modal="true" aria-label="参赛者持仓详情">
        <div class="sheet-handle" />
        <header class="competitor-head">
          <div class="competitor-avatar">{{ participant.name.slice(0, 1) }}</div>
          <div>
            <span>{{ isMe ? "我的竞技组合" : "参赛者公开组合" }}</span>
            <h2>{{ participant.name }}</h2>
            <small>排名 #{{ participant.rank }} · 口令 {{ roomCode }}</small>
          </div>
          <button type="button" class="icon-button" aria-label="关闭" @click="$emit('close')"><Icon name="close" :size="20" /></button>
        </header>

        <section class="competitor-hero">
          <div>
            <span>模拟总资产</span>
            <strong>¥{{ formatMoney(participant.totalAssets, 2) }}</strong>
          </div>
          <div>
            <span>总收益率</span>
            <strong :class="trendClass(participant.returnPercent)">{{ formatPct(participant.returnPercent) }}</strong>
          </div>
        </section>

        <div class="competitor-metrics">
          <div><span>今日收益</span><strong :class="trendClass(participant.dailyPercent)">{{ formatPct(participant.dailyPercent || 0) }}</strong></div>
          <div><span>持仓盈亏</span><strong :class="trendClass(participant.totalProfit)">{{ Number(participant.totalProfit || 0) >= 0 ? "+" : "" }}¥{{ formatMoney(participant.totalProfit || 0, 0) }}</strong></div>
          <div><span>当前仓位</span><strong>{{ Number(participant.positionPercent || 0).toFixed(1) }}%</strong></div>
          <div><span>最大单仓</span><strong>{{ Number(participant.maxHoldingPercent || 0).toFixed(1) }}%</strong></div>
          <div><span>可用资金</span><strong>¥{{ formatMoney(participant.cash || 0, 0) }}</strong></div>
          <div><span>持仓数量</span><strong>{{ participant.holdingCount || positions.length }} 只</strong></div>
        </div>

        <div class="competitor-list-head">
          <div><span>POSITIONS</span><h3>详细持仓</h3></div>
          <em>{{ positions.length }} 个标的</em>
        </div>

        <div class="competitor-positions">
          <article v-for="position in positions" :key="position.code">
            <div class="competitor-position-name">
              <span>{{ (position.name || "?").slice(0, 1) }}</span>
              <div><strong>{{ position.name }}</strong><small>{{ position.code }} · {{ position.shares }} 股</small></div>
            </div>
            <div><span>平均成本</span><strong>¥{{ formatPrice(position.avgCost) }}</strong></div>
            <div><span>现价</span><strong>¥{{ formatPrice(position.price) }}</strong></div>
            <div><span>持仓盈亏</span><strong :class="trendClass(position.profit)">{{ Number(position.profit) >= 0 ? "+" : "" }}¥{{ formatMoney(position.profit, 0) }}</strong></div>
            <div><span>仓位占比</span><strong>{{ position.weight.toFixed(1) }}%</strong></div>
            <i><b :style="{ width: `${Math.min(100, position.weight)}%` }" /></i>
          </article>
          <div v-if="!positions.length" class="competitor-empty">
            <Icon name="portfolio" :size="25" />
            <span>参赛者暂未同步持仓</span>
          </div>
        </div>

        <div class="competitor-actions">
          <button type="button" class="secondary-button" @click="$emit('close')">关闭</button>
          <button type="button" class="primary-button" @click="shareOpen = true">
            <Icon name="share" :size="17" /> 分享战绩
          </button>
        </div>
        <p class="legal-note">持仓由参赛账号主动同步，仅用于课程演示；竞技收益不等于真实投资收益。</p>
      </section>

      <CompetitionShareCard
        :open="shareOpen"
        :participant="participant"
        :room-code="roomCode"
        @close="shareOpen = false"
        @notify="emit('notify', $event)"
      />
    </div>
  </Transition>
</template>
