<template>
  <div class="search-bar-wrap">
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input
        class="search-input"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
        @keyup.escape="$emit('clear')"
      />
      <button v-if="modelValue" class="search-clear-btn" @click="$emit('clear')">×</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜索动态、评论、先贤、标签…' }
})
defineEmits(['update:modelValue', 'clear'])
</script>