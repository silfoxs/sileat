<script setup lang="ts">
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'vue'

defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <Card
    :class="cn(
      'glass border-0 shadow-lg',
      $props.class,
    )"
  >
    <slot />
  </Card>
</template>
