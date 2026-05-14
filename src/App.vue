<script setup lang="ts">
import PillMenu from './components/PillMenu.vue'
import { useFoodStore } from './stores/food'
import { onMounted } from 'vue'

const foodStore = useFoodStore()

onMounted(() => {
  foodStore.loadAll()
})
</script>

<template>
  <div class="relative h-full overflow-hidden">
    <div class="app-frame" />
    <div class="app-frame-glow" />
    <div class="app-frame-corners" />
    <router-view v-slot="{ Component }">
      <transition name="slide-up" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <PillMenu />
  </div>
</template>
