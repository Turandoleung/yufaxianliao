<template>
  <div v-if="visible && images && images.length" class="image-preview-overlay" @click="handleOverlayClick">
    <img :src="displayImages[currentIndex]" class="image-preview-img" @click.stop />
    <button class="image-preview-close" @click.stop="close">✕</button>
    <button v-if="images.length > 1 && currentIndex > 0" class="image-preview-arrow left" @click.stop="prev">‹</button>
    <button v-if="images.length > 1 && currentIndex < images.length - 1" class="image-preview-arrow right" @click.stop="next">›</button>
    <div v-if="images.length > 1" class="image-preview-counter">{{ currentIndex + 1 }} / {{ images.length }}</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useImageUrls } from '../composables/useImageUrl.js'

const props = defineProps({
  visible: Boolean,
  images: Array,
  initialIndex: Number
})
const emit = defineEmits(['close'])

const currentIndex = ref(0)
const displayImages = useImageUrls(computed(() => props.images || []))

watch(() => props.visible, (val) => {
  if (val) {
    var idx = props.initialIndex
    if (typeof idx !== 'number' || idx < 0 || idx >= (props.images ? props.images.length : 0)) idx = 0
    currentIndex.value = idx
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

function close() { emit('close') }
function prev() { if (currentIndex.value > 0) currentIndex.value-- }
function next() { if (currentIndex.value < props.images.length - 1) currentIndex.value++ }

function handleOverlayClick() { close() }

function onKeydown(e) {
  if (!props.visible) return
  if (e.key === 'Escape') { close(); e.preventDefault() }
  if (e.key === 'ArrowLeft') { prev(); e.preventDefault() }
  if (e.key === 'ArrowRight') { next(); e.preventDefault() }
}

onMounted(() => { document.addEventListener('keydown', onKeydown) })
onUnmounted(() => { document.removeEventListener('keydown', onKeydown); document.body.style.overflow = '' })
</script>

<style scoped>
.image-preview-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0, 0, 0, 0.88);
  display: flex; align-items: center; justify-content: center;
}
.image-preview-img {
  max-width: 92vw; max-height: 82vh;
  object-fit: contain; user-select: none;
}
.image-preview-close {
  position: absolute; top: 22px; right: 24px;
  color: #fff; background: rgba(255,255,255,0.12);
  border: none; border-radius: 50%;
  width: 40px; height: 40px; font-size: 20px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.image-preview-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 44px; height: 64px; border: none; border-radius: 12px;
  background: rgba(255,255,255,0.12); color: #fff;
  font-size: 42px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  line-height: 1;
}
.image-preview-arrow.left { left: 24px; }
.image-preview-arrow.right { right: 24px; }
.image-preview-counter {
  position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
  color: rgba(255,255,255,0.86); font-size: 14px;
}
@media (max-width: 600px) {
  .image-preview-img { max-width: 96vw; max-height: 78vh; }
  .image-preview-close { top: 16px; right: 16px; width: 36px; height: 36px; font-size: 18px; }
  .image-preview-arrow { width: 36px; height: 54px; font-size: 34px; }
  .image-preview-arrow.left { left: 10px; }
  .image-preview-arrow.right { right: 10px; }
}
</style>