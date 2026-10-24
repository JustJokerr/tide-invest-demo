<script setup>
import { computed, ref, watch } from "vue";
import Icon from "./Icon.vue";
import { buildPortfolioSummary, portfolio } from "../stores/useMarket";
import { authState, loginAccount, registerAccount } from "../utils/auth";

const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "authenticated", "notify"]);
const mode = ref("login");
const username = ref("");
const password = ref("");
const displayName = ref("");
const confirmPassword = ref("");
const error = ref("");
const submitting = ref(false);

const canSubmit = computed(
  () =>
    username.value.trim().length >= 3 &&
    password.value.length >= 6 &&
    (mode.value === "login" || password.value === confirmPassword.value),
);

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    error.value = "";
    password.value = "";
    confirmPassword.value = "";
  },
);

async function submit() {
  if (!canSubmit.value || submitting.value) return;
  error.value = "";
  submitting.value = true;
  try {
    let user;
    if (mode.value === "login") {
      user = await loginAccount({ username: username.value.trim(), password: password.value });
    } else {
      user = await registerAccount({
        username: username.value.trim(),
        password: password.value,
        displayName: displayName.value.trim() || username.value.trim(),
        portfolio: JSON.parse(JSON.stringify(portfolio)),
        summary: buildPortfolioSummary(),
      });
    }
    emit("authenticated", user);
    emit("notify", mode.value === "login" ? "账号登录成功，模拟数据已同步" : "账号创建成功，模拟数据已保存到云端");
    emit("close");
  } catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : authState.error || "账户操作失败";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <Transition name="sheet">
    <div v-if="open" class="sheet-backdrop auth-backdrop" @click.self="$emit('close')">
      <section class="bottom-sheet auth-sheet" role="dialog" aria-modal="true" aria-label="账号登录">
        <div class="sheet-handle" />
        <header class="sheet-header">
          <div>
            <p>ACCOUNT SYNC</p>
            <h2>{{ mode === "login" ? "登录观潮账号" : "创建观潮账号" }}</h2>
          </div>
          <button type="button" class="icon-button" aria-label="关闭" @click="$emit('close')">
            <Icon name="close" :size="20" />
          </button>
        </header>

        <div class="auth-intro">
          <span><Icon name="user" :size="20" /></span>
          <p>登录后，模拟持仓、自选、提醒、财报和竞技身份会同步到你访问该服务的不同设备。</p>
        </div>

        <div class="segmented auth-tabs">
          <button type="button" :class="{ active: mode === 'login' }" @click="mode = 'login'">登录</button>
          <button type="button" :class="{ active: mode === 'register' }" @click="mode = 'register'">注册</button>
        </div>

        <form class="auth-form" @submit.prevent="submit">
          <label>
            <span>用户名</span>
            <input v-model="username" autocomplete="username" maxlength="24" placeholder="3-24 位字母、数字或中文" />
          </label>
          <label v-if="mode === 'register'">
            <span>显示名称</span>
            <input v-model="displayName" maxlength="20" placeholder="好友竞技中显示的名字" />
          </label>
          <label>
            <span>密码</span>
            <input v-model="password" type="password" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" maxlength="64" placeholder="至少 6 位" />
          </label>
          <label v-if="mode === 'register'">
            <span>确认密码</span>
            <input v-model="confirmPassword" type="password" autocomplete="new-password" maxlength="64" placeholder="再次输入密码" />
          </label>

          <p v-if="mode === 'register' && confirmPassword && password !== confirmPassword" class="auth-error">两次输入的密码不一致</p>
          <p v-if="error" class="auth-error">{{ error }}</p>

          <button type="submit" class="primary-button auth-submit" :disabled="!canSubmit || submitting">
            {{ submitting ? "正在连接…" : mode === "login" ? "登录并同步数据" : "创建账号并保存当前数据" }}
          </button>
        </form>

        <p class="auth-note">账号与模拟数据仅保存在运行当前应用的电脑服务中，属于课程演示级本地账户系统。</p>
      </section>
    </div>
  </Transition>
</template>
