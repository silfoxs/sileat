import { ref, watchEffect } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

export function useTheme() {
  function setTheme(t: Theme) {
    theme.value = t
    document.documentElement.classList.toggle('dark', t === 'dark')
    localStorage.setItem('theme', t)
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  // Initialize from localStorage
  const saved = localStorage.getItem('theme') as Theme | null
  if (saved) {
    setTheme(saved)
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark')
  }

  watchEffect(() => {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  })

  return { theme, setTheme, toggleTheme }
}
