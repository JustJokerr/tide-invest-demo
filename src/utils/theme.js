import { computed, ref, watch } from "vue";

const THEME_KEY = "tide-appearance-v1";

function loadThemeMode() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return ["auto", "day", "night"].includes(saved) ? saved : "auto";
  } catch {
    return "auto";
  }
}

export const themeMode = ref(loadThemeMode());
export const clockTick = ref(Date.now());

export const resolvedTheme = computed(() => {
  if (themeMode.value === "day") return "light";
  if (themeMode.value === "night") return "dark";
  const hour = new Date(clockTick.value).getHours();
  return hour >= 7 && hour < 19 ? "light" : "dark";
});

export const themeLabel = computed(() => {
  if (themeMode.value === "day") return "日间模式";
  if (themeMode.value === "night") return "夜间模式";
  return "自动模式";
});

export function setThemeMode(mode) {
  if (!["auto", "day", "night"].includes(mode)) return;
  themeMode.value = mode;
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    // Theme still changes for the current session when storage is unavailable.
  }
}

export function toggleTheme() {
  setThemeMode(resolvedTheme.value === "light" ? "night" : "day");
}

watch(
  resolvedTheme,
  (theme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  },
  { immediate: true },
);

if (typeof window !== "undefined") {
  window.setInterval(() => {
    clockTick.value = Date.now();
  }, 60000);
}
