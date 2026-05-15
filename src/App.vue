<script setup lang="ts">
import PillMenu from './components/PillMenu.vue'
import { computed } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useRoute } from 'vue-router'

const route = useRoute()
const showLotteryBackground = computed(() => route.name === 'lottery')

function closeApp() {
  getCurrentWindow().close()
}
</script>

<template>
  <div class="app-root">
    <div class="app-grid" />
    <div class="app-bg">
      <template v-if="showLotteryBackground">
        <div class="app-frame" />
        <div class="app-frame-glow" />
      </template>
      <div v-if="showLotteryBackground" v-for="pos in ['tl','tr','bl','br']" :key="pos" :class="`corner-ornament corner-ornament--${pos}`">
        <svg width="118" height="118" viewBox="0 0 118 118" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 116 L2 2 L116 2" stroke="var(--ornament-gold)" stroke-width="3" stroke-linecap="round"/>
          <path d="M2 100 L2 18 Q2 2 18 2 L100 2" stroke="var(--ornament-gold)" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M2 84 L2 34 Q2 18 18 2 L84 2" stroke="var(--ornament-gold)" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M18 48 Q18 34 32 34" stroke="var(--ornament-gold)" stroke-width="2" stroke-linecap="round"/>
          <circle cx="62" cy="62" r="5" stroke="var(--ornament-gold)" stroke-width="1.2"/>
          <circle cx="82" cy="82" r="3" stroke="var(--ornament-gold)" stroke-width="1"/>
        </svg>
      </div>
    </div>
    <button class="close-btn" @click="closeApp">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5.5" stroke="currentColor" stroke-width="1"/>
        <circle cx="6" cy="6" r="2.5" stroke="currentColor" stroke-width="1"/>
      </svg>
    </button>
    <div class="app-content">
      <router-view v-slot="{ Component }">
        <transition name="slide-up" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      <PillMenu />
    </div>
  </div>
</template>
