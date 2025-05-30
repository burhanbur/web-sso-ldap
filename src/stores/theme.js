import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: localStorage.getItem('theme') === 'dark'
  }),
  
  actions: {
    toggleTheme() {
      this.isDark = !this.isDark;
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', this.isDark);
    },
    
    initTheme() {
      // Check if user has a saved theme preference
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.isDark = savedTheme === 'dark';
      } else {
        // Check system preference
        this.isDark = window.matchMedia('(prefers-color-scheme: light)').matches;
        // this.isDark = false;
        // localStorage.setItem('theme', 'light');
      }
      document.documentElement.classList.toggle('dark', this.isDark);
    }
  }
});
