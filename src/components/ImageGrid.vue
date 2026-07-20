﻿﻿﻿<template>
  <div class="image-grid" :class="gridClass">
    <div v-for="(img, index) in displayImages" :key="index" class="image-item" @click="$emit('open-preview', { images, index })">
      <img :src="img" alt="" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useImageUrls } from '../composables/useImageUrl.js'

const props = defineProps({ images: Array })
defineEmits(['open-preview'])

const displayImages = useImageUrls(computed(() => props.images || []))

const gridClass = computed(() => {
  const len = props.images.length
  if (len === 1) return 'grid-1'
  if (len === 2) return 'grid-2'
  if (len === 4) return 'grid-4'
  return 'grid-3'
})
</script>

<style scoped>
.image-grid { display: grid; gap: 6px; margin-top: 8px; overflow: hidden; border-radius: 6px; }
.grid-1 { grid-template-columns: 1fr; max-width: 260px; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: 1fr 1fr 1fr; }
.grid-4 { grid-template-columns: 1fr 1fr; }
.image-item { aspect-ratio: 1; overflow: hidden; background-color: #f0f0f0; cursor: pointer; border-radius: 6px; }
.grid-1 .image-item { aspect-ratio: auto; max-height: 280px; }
.image-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: opacity 0.15s; }
.image-item:hover img { opacity: 0.92; }
.image-item:active img { opacity: 0.85; }
</style>