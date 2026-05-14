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

const activeIndex = computed(() => {
  const index = menus.findIndex(menu => menu.name === currentRoute.value)
  return index >= 0 ? index : 0
})

const indicatorStyle = computed(() => ({
  transform: `translateX(${activeIndex.value * 72}px)`,
}))

function navigate(name: string) {
  router.push({ name })
}
</script>

<template>
  <div class="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
    <div class="glass-pill relative flex h-12 items-center gap-1.5 overflow-hidden rounded-full px-2">
      <div
        class="pointer-events-none absolute left-2 top-1.5 h-9 w-[72px] rounded-full bg-primary shadow-md shadow-primary/25 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        :style="indicatorStyle"
      />
      <button
        v-for="menu in menus"
        :key="menu.name"
        class="relative z-10 flex h-9 w-[72px] items-center justify-center gap-2 rounded-full text-xs font-semibold outline-none transition-colors duration-500"
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
</template>
