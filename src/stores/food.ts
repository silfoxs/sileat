import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { FoodItem, FoodFormData } from '../types/food'
import { useDatabase } from '../composables/useDatabase'

type FoodItemRow = Omit<FoodItem, 'tags'> & {
  tags?: string | string[] | null
}

export const useFoodStore = defineStore('food', () => {
  const items = ref<FoodItem[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  let loadPromise: Promise<void> | null = null

  const allTags = computed(() => {
    const seen = new Set<string>()

    for (const item of items.value) {
      for (const tag of item.tags) {
        if (tag) seen.add(tag)
      }
    }

    return Array.from(seen).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
  })

  function normalizeTags(tags: string[] = []) {
    const seen = new Set<string>()

    return tags
      .map(tag => tag.trim())
      .filter((tag) => {
        if (!tag || seen.has(tag)) return false
        seen.add(tag)
        return true
      })
  }

  function parseTags(value: FoodItemRow['tags']) {
    if (Array.isArray(value)) return normalizeTags(value)
    if (!value) return []

    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? normalizeTags(parsed.filter(tag => typeof tag === 'string')) : []
    } catch {
      return []
    }
  }

  async function loadAll() {
    if (loadPromise) return loadPromise

    loading.value = true
    loadPromise = (async () => {
      const db = await useDatabase()
      const result = await db.select<FoodItemRow[]>('SELECT * FROM food_items ORDER BY created_at DESC')
      items.value = result.map(item => ({
        ...item,
        tags: parseTags(item.tags),
      }))
      loaded.value = true
    })()

    try {
      await loadPromise
    } finally {
      loading.value = false
      loadPromise = null
    }
  }

  async function add(data: FoodFormData) {
    const db = await useDatabase()
    const result = await db.execute(
      'INSERT INTO food_items (title, emoji, description, distance, tags) VALUES ($1, $2, $3, $4, $5)',
      [data.title, data.emoji, data.description, data.distance, JSON.stringify(normalizeTags(data.tags))]
    )
    await loadAll()
    return result
  }

  async function update(id: number, data: FoodFormData) {
    const db = await useDatabase()
    await db.execute(
      'UPDATE food_items SET title = $1, emoji = $2, description = $3, distance = $4, tags = $5 WHERE id = $6',
      [data.title, data.emoji, data.description, data.distance, JSON.stringify(normalizeTags(data.tags)), id]
    )
    await loadAll()
  }

  async function remove(id: number) {
    const db = await useDatabase()
    await db.execute('DELETE FROM food_items WHERE id = $1', [id])
    await loadAll()
  }

  async function toggleSkipToday(id: number) {
    const item = items.value.find(i => i.id === id)
    if (!item) return
    const db = await useDatabase()
    await db.execute('UPDATE food_items SET skip_today = $1 WHERE id = $2', [item.skip_today ? 0 : 1, id])
    await loadAll()
  }

  return { items, loading, loaded, allTags, loadAll, add, update, remove, toggleSkipToday }
})
