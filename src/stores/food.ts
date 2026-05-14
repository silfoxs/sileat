import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FoodItem, FoodFormData } from '../types/food'
import { useDatabase } from '../composables/useDatabase'

export const useFoodStore = defineStore('food', () => {
  const items = ref<FoodItem[]>([])
  const loading = ref(false)

  async function loadAll() {
    loading.value = true
    try {
      const db = await useDatabase()
      const result = await db.select<FoodItem[]>('SELECT * FROM food_items ORDER BY created_at DESC')
      items.value = result
    } finally {
      loading.value = false
    }
  }

  async function add(data: FoodFormData) {
    const db = await useDatabase()
    const result = await db.execute(
      'INSERT INTO food_items (title, emoji, description, distance) VALUES ($1, $2, $3, $4)',
      [data.title, data.emoji, data.description, data.distance]
    )
    await loadAll()
    return result
  }

  async function update(id: number, data: FoodFormData) {
    const db = await useDatabase()
    await db.execute(
      'UPDATE food_items SET title = $1, emoji = $2, description = $3, distance = $4 WHERE id = $5',
      [data.title, data.emoji, data.description, data.distance, id]
    )
    await loadAll()
  }

  async function remove(id: number) {
    const db = await useDatabase()
    await db.execute('DELETE FROM food_items WHERE id = $1', [id])
    await loadAll()
  }

  return { items, loading, loadAll, add, update, remove }
})
