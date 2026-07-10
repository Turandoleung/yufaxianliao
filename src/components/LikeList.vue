﻿<template>
  <div v-if="displayLikedBy.length" class="like-list">
    <span class="like-icon">&#9825;</span>
    <template v-for="(u, i) in displayLikedBy" :key="u.id">
      <span
        :class="['like-name', { 'ai-like': u.type === 'ai', 'philosopher-link': u.type === 'ai' }]"
        @click="handleClick(u)"
      >{{ u.name }}</span><span v-if="i < displayLikedBy.length - 1">、</span>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ likedBy: Array, profile: Object })
const emit = defineEmits(['open-philosopher'])

const displayLikedBy = computed(() => {
  if (!props.likedBy || !props.likedBy.length) return []
  return props.likedBy.map(function(u) {
    if (u.id === 'user') {
      var nick = (props.profile && props.profile.nickname) || '我'
      return { ...u, name: nick }
    }
    return u
  })
})

function handleClick(u) {
  if (u.type === 'ai') {
    emit('open-philosopher', u.id || u.name)
  }
}
</script>

<style scoped>
.like-list {
  padding: 8px 10px;
  font-size: 14px;
  line-height: 1.5;
  color: #222;
}
.like-icon {
  color: #07C160;
  margin-right: 4px;
}
.like-name {
  color: #576b95;
  font-weight: 500;
}
.ai-like {
  color: #C9A96E;
}
.philosopher-link {
  cursor: pointer;
  transition: opacity 0.2s;
}
.philosopher-link:hover {
  text-decoration: underline;
  opacity: 0.8;
}
</style>