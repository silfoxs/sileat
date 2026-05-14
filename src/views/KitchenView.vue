<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Motion } from 'motion-v'
import { useFoodStore } from '../stores/food'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from 'reka-ui'
import EmojiPicker from '../components/EmojiPicker.vue'
import type { FoodFormData } from '../types/food'
import { Plus, Pencil, Trash2, MapPin, ChefHat, X, Ban, Check } from 'lucide-vue-next'

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
      <div class="flex flex-col gap-3 pb-3">
        <Card
          v-for="item in foodStore.items"
          :key="item.id"
          class="glass group relative overflow-hidden rounded-lg border transition-all hover:shadow-md"
        >
          <div
            class="absolute left-0 top-0 h-full w-[3px]"
            :class="item.skip_today ? 'bg-red-400/70' : 'bg-green-400/70'"
          />
          <CardContent class="flex items-center gap-4 p-5">
            <div class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-3xl">
              {{ item.emoji }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-base font-bold text-foreground">{{ item.title }}</div>
              <p v-if="item.description" class="mt-1 line-clamp-2 text-sm text-muted-foreground">{{ item.description }}</p>
            </div>
            <div v-if="item.distance" class="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary">
              <MapPin class="h-3.5 w-3.5" />
              {{ item.distance }}
            </div>
            <div class="flex flex-shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                :class="item.skip_today ? 'text-red-400' : 'text-muted-foreground'"
                @click="foodStore.toggleSkipToday(item.id)"
              >
                <Ban v-if="!item.skip_today" class="h-4 w-4" />
                <Check v-else class="h-4 w-4" />
              </Button>
              <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon-sm" @click="editItem(item)">
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" class="hover:text-destructive" @click="deleteItem(item.id)">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
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

    <DialogRoot v-model:open="showDialog">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <DialogContent class="glass fixed left-1/2 top-1/2 z-50 w-[calc(100%-3rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-xl p-7 shadow-2xl">
          <DialogTitle class="text-lg font-bold">
            {{ editingId ? '编辑美食' : '添加美食' }}
          </DialogTitle>
          <DialogDescription class="mt-1 text-sm text-muted-foreground">
            {{ editingId ? '修改这道美食的信息' : '填写信息，加入你的抽签池' }}
          </DialogDescription>

          <div class="mt-5 flex items-center gap-4 rounded-lg bg-muted/50 p-4">
            <EmojiPicker :model-value="form.emoji" @select="e => form.emoji = e" />
            <div class="min-w-0">
              <div class="text-sm font-semibold text-foreground">选择图标</div>
              <div class="mt-0.5 text-xs text-muted-foreground">用于抽奖时展示</div>
            </div>
          </div>

          <div class="mt-5 space-y-4">
            <div class="space-y-2">
              <Label for="dlg-title">名称</Label>
              <Input id="dlg-title" v-model="form.title" placeholder="如：兰州拉面" />
            </div>
            <div class="space-y-2">
              <Label for="dlg-desc">描述</Label>
              <Input id="dlg-desc" v-model="form.description" placeholder="简单描述（可选）" />
            </div>
            <div class="space-y-2">
              <Label for="dlg-dist">距离</Label>
              <Input id="dlg-dist" v-model="form.distance" placeholder="如 500m（可选）" />
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <DialogClose as-child>
              <Button variant="outline" class="rounded-full px-5" @click="resetForm()">
                取消
              </Button>
            </DialogClose>
            <Button class="rounded-full px-5" :disabled="!form.title.trim()" @click="handleSubmit">
              {{ editingId ? '保存' : '添加' }}
            </Button>
          </div>

          <DialogClose class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
            <X class="h-4 w-4" />
            <span class="sr-only">关闭</span>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>
