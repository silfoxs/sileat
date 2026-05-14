import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

type Theme = 'light' | 'dark'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>(
    (localStorage.getItem('theme') as Theme) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  )

  function setTheme(t: Theme) {
    theme.value = t
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  watchEffect(() => {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
    localStorage.setItem('theme', theme.value)
  })

  const appVersion = '0.1.0'
  const appName = '今天吃什么'

  return { theme, setTheme, toggleTheme, appVersion, appName }
})
