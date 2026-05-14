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

  async function spin() {
    const foodStore = useFoodStore()
    if (foodStore.items.length === 0) return

    isSpinning.value = true
    showResult.value = false
    result.value = null

    // Simulate spinning delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    result.value = weightedRandom(foodStore.items)
    isSpinning.value = false
    showResult.value = true
  }

  function reset() {
    result.value = null
    showResult.value = false
  }

  return { result, isSpinning, showResult, spin, reset }
})
