<script setup lang="ts">
import { useSettingsStore } from '../stores/settings'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'

const settings = useSettingsStore()
</script>

<template>
  <Toggle
    :pressed="settings.theme === 'dark'"
    variant="outline"
    size="sm"
    :class="cn(
      'relative h-7 w-14 rounded-full border p-0 shadow-inner transition-all duration-300',
      settings.theme === 'dark' ? 'border-primary/30 bg-primary' : 'border-border bg-secondary',
    )"
    @update:pressed="settings.toggleTheme()"
  >
    <div
      class="absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-md transition-all duration-300"
      :class="settings.theme === 'dark' ? 'left-7' : 'left-0.5'"
    >
      {{ settings.theme === 'dark' ? '🌙' : '☀️' }}
    </div>
  </Toggle>
</template>
