<script setup lang="ts">
import Chat from './components/Chat/Chat.vue'
import { ref } from 'vue'

const isMinimized = ref(false)
</script>

<template>
  <div style="padding: 8px 20px; padding-top: 30px" :class="{ minimized: isMinimized }">
    <Chat v-show="!isMinimized" />
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.wrapper {
  width: 100%;
  height: 100%;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

/* 可拖动窗口样式 */
.draggable-window {
  position: fixed;
  width: 800px;
  height: 900px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  cursor: move;
  user-select: none;
}

.window-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.close-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #ff5f57;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #ff3b30;
}

.window-content {
  padding: 16px;
  height: calc(100% - 48px);
  overflow: auto;
}

/* 首页内容样式 */
.homepage-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.homepage-nav {
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: center;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 120px;
}

.nav-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.nav-label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.header {
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.minimize-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  transition: background-color 0.2s;
}

.minimize-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.minimize-icon {
  color: #fff;
  font-size: 14px;
  line-height: 1;
  transform: translateY(-2px);
}

.minimized .minimize-icon {
  transform: translateY(2px);
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
