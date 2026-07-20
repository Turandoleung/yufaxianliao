﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="profile-hero">
    <div class="cover-area" :style="coverStyle">
      <div class="cover-mask"></div>

      <button class="hero-back-btn" title="返回">‹</button>

      <div class="hero-top-actions">
        <button class="hero-publish-btn" @click="emit('open-composer')" title="发布动态">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </button>
        <button class="hero-action-btn" @click="emit('edit-profile')" title="编辑资料">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
        <button class="hero-action-btn" :class="{ active: calendarActive }" @click="emit('toggle-calendar')" title="日历">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>
        <button class="hero-action-btn" @click="emit('open-settings')" title="设置">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
        </button>
      </div>

      <div class="hero-nickname">{{ nickname }}</div>

      <div class="hero-avatar-wrap">
        <img v-if="profile && profile.avatar" :src="displayAvatar" alt="" class="hero-avatar" />
        <div v-else class="hero-avatar-default">{{ nickname.charAt(0) }}</div>
      </div>
    </div>

    <div class="profile-info-area">
      <div class="profile-bio" v-if="profile && profile.bio">{{ profile.bio }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useImageUrl } from '../composables/useImageUrl.js'
import { toRef } from 'vue'

const props = defineProps({ profile: Object, calendarActive: Boolean })
const emit = defineEmits(['edit-profile', 'open-composer', 'open-settings', 'toggle-calendar'])

const avatarRef = computed(() => (props.profile && props.profile.avatar) || '')
const coverRef = computed(() => (props.profile && props.profile.coverImage) || '')

const displayAvatar = useImageUrl(avatarRef)
const displayCover = useImageUrl(coverRef)

const nickname = computed(() => {
  return (props.profile && props.profile.nickname) || '我'
})

const coverStyle = computed(() => {
  if (displayCover.value) {
    return { backgroundImage: 'url(' + displayCover.value + ')' }
  }
  return {}
})
</script>

<style scoped>
.profile-hero { position: relative; }
.cover-area {
  position: relative; width: 100%; height: 420px; overflow: visible;
  background: linear-gradient(135deg, #4a6741 0%, #2d3a2d 50%, #1a231a 100%);
  background-size: cover; background-position: center;
}
.cover-mask {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.32) 100%);
  pointer-events: none;
}
.hero-back-btn {
  position: absolute; top: 18px; left: 20px; z-index: 2;
  background: none; border: none; color: #fff;
  font-size: 34px; line-height: 1; cursor: pointer;
  opacity: 0.85; transition: opacity 0.2s;
  padding: 0; width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
}
.hero-back-btn:hover { opacity: 1; }
.hero-top-actions {
  position: absolute; top: 18px; right: 22px; z-index: 2;
  display: flex; align-items: center; gap: 10px;
}
.hero-publish-btn,
.hero-action-btn {
  background: none; border: none; color: #fff;
  cursor: pointer; opacity: 0.85; transition: opacity 0.2s;
  padding: 6px; display: flex; align-items: center; justify-content: center;
}
.hero-publish-btn:hover,
.hero-action-btn:hover { opacity: 1; }
.hero-action-btn.active { opacity: 1; }
.hero-action-btn.active svg { stroke: #C9A96E; }
.hero-nickname {
  position: absolute; right: 170px; bottom: 32px;
  max-width: calc(100% - 240px);
  color: #fff; font-size: 32px; font-weight: 700; line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0,0,0,0.45);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  z-index: 2;
  font-family: -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif;
}
.hero-avatar-wrap {
  position: absolute; right: 40px; bottom: -48px; z-index: 3;
  background: #fff; border-radius: 10px; padding: 4px;
}
.hero-avatar {
  width: 96px; height: 96px; border-radius: 10px;
  object-fit: cover; display: block;
}
.hero-avatar-default {
  width: 96px; height: 96px; border-radius: 10px;
  background: linear-gradient(135deg, #C9A96E, #a88b50);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 38px; font-weight: 700;
}
.profile-info-area {
  height: 128px; background: #fff;
  padding: 72px 40px 0 24px; box-sizing: border-box;
}
.profile-bio {
  font-size: 20px; color: #777; line-height: 1.4;
  text-align: right; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
@media (max-width: 600px) {
  .cover-area { height: 280px; }
  .hero-back-btn { top: 12px; left: 14px; font-size: 28px; width: 36px; height: 36px; }
  .hero-top-actions { top: 12px; right: 14px; gap: 6px; }
  .hero-publish-btn, .hero-action-btn { padding: 4px; }
  .hero-publish-btn svg, .hero-action-btn svg { width: 20px; height: 20px; }
  .hero-nickname { right: 120px; bottom: 24px; max-width: calc(100% - 150px); font-size: 22px; }
  .hero-avatar-wrap { right: 16px; bottom: -36px; padding: 3px; }
  .hero-avatar { width: 72px; height: 72px; border-radius: 8px; }
  .hero-avatar-default { width: 72px; height: 72px; border-radius: 8px; font-size: 28px; }
  .profile-info-area { height: 96px; padding: 52px 16px 0 12px; }
  .profile-bio { font-size: 15px; }
}
@media (max-width: 375px) {
  .cover-area { height: 240px; }
  .hero-nickname { right: 100px; bottom: 20px; max-width: calc(100% - 130px); font-size: 20px; }
  .hero-avatar-wrap { right: 12px; bottom: -32px; }
  .hero-avatar { width: 64px; height: 64px; }
  .hero-avatar-default { width: 64px; height: 64px; font-size: 24px; }
  .profile-info-area { height: 84px; padding: 46px 12px 0 10px; }
}
</style>