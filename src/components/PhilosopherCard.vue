﻿﻿﻿﻿<template>
  <div v-if="visible && philosopher" class="philo-overlay" @click="handleClose">
    <div class="philo-card" @click.stop>
      <div class="philo-header">
        <div class="philo-avatar">{{ (philosopher.name || '?').charAt(0) }}</div>
        <div class="philo-header-info">
          <div class="philo-name">{{ philosopher.name }}</div>
          <div class="philo-title">{{ philosopher.title || '' }}<span v-if="philosopher.era"> · {{ philosopher.era }}</span></div>
        </div>
        <button class="philo-close" @click="handleClose">x</button>
      </div>

      <div v-if="philosopher.tags && philosopher.tags.length" class="philo-tags">
        <span v-for="tag in philosopher.tags" :key="tag" class="philo-tag">{{ tag }}</span>
      </div>

      <div class="philo-body">
        <div v-if="philosopher.summary" class="philo-section">
          <div class="philo-section-title">简介</div>
          <div class="philo-section-text">{{ philosopher.summary }}</div>
        </div>

        <div v-if="philosopher.coreIdea" class="philo-section">
          <div class="philo-section-title">代表思想</div>
          <div class="philo-section-text">{{ philosopher.coreIdea }}</div>
        </div>

        <div v-if="philosopher.quotes && philosopher.quotes.length" class="philo-section">
          <div class="philo-section-title">经典法谚</div>
          <div v-for="(q, i) in displayQuotes" :key="i" class="philo-quote">
            <span class="philo-quote-mark">"</span>{{ q }}<span class="philo-quote-mark">"</span>
          </div>
        </div>

        <div v-if="philosopher.style" class="philo-section">
          <div class="philo-section-title">在与法贤聊中的语气</div>
          <div class="philo-section-text philo-style-text">{{ philosopher.style }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ philosopher: Object, visible: Boolean })
const emit = defineEmits(['close'])

const displayQuotes = computed(() => {
  if (!props.philosopher || !props.philosopher.quotes) return []
  return props.philosopher.quotes.slice(0, 3)
})

function handleClose() { emit('close') }
</script>

<style scoped>
.philo-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.45); z-index: 400;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.philo-card {
  width: 100%; max-width: 420px;
  background-color: #fff; border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  overflow-y: auto; max-height: 85vh;
  animation: philoIn 0.2s ease;
}
@keyframes philoIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.philo-header {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 20px 16px;
  background: linear-gradient(135deg, #FBF6EC, #f5edd8);
  border-radius: 16px 16px 0 0;
}
.philo-avatar {
  width: 52px; height: 52px; border-radius: 12px;
  background: linear-gradient(135deg, #C9A96E, #a88b50);
  color: #fff; font-size: 22px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.philo-header-info { flex: 1; min-width: 0; }
.philo-name { font-size: 18px; font-weight: 700; color: #222; line-height: 1.2; }
.philo-title { font-size: 13px; color: #8B7355; margin-top: 3px; line-height: 1.3; }
.philo-close {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(0,0,0,0.08); color: #888;
  border: none; font-size: 15px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.2s;
}
.philo-close:hover { background: rgba(0,0,0,0.15); color: #333; }

.philo-tags {
  display: flex; flex-wrap: wrap; gap: 6px;
  padding: 14px 20px 0;
}
.philo-tag {
  display: inline-block; font-size: 12px; color: #8B6914;
  background: #FFF8E7; border: 1px solid #E8D5A3;
  border-radius: 6px; padding: 3px 10px; font-weight: 500;
}

.philo-body { padding: 14px 20px 20px; }
.philo-section { margin-bottom: 16px; }
.philo-section:last-child { margin-bottom: 0; }
.philo-section-title {
  font-size: 13px; font-weight: 600; color: #C9A96E;
  margin-bottom: 6px;
}
.philo-section-text {
  font-size: 14px; color: #444; line-height: 1.65;
}
.philo-style-text { color: #666; font-style: italic; }

.philo-quote {
  position: relative; padding-left: 14px; margin-bottom: 8px;
  font-size: 14px; color: #333; line-height: 1.6;
  border-left: 3px solid #C9A96E;
}
.philo-quote:last-child { margin-bottom: 0; }
.philo-quote-mark { color: #C9A96E; font-weight: 600; }

@media (max-width: 600px) {
  .philo-overlay { padding: 10px; align-items: flex-end; }
  .philo-card { border-radius: 14px 14px 0 0; max-height: 90vh; }
  .philo-header { padding: 16px 16px 12px; }
  .philo-body { padding: 12px 16px 16px; }
  .philo-tags { padding: 10px 16px 0; }
  .philo-name { font-size: 16px; }
  .philo-section-text { font-size: 13px; }
  .philo-quote { font-size: 13px; }
}

@media (max-width: 600px) {
  .philo-overlay { padding: 10px; align-items: flex-end; }
  .philo-card { border-radius: 14px 14px 0 0; max-height: 90vh; }
  .philo-header { padding: 16px 16px 12px; }
  .philo-body { padding: 12px 16px 16px; }
  .philo-tags { padding: 10px 16px 0; }
  .philo-name { font-size: 16px; }
  .philo-section-text { font-size: 13px; }
  .philo-quote { font-size: 13px; }
}
</style>