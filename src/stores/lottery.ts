import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FoodItem } from '../types/food'
import { useLottery } from '../composables/useLottery'
import { useFoodStore } from './food'

export const useLotteryStore = defineStore('lottery', () => {
  const { weightedRandom } = useLottery()
  const result = ref<FoodItem | null>(null)
  const isSpinning = ref(false)
  const showResult = ref(false)

  function spin() {
    const foodStore = useFoodStore()
    const available = foodStore.items.filter(i => !i.skip_today)
    if (available.length === 0) return

    isSpinning.value = true
    showResult.value = false
    result.value = null

    result.value = weightedRandom(available)
    isSpinning.value = false
    showResult.value = true
  }

  function reset() {
    result.value = null
    showResult.value = false
  }

  return { result, isSpinning, showResult, spin, reset }
})
