<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { Dices, ChefHat, Settings } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => route.name)

const menus = [
  { name: 'lottery', label: '抽奖', icon: Dices },
  { name: 'kitchen', label: '后厨', icon: ChefHat },
  { name: 'settings', label: '设置', icon: Settings },
]

const itemWidth = 72
const itemGap = 6

const activeIndex = computed(() => {
  const index = menus.findIndex(menu => menu.name === currentRoute.value)
  return index >= 0 ? index : 0
})

const indicatorStyle = computed(() => ({
  transform: `translateX(${activeIndex.value * (itemWidth + itemGap)}px)`,
}))

function navigate(name: string) {
  router.push({ name })
}
</script>

<template>
  <div class="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
    <div class="pill-container">
      <div class="pill-bg glass-pill" />
      <div class="pill-inner">
        <div
          class="pill-indicator"
          :style="indicatorStyle"
        />
        <button
          v-for="menu in menus"
          :key="menu.name"
          class="pill-btn"
          :class="currentRoute === menu.name
            ? 'text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'"
          @click="navigate(menu.name)"
        >
          <component :is="menu.icon" class="h-4 w-4" />
          <span>{{ menu.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pill-container {
  position: relative;
  isolation: isolate;
}
.pill-bg {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  z-index: 0;
}
.pill-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 8px;
  gap: 6px;
}
.pill-indicator {
  position: absolute;
  left: 8px;
  top: 6px;
  height: 36px;
  width: 72px;
  border-radius: 9999px;
  background: var(--primary);
  box-shadow: 0 4px 12px color-mix(in oklch, var(--primary) 25%, transparent);
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}
.pill-btn {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  width: 72px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;
  transition: color 0.5s;
  flex-shrink: 0;
}
</style>
