<template>
  <div class="comment-list">
    <div v-for="c in comments" :key="c.id" class="comment-item">
      <span class="comment-user">{{ c.userName }}</span>：{{ c.content }}
    </div>
    <div class="comment-input-row">
      <input
        v-model="text"
        class="comment-input"
        placeholder="写评论..."
        @keyup.enter="handleSend"
      />
      <button class="comment-send" :disabled="!text.trim()" @click="handleSend">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ comments: Array })
const emit = defineEmits(['add-comment'])
const text = ref('')

function handleSend() {
  if (!text.value.trim()) return
  emit('add-comment', text.value.trim())
  text.value = ''
}
</script>

<style scoped>
.comment-list {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 8px 10px;
  margin-top: 8px;
}
.comment-item {
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 4px;
}
.comment-user {
  color: #576b95;
  font-weight: 500;
}
.comment-input-row {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}
.comment-input {
  flex: 1;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
  outline: none;
  background-color: #fff;
}
.comment-input:focus {
  border-color: #07c160;
}
.comment-send {
  background-color: #07c160;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
}
.comment-send:disabled {
  background-color: #a0e8b8;
  cursor: not-allowed;
}
</style>
