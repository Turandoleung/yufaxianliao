<template>
  <div class="music-card" @click="handleClick">
    <div class="music-cover-wrap">
      <img v-if="music && music.cover" :src="displayCover" alt="" class="music-cover" />
      <div v-else class="music-cover-placeholder">&#9835;</div>
    </div>
    <div class="music-info">
      <div class="music-title">{{ music.title }}</div>
      <div class="music-artist" v-if="music.artist">{{ music.artist }}</div>
      <div class="music-meta">音乐</div>
    </div>
    <div class="music-play-icon">&#9654;</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useImageUrl } from '../composables/useImageUrl.js'

const props = defineProps({ music: Object })

const coverRef = computed(() => (props.music && props.music.cover) || '')
const displayCover = useImageUrl(coverRef)

function handleClick() {
  if (props.music && props.music.url) {
    window.open(props.music.url, '_blank')
  }
}
</script>

<style scoped>
.music-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f3f3f3;
  border-radius: 10px;
  padding: 10px;
  margin-top: 10px;
  cursor: pointer;
  transition: background 0.2s;
}
.music-card:hover { background: #ececec; }
.music-cover-wrap { flex-shrink: 0; }
.music-cover {
  width: 56px; height: 56px; border-radius: 8px;
  object-fit: cover; display: block;
}
.music-cover-placeholder {
  width: 56px; height: 56px; border-radius: 8px;
  background: linear-gradient(135deg, #C9A96E, #a88b50);
  color: #fff; display: flex; align-items: center;
  justify-content: center; font-size: 24px;
}
.music-info { flex: 1; min-width: 0; }
.music-title {
  font-size: 15px; font-weight: 600; color: #222;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.music-artist {
  margin-top: 4px; font-size: 13px; color: #777;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.music-meta { margin-top: 4px; font-size: 12px; color: #999; }
.music-play-icon {
  width: 28px; height: 28px; border-radius: 50%;
  background: #07C160; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; flex-shrink: 0;
}
</style>