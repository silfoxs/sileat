<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import { Moon, Sun } from 'lucide-vue-next'

const settings = useSettingsStore()

const isDark = computed({
  get: () => settings.theme === 'dark',
  set: () => settings.toggleTheme(),
})
</script>

<template>
  <Toggle
    v-model="isDark"
    variant="outline"
    size="sm"
    :class="cn(
      'relative h-7 w-14 rounded-full border p-0 shadow-inner transition-all duration-300',
      settings.theme === 'dark' ? 'border-primary/30 bg-primary' : 'border-border bg-secondary',
    )"
  >
    <div
      class="absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-md transition-all duration-300"
      :class="settings.theme === 'dark' ? 'left-7' : 'left-0.5'"
    >
      <Moon v-if="settings.theme === 'dark'" class="h-3.5 w-3.5 text-primary" />
      <Sun v-else class="h-3.5 w-3.5 text-primary" />
    </div>
  </Toggle>
</template>
