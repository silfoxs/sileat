<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Motion } from 'motion-v'
import { useFoodStore } from '../stores/food'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import EmojiPicker from '../components/EmojiPicker.vue'
import type { FoodFormData } from '../types/food'
import { Plus, Pencil, Trash2, MapPin, ChefHat } from 'lucide-vue-next'

const foodStore = useFoodStore()

const form = reactive<FoodFormData>({
  title: '',
  emoji: '🍜',
  description: '',
  distance: '',
})

const editingId = ref<number | null>(null)
const showDialog = ref(false)

onMounted(() => {
  foodStore.loadAll()
})

function resetForm() {
  form.title = ''
  form.emoji = '🍜'
  form.description = ''
  form.distance = ''
  editingId.value = null
}

function openAddDialog() {
  resetForm()
  showDialog.value = true
}

function editItem(item: { id: number; title: string; emoji: string; description: string; distance: string }) {
  editingId.value = item.id
  form.title = item.title
  form.emoji = item.emoji
  form.description = item.description
  form.distance = item.distance
  showDialog.value = true
}

async function handleSubmit() {
  if (!form.title.trim()) return

  if (editingId.value) {
    await foodStore.update(editingId.value, { ...form })
  } else {
    await foodStore.add({ ...form })
  }

  resetForm()
  showDialog.value = false
}

async function deleteItem(id: number) {
  await foodStore.remove(id)
}
</script>

<template>
  <div class="page-shell flex flex-col">
    <Motion
      :initial="{ opacity: 0, y: -15 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4 }"
      class="page-header"
    >
      <div class="icon-tile">
        <ChefHat class="h-5 w-5" />
      </div>
      <div class="min-w-0">
        <h1 class="text-xl font-extrabold leading-tight text-foreground">后厨</h1>
        <p class="mt-1 text-xs text-muted-foreground">{{ foodStore.items.length }} 道美食，随时加入抽签池</p>
      </div>
    </Motion>

    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="text-sm font-semibold text-foreground">菜单库</p>
        <p class="mt-0.5 text-xs text-muted-foreground">管理你常吃的选择</p>
      </div>
      <Button size="sm" class="rounded-lg shadow-md shadow-primary/15" @click="openAddDialog">
        <Plus class="h-4 w-4" />
        添加
      </Button>
    </div>

    <ScrollArea class="flex-1">
      <div class="flex flex-col gap-5 pb-3">
        <Card
          v-for="item in foodStore.items"
          :key="item.id"
          class="glass group rounded-lg border shadow-sm transition-all hover:shadow-md"
        >
          <CardContent class="flex items-center gap-4 p-5">
            <div class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-3xl">
              {{ item.emoji }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-base font-bold text-foreground">{{ item.title }}</div>
              <p v-if="item.description" class="mt-1 truncate text-sm text-muted-foreground">{{ item.description }}</p>
            </div>
            <div v-if="item.distance" class="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary">
              <MapPin class="h-3.5 w-3.5" />
              {{ item.distance }}
            </div>
            <div class="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button variant="ghost" size="icon-sm" @click="editItem(item)">
                <Pencil class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" class="hover:text-destructive" @click="deleteItem(item.id)">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div
          v-if="foodStore.items.length === 0 && !foodStore.loading"
          class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/45 py-16 text-center"
        >
          <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
            <ChefHat class="h-7 w-7 text-primary/60" />
          </div>
          <p class="mb-2 text-base font-bold text-foreground">后厨空空如也</p>
          <p class="text-sm text-muted-foreground">添加第一道美食，抽签马上开火</p>
        </div>
      </div>
    </ScrollArea>

    <Dialog v-model:open="showDialog">
      <DialogContent class="glass max-w-[360px] rounded-lg border p-5 shadow-2xl sm:max-w-[360px]">
        <DialogHeader class="pb-1">
          <DialogTitle class="text-base">
            {{ editingId ? '编辑美食' : '添加美食' }}
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div class="flex items-center gap-3 rounded-lg bg-background/40 p-2.5">
            <EmojiPicker :model-value="form.emoji" @select="e => form.emoji = e" />
            <div class="min-w-0">
              <div class="text-sm font-bold text-foreground">选择图标</div>
              <div class="mt-0.5 text-xs text-muted-foreground">用于抽奖时展示</div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="space-y-1.5">
              <Label for="dlg-title" class="text-xs text-muted-foreground">名称</Label>
              <Input
                id="dlg-title"
                v-model="form.title"
                placeholder="如：兰州拉面"
                class="rounded-lg bg-background/70"
              />
            </div>
            <div class="space-y-1.5">
              <Label for="dlg-desc" class="text-xs text-muted-foreground">描述</Label>
              <Input
                id="dlg-desc"
                v-model="form.description"
                placeholder="简单描述（可选）"
                class="rounded-lg bg-background/70"
              />
            </div>
            <div class="space-y-1.5">
              <Label for="dlg-dist" class="text-xs text-muted-foreground">距离</Label>
              <Input
                id="dlg-dist"
                v-model="form.distance"
                placeholder="如 500m（可选）"
                class="rounded-lg bg-background/70"
              />
            </div>
          </div>
        </div>

        <DialogFooter class="gap-2 pt-1">
          <Button
            variant="outline"
            class="rounded-lg bg-background/60"
            @click="showDialog = false; resetForm()"
          >
            取消
          </Button>
          <Button
            class="rounded-lg"
            :disabled="!form.title.trim()"
            @click="handleSubmit"
          >
            {{ editingId ? '保存' : '添加' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
