import { ref, watch } from 'vue'
import { resolveImageSrc } from '../services/imageService.js'

export function useImageUrl(sourceRef) {
  const resolved = ref('')

  watch(sourceRef, async (newVal) => {
    resolved.value = await resolveImageSrc(newVal)
  }, { immediate: true })

  return resolved
}

export function useImageUrls(sourceRef) {
  const resolved = ref([])

  watch(sourceRef, async (newVal) => {
    if (!Array.isArray(newVal)) {
      resolved.value = []
      return
    }
    const urls = await Promise.all(newVal.map(function(item) {
      return resolveImageSrc(item)
    }))
    resolved.value = urls
  }, { immediate: true, deep: true })

  return resolved
}