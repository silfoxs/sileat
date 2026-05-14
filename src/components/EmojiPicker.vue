<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  select: [emoji: string]
}>()

defineProps<{
  modelValue: string
}>()

const isOpen = ref(false)

const emojiGroups = [
  { label: '中餐', emojis: ['🍜', '🍚', '🥟', '🥡', '🍲', '🫕', '🍛', '🍝', '🥘', '🥩', '🍗', '🍖'] },
  { label: '西餐', emojis: ['🍕', '🍔', '🌭', '🥪', '🌮', '🌯', '🥗', '🍝', '🥩', '🧀', '🥓', '🍳'] },
  { label: '日韩', emojis: ['🍣', '🍱', '🍙', '🍘', '🍥', '🥮', '🍡', '🍢', '🥟', '🍛', '🍝', '🫕'] },
  { label: '甜品', emojis: ['🍰', '🧁', '🍩', '🍪', '🎂', '🍮', '🍦', '🍧', '🍫', '🍬', '🍭', '🧇'] },
  { label: '饮品', emojis: ['☕', '🍵', '🧋', '🥤', '🧃', '🥛', '🍺', '🍷', '🍸', '🍹', '🧉', '🫖'] },
  { label: '水果', emojis: ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🍑', '🥝', '🍌', '🍉', '🥭', '🍍'] },
]

function select(emoji: string) {
  emit('select', emoji)
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="glass flex h-14 w-14 items-center justify-center rounded-lg text-2xl transition-transform hover:scale-105"
      @click="isOpen = !isOpen"
    >
      {{ modelValue }}
    </button>

    <transition name="slide-up">
      <div v-if="isOpen" class="fixed inset-0 z-[70]" @click.self="isOpen = false">
        <div
          class="glass fixed left-1/2 top-1/2 max-h-[min(420px,calc(100vh-96px))] w-[min(320px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg p-3"
        >
          <div v-for="group in emojiGroups" :key="group.label" class="mb-3.5 last:mb-0">
            <div class="mb-2 text-xs font-semibold text-muted-foreground">{{ group.label }}</div>
            <div class="grid grid-cols-6 gap-1.5">
              <button
                v-for="emoji in group.emojis"
                :key="emoji"
                type="button"
                class="flex aspect-square w-full items-center justify-center rounded-lg text-lg transition-colors hover:bg-secondary"
                :class="modelValue === emoji ? 'bg-primary/15 ring-1 ring-primary/30' : ''"
                @click="select(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
