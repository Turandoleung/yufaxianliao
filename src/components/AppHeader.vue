﻿<template>
  <header class="app-header">
    <div class="header-inner">
      <h1 class="header-title">与法贤聊</h1>
      <div class="header-actions">
        <button class="header-btn" @click="emit('edit-profile')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>编辑资料</span>
        </button>
        <button class="header-btn header-btn-primary" @click="emit('open-composer')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>发布</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
const emit = defineEmits(['edit-profile', 'open-composer'])
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
  border-bottom: 1px solid #EAEAEA;
  height: 56px;
  display: flex;
  align-items: center;
}

.header-inner {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid #EAEAEA;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.header-btn:hover {
  border-color: #ccc;
  color: #555;
}

.header-btn-primary {
  background-color: #07C160;
  border-color: #07C160;
  color: #fff;
}

.header-btn-primary:hover {
  background-color: #06ad56;
  border-color: #06ad56;
  color: #fff;
}

@media (max-width: 480px) {
  .header-btn span {
    display: none;
  }
  .header-btn {
    padding: 6px 8px;
  }
}
</style>