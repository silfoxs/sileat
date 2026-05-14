<script setup lang="ts">
import { Motion } from 'motion-v'
import { useSettingsStore } from '../stores/settings'
import { Card, CardContent } from '@/components/ui/card'
import ThemeToggle from '../components/ThemeToggle.vue'
import { Settings, Moon, Sun, Info, Database } from 'lucide-vue-next'
import { computed } from 'vue'

const settings = useSettingsStore()

const themeIcon = computed(() => settings.theme === 'dark' ? Moon : Sun)
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
        <Settings class="h-5 w-5" />
      </div>
      <div>
        <h1 class="text-xl font-extrabold leading-tight text-foreground">设置</h1>
        <p class="mt-1 text-xs text-muted-foreground">偏好、本地数据和应用信息</p>
      </div>
    </Motion>

    <div class="flex-1 overflow-y-auto scrollbar-hidden">
      <div class="space-y-4 pb-3">

        <Motion
          :initial="{ opacity: 0, y: 15 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4, delay: 0.1 }"
        >
          <div class="section-label mb-2">外观</div>
          <Card class="glass rounded-lg border py-0 shadow-sm">
            <CardContent class="flex items-center justify-between p-3.5">
              <div class="flex items-center gap-2.5">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <component :is="themeIcon" class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div class="text-sm font-bold text-foreground">深色模式</div>
                  <div class="mt-0.5 text-xs text-muted-foreground">
                    {{ settings.theme === 'dark' ? '已开启' : '已关闭' }}
                  </div>
                </div>
              </div>
              <ThemeToggle />
            </CardContent>
          </Card>
        </Motion>

        <Motion
          :initial="{ opacity: 0, y: 15 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4, delay: 0.2 }"
        >
          <div class="section-label mb-2">关于</div>
          <Card class="glass rounded-lg border py-0 shadow-sm">
            <CardContent class="flex flex-col items-center py-6 text-center">
              <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Info class="h-6 w-6 text-primary" />
              </div>
              <div class="text-base font-extrabold text-foreground">{{ settings.appName }}</div>
              <div class="mt-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">v{{ settings.appVersion }}</div>
              <div class="mt-2 text-xs text-muted-foreground">每天都要好好吃饭</div>
            </CardContent>
          </Card>
        </Motion>

        <Motion
          :initial="{ opacity: 0, y: 15 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4, delay: 0.3 }"
        >
          <div class="section-label mb-2">数据</div>
          <Card class="glass rounded-lg border py-0 shadow-sm">
            <CardContent class="flex items-center gap-2.5 p-3.5">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Database class="h-5 w-5 text-primary" />
              </div>
              <div>
                <div class="text-sm font-bold text-foreground">本地存储</div>
                <div class="mt-0.5 text-xs text-muted-foreground">数据保存在本地 SQLite</div>
              </div>
            </CardContent>
          </Card>
        </Motion>

      </div>
    </div>
  </div>
</template>
