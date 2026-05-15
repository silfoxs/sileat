<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { Motion } from 'motion-v'
import { useFoodStore } from '../stores/food'
import { useLotteryStore } from '../stores/lottery'
import { Button } from '@/components/ui/button'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from 'reka-ui'
import { UtensilsCrossed, MapPin, Check, Tags, X } from 'lucide-vue-next'

const foodStore = useFoodStore()
const lotteryStore = useLotteryStore()

const shimmerIndex = ref(0)
const showConfetti = ref(false)
const spinPhase = ref<'idle' | 'spinning' | 'result'>('idle')
const spinSpeed = ref(60)
const cardScale = ref(1)
const glowIntensity = ref(0)
const selectedTag = ref<string | null>(null)
const showTagDialog = ref(false)

const fallbackShimmerItems = [
  { emoji: '🍜', title: '兰州拉面', description: '一碗热腾腾的牛肉面' },
  { emoji: '🍕', title: '披萨', description: '芝士就是力量' },
  { emoji: '🍣', title: '寿司', description: '新鲜的鱼生搭配醋饭' },
]

const shimmerItems = ref<{ emoji: string; title: string; description: string }[]>(fallbackShimmerItems)

const selectedTagName = computed(() => selectedTag.value ?? '全部')

const filteredItems = computed(() => foodStore.items.filter(item => {
  if (item.skip_today) return false
  if (!selectedTag.value) return true
  return item.tags.includes(selectedTag.value)
}))

const availableCount = computed(() => filteredItems.value.length)

const currentItem = computed(() => {
  if (spinPhase.value === 'spinning') return shimmerItems.value[shimmerIndex.value] || { emoji: '🍜', title: '加载中...', description: '' }
  return null
})

onMounted(() => {
  updateShimmerItems()
})

function updateShimmerItems() {
  const items = filteredItems.value.map(i => ({ emoji: i.emoji, title: i.title, description: i.description || '' }))
  shimmerItems.value = items.length > 0 ? [...items, ...items, ...items].slice(0, 12) : fallbackShimmerItems
}

function getTagCount(tag: string | null) {
  return foodStore.items.filter(item => !item.skip_today && (!tag || item.tags.includes(tag))).length
}

function selectTag(tag: string | null) {
  selectedTag.value = tag
  showTagDialog.value = false
  spinPhase.value = 'idle'
  showConfetti.value = false
  lotteryStore.reset()
  updateShimmerItems()
}

async function openTagDialog() {
  showTagDialog.value = true
  if (!foodStore.loaded) {
    await foodStore.loadAll()
    updateShimmerItems()
  }
}

function waitForFirstSpinPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 120)
      })
    })
  })
}

function runSpinAnimation(canFinish: () => boolean) {
  let elapsed = 0
  const totalDuration = 2200
  let lastFrame = performance.now()
  let nextShuffleAt = 0

  return new Promise<void>((resolve) => {
    function frame(now: number) {
      const dt = now - lastFrame
      lastFrame = now
      elapsed += dt

      const progress = Math.min(elapsed / totalDuration, 1)
      spinSpeed.value = 40 + progress * 200
      cardScale.value = 1 + Math.sin(elapsed * 0.01) * 0.03
      glowIntensity.value = progress * 0.6

      if (elapsed >= nextShuffleAt) {
        shimmerIndex.value = (shimmerIndex.value + 1) % shimmerItems.value.length
        nextShuffleAt = elapsed + spinSpeed.value
      }

      if (progress >= 1 && canFinish()) {
        resolve()
      } else {
        requestAnimationFrame(frame)
      }
    }

    requestAnimationFrame(frame)
  })
}

async function handleSpin() {
  if (spinPhase.value !== 'idle' && spinPhase.value !== 'result') return
  if (foodStore.loaded && availableCount.value === 0) return

  updateShimmerItems()
  showConfetti.value = false
  spinPhase.value = 'spinning'
  spinSpeed.value = 50
  glowIntensity.value = 0
  let resultReady = false
  let hasCandidates = true

  await nextTick()
  const animation = runSpinAnimation(() => resultReady)
  await waitForFirstSpinPaint()

  try {
    if (!foodStore.loaded) {
      await foodStore.loadAll()
      updateShimmerItems()
    }

    const candidates = filteredItems.value
    if (candidates.length === 0) {
      lotteryStore.reset()
      hasCandidates = false
    } else {
      lotteryStore.spin(candidates)
    }
  } catch (error) {
    console.error('Failed to load lottery candidates', error)
    lotteryStore.reset()
    hasCandidates = false
  } finally {
    resultReady = true
  }

  await animation

  if (!hasCandidates || !lotteryStore.result) {
    spinPhase.value = 'idle'
    cardScale.value = 1
    glowIntensity.value = 0
    return
  }

  // Show result directly
  spinPhase.value = 'result'
  cardScale.value = 1
  glowIntensity.value = 0.3
  showConfetti.value = true

  setTimeout(() => {
    showConfetti.value = false
  }, 4000)
}
</script>

