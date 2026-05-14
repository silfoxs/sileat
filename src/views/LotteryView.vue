<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Motion } from 'motion-v'
import { useFoodStore } from '../stores/food'
import { useLotteryStore } from '../stores/lottery'
import { UtensilsCrossed, MapPin } from 'lucide-vue-next'

const foodStore = useFoodStore()
const lotteryStore = useLotteryStore()

const cardRotation = ref(0)
const shimmerIndex = ref(0)
const showConfetti = ref(false)

const shimmerItems = ref<{ emoji: string; title: string; description: string }[]>([])

const currentItem = computed(() => {
  if (lotteryStore.isSpinning) return shimmerItems.value[shimmerIndex.value] || { emoji: '🍜', title: '加载中...', description: '' }
  return null
})

onMounted(async () => {
  await foodStore.loadAll()
  updateShimmerItems()
})

function updateShimmerItems() {
  const items = foodStore.items.filter(i => !i.skip_today).map(i => ({ emoji: i.emoji, title: i.title, description: i.description || '' }))
  shimmerItems.value = items.length > 0
    ? [...items, ...items, ...items].slice(0, 12)
    : [
        { emoji: '🍜', title: '兰州拉面', description: '一碗热腾腾的牛肉面' },
        { emoji: '🍕', title: '披萨', description: '芝士就是力量' },
        { emoji: '🍣', title: '寿司', description: '新鲜的鱼生搭配醋饭' },
      ]
}

async function handleSpin() {
  if (lotteryStore.isSpinning || foodStore.items.length === 0) return

  showConfetti.value = false

  const spinInterval = setInterval(() => {
    shimmerIndex.value = (shimmerIndex.value + 1) % shimmerItems.value.length
    cardRotation.value += 20
  }, 60)

  await lotteryStore.spin()

  clearInterval(spinInterval)
  cardRotation.value = 0
  showConfetti.value = true

  setTimeout(() => {
    showConfetti.value = false
  }, 3000)
}
</script>

<template>
  <div class="page-shell flex flex-col items-center">
    <Motion
      :initial="{ opacity: 0, y: -15 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5 }"
      class="relative z-10 flex w-full justify-center pt-16"
    >
      <div class="flex w-full max-w-sm flex-col items-center text-center">
        <h1 class="w-full text-center text-[34px] font-extrabold leading-tight text-foreground">今天吃什么</h1>
        <p class="mt-3 text-sm leading-6 text-muted-foreground">
          {{ foodStore.items.length > 0 ? '轻点卡片，把纠结交给运气。' : '先去后厨添加几个常吃选项。' }}
        </p>
      </div>
    </Motion>

    <div class="relative z-10 flex w-full flex-1 flex-col items-center justify-center">
      <Motion
        :style="{ perspective: '800px' }"
        class="w-full max-w-[330px] cursor-pointer select-none transition-transform active:scale-[0.98]"
        @click="handleSpin"
      >
        <div class="relative flex min-h-[318px] flex-col items-center justify-center p-8">
          <div class="treasure-aura" />
          <div class="treasure-shine" />
          <div class="treasure-core" />

          <template v-if="lotteryStore.isSpinning">
            <div
              class="relative z-10 flex flex-col items-center"
              :style="{ transform: `rotateY(${cardRotation}deg)` }"
            >
              <div class="mb-7 text-[7rem] leading-none transition-transform duration-75">
                {{ currentItem?.emoji }}
              </div>
              <h2 class="mb-3 max-w-full truncate text-[1.75rem] font-extrabold leading-tight text-foreground">
                {{ currentItem?.title }}
              </h2>
              <p v-if="currentItem?.description" class="mb-5 max-w-[260px] text-center text-base leading-7 text-muted-foreground">
                {{ currentItem?.description }}
              </p>
            </div>
          </template>

          <template v-else-if="lotteryStore.showResult && lotteryStore.result">
            <div class="relative z-10 mb-7 text-[7rem] leading-none drop-shadow-lg">{{ lotteryStore.result.emoji }}</div>
            <h2 class="relative z-10 mb-3 max-w-full truncate text-[1.75rem] font-extrabold leading-tight text-foreground">
              {{ lotteryStore.result.title }}
            </h2>
            <p v-if="lotteryStore.result.description" class="relative z-10 mb-5 max-w-[260px] text-center text-base leading-7 text-muted-foreground">
              {{ lotteryStore.result.description }}
            </p>
            <div v-if="lotteryStore.result.distance" class="relative z-10 flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary">
              <MapPin class="h-3.5 w-3.5" />
              <span class="text-sm font-medium">{{ lotteryStore.result.distance }}</span>
            </div>
          </template>

          <template v-else>
            <div class="relative z-10 mb-8 flex h-24 w-24 items-center justify-center rounded-lg bg-primary/10 shadow-inner">
              <UtensilsCrossed class="h-12 w-12 text-primary" />
            </div>
            <p class="relative z-10 mb-2 text-xl font-bold text-foreground">
              {{ foodStore.items.length > 0 ? '点击翻牌' : '暂无选项' }}
            </p>
            <p class="relative z-10 text-base text-muted-foreground">
              {{ foodStore.items.length > 0 ? '看看今天吃什么' : '先去后厨添加一些' }}
            </p>
          </template>
        </div>
      </Motion>

      <p class="relative z-10 mt-8 rounded-full bg-secondary/70 px-3 py-1 text-xs font-medium text-muted-foreground">
        {{ foodStore.items.length > 0 ? `${foodStore.items.length} 个选项等待翻牌` : '' }}
      </p>
    </div>

    <div v-if="showConfetti" class="fixed inset-0 pointer-events-none z-40">
      <div
        v-for="i in 24"
        :key="i"
        class="absolute animate-ping"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDuration: `${1 + Math.random() * 2}s`,
          animationDelay: `${Math.random() * 0.5}s`,
          fontSize: `${10 + Math.random() * 14}px`,
        }"
      >
        {{ ['🎉', '✨', '🎊', '⭐', '💫', '🌟'][i % 6] }}
      </div>
    </div>
  </div>
</template>