<template>
  <div class="page-shell flex flex-col items-center">
    <span class="emoji-prewarm" aria-hidden="true">
      {{ fallbackShimmerItems.map(item => item.emoji).join('') }}
    </span>

    <Motion
      :initial="{ opacity: 0, y: -15 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5 }"
      class="relative z-10 flex w-full justify-center pt-16"
    >
      <div class="flex w-full max-w-sm flex-col items-center text-center">
        <h1 class="w-full text-center text-[34px] font-extrabold leading-tight text-foreground">今天吃什么</h1>
        <p class="mt-3 text-sm leading-6 text-muted-foreground">
          {{ !foodStore.loaded || availableCount > 0 ? '轻点卡片，把纠结交给运气。' : '先去后厨添加几个常吃选项。' }}
        </p>
      </div>
    </Motion>

    <div class="relative z-10 flex w-full flex-1 flex-col items-center justify-center">
      <div
        class="relative w-full max-w-[330px] cursor-pointer select-none"
        :style="{ perspective: '800px' }"
        @click="handleSpin"
      >
        <!-- Glow ring behind card -->
        <div
          class="absolute inset-0 -m-4 rounded-2xl transition-all duration-500"
          :style="{
            opacity: glowIntensity,
            boxShadow: `0 0 60px 20px color-mix(in oklch, var(--primary) ${glowIntensity * 40}%), 0 0 120px 40px color-mix(in oklch, var(--accent) ${glowIntensity * 20}%)`,
          }"
        />

        <div
          class="lottery-card relative flex min-h-[318px] flex-col items-center justify-center rounded-2xl p-8 transition-transform"
          :style="{
            transform: `scale(${cardScale})`,
            transitionDuration: '100ms',
            transitionTimingFunction: 'ease-out',
          }"
        >
          <div class="treasure-aura" />
          <div class="treasure-shine" />
          <div class="treasure-core" />

          <!-- Spinning state -->
          <template v-if="spinPhase === 'spinning'">
            <div class="relative z-10 flex flex-col items-center">
              <Motion
                :key="shimmerIndex"
                :initial="{ opacity: 0.4, scale: 0.85, y: 10 }"
                :animate="{ opacity: 1, scale: 1, y: 0 }"
                :transition="{ duration: 0.08 }"
                class="flex flex-col items-center"
              >
                <div class="mb-7 text-[7rem] leading-none">
                  {{ currentItem?.emoji }}
                </div>
                <h2 class="mb-3 max-w-full truncate text-[1.75rem] font-extrabold leading-tight text-foreground">
                  {{ currentItem?.title }}
                </h2>
                <p v-if="currentItem?.description" class="mb-5 max-w-[260px] text-center text-base leading-7 text-muted-foreground">
                  {{ currentItem?.description }}
                </p>
              </Motion>
            </div>
          </template>

          <!-- Result state -->
          <template v-else-if="spinPhase === 'result' && lotteryStore.result">
            <Motion
              :initial="{ opacity: 0, scale: 0.8, y: 20 }"
              :animate="{ opacity: 1, scale: 1, y: 0 }"
              :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
              class="relative z-10 flex flex-col items-center"
            >
              <div class="mb-7 text-[7rem] leading-none drop-shadow-lg">{{ lotteryStore.result.emoji }}</div>
              <div class="mb-3 flex items-center justify-center gap-2">
                <h2 class="max-w-full truncate text-[1.75rem] font-extrabold leading-tight text-foreground">
                  {{ lotteryStore.result.title }}
                </h2>
                <span v-if="lotteryStore.result.distance" class="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                  <MapPin class="h-3.5 w-3.5" />
                  {{ lotteryStore.result.distance }}
                </span>
              </div>
              <p v-if="lotteryStore.result.description" class="mb-5 max-w-[260px] text-center text-base leading-7 text-muted-foreground">
                {{ lotteryStore.result.description }}
              </p>
            </Motion>
          </template>

          <!-- Idle state -->
          <template v-else>
            <div class="relative z-10 mb-8 flex h-24 w-24 items-center justify-center rounded-lg bg-primary/10 shadow-inner">
              <UtensilsCrossed class="h-12 w-12 text-primary" />
            </div>
            <p class="relative z-10 mb-2 text-xl font-bold text-foreground">
              {{ !foodStore.loaded || availableCount > 0 ? '点击翻牌' : '暂无选项' }}
            </p>
            <p class="relative z-10 text-base text-muted-foreground">
              {{ !foodStore.loaded || availableCount > 0 ? '看看今天吃什么' : '先去后厨添加一些' }}
            </p>
          </template>
        </div>
      </div>

      <button
        type="button"
        class="relative z-10 mt-8 inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
        @click="openTagDialog"
      >
        <Tags class="h-3.5 w-3.5" />
        {{ !foodStore.loaded ? `${selectedTagName}准备中` : availableCount > 0 ? `${selectedTagName}有 ${availableCount}份惊喜哦` : `${selectedTagName}暂无惊喜` }}
      </button>
    </div>

    <DialogRoot v-model:open="showTagDialog">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <DialogContent class="glass fixed left-1/2 top-1/2 z-50 w-[calc(100%-3rem)] max-w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-xl p-7 shadow-2xl">
          <DialogTitle class="text-lg font-bold">选择标签</DialogTitle>
          <DialogDescription class="mt-1 text-sm text-muted-foreground">
            只从对应标签里抽一个今天的惊喜
          </DialogDescription>

          <div class="mt-5 flex flex-col gap-2">
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-secondary/70"
              :class="!selectedTag ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card/35 text-foreground'"
              @click="selectTag(null)"
            >
              <span class="font-semibold">全部</span>
              <span class="inline-flex items-center gap-2 text-xs text-muted-foreground">
                {{ getTagCount(null) }}份
                <Check v-if="!selectedTag" class="h-4 w-4 text-primary" />
              </span>
            </button>

            <button
              v-for="tag in foodStore.allTags"
              :key="tag"
              type="button"
              class="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-secondary/70"
              :class="selectedTag === tag ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card/35 text-foreground'"
              @click="selectTag(tag)"
            >
              <span class="font-semibold">{{ tag }}</span>
              <span class="inline-flex items-center gap-2 text-xs text-muted-foreground">
                {{ getTagCount(tag) }}份
                <Check v-if="selectedTag === tag" class="h-4 w-4 text-primary" />
              </span>
            </button>
          </div>

          <div class="mt-6 flex justify-end">
            <DialogClose as-child>
              <Button variant="outline" class="rounded-full px-5">
                取消
              </Button>
            </DialogClose>
          </div>

          <DialogClose class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
            <X class="h-4 w-4" />
            <span class="sr-only">关闭</span>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <!-- Confetti -->
    <div v-if="showConfetti" class="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <div
        v-for="i in 40"
        :key="i"
        class="confetti-piece absolute"
        :style="{
          left: `${10 + Math.random() * 80}%`,
          top: '-5%',
          '--drift': `${(Math.random() - 0.5) * 200}px`,
          '--fall': `${60 + Math.random() * 40}vh`,
          '--spin': `${Math.random() * 720}deg`,
          '--duration': `${1.5 + Math.random() * 2}s`,
          '--delay': `${Math.random() * 0.6}s`,
          '--size': `${8 + Math.random() * 10}px`,
          '--hue': `${Math.random() * 360}`,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.emoji-prewarm {
  position: absolute;
  pointer-events: none;
  opacity: 0;
  transform: translateX(-9999px);
}

.lottery-card {
  will-change: transform;
}

.confetti-piece {
  width: var(--size);
  height: var(--size);
  background: oklch(0.75 0.18 var(--hue));
  border-radius: 2px;
  animation: confetti-fall var(--duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) var(--delay) forwards;
}

.confetti-piece:nth-child(odd) {
  border-radius: 50%;
}

.confetti-piece:nth-child(3n) {
  width: calc(var(--size) * 0.6);
  height: calc(var(--size) * 1.4);
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg) scale(1);
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateY(var(--fall)) translateX(var(--drift)) rotate(var(--spin)) scale(0.3);
    opacity: 0;
  }
}
</style>
