﻿﻿<template>
  <div class="editor-overlay" @click.self="handleCancel">
    <div class="editor-modal">
      <div class="editor-header">
        <button class="btn-cancel" @click="handleCancel">取消</button>
        <span class="editor-title">编辑个人资料</span>
        <button class="btn-save" @click="handleSave">保存</button>
      </div>

      <div class="editor-body">
        <div class="editor-section">
          <label class="section-label">头像</label>
          <div class="avatar-preview-row">
            <div class="avatar-preview">
              <img v-if="editData.avatar" :src="editData.avatar" alt="" class="preview-img" />
              <div v-else class="preview-default">{{ displayNickname.charAt(0) }}</div>
            </div>
            <label class="upload-btn">
              <input type="file" accept="image/*" hidden @change="handleAvatarSelect" />
              选择头像
            </label>
          </div>
        </div>

        <div class="editor-section">
          <label class="section-label">昵称</label>
          <input class="editor-input" v-model="editData.nickname" placeholder="输入昵称" maxlength="20" />
        </div>

        <div class="editor-section">
          <label class="section-label">个性签名</label>
          <textarea class="editor-textarea" v-model="editData.bio" placeholder="写一句签名..." maxlength="100" rows="2"></textarea>
        </div>

        <div class="editor-section">
          <label class="section-label">朋友圈背景</label>
          <div class="cover-preview-row">
            <div class="cover-preview" :style="coverPreviewStyle">
              <span v-if="!editData.coverImage" class="cover-placeholder">默认背景</span>
            </div>
            <label class="upload-btn">
              <input type="file" accept="image/*" hidden @change="handleCoverSelect" />
              选择背景图
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { getProfile, updateProfile } from '../services/profileService.js'
import { readFileAsBase64 } from '../services/imageService.js'

const emit = defineEmits(['close', 'saved'])

const profile = getProfile()
const editData = reactive({
  nickname: profile.nickname || '我',
  avatar: profile.avatar || '',
  coverImage: profile.coverImage || '',
  bio: profile.bio || ''
})

const displayNickname = computed(() => {
  return editData.nickname.trim() || '我'
})

const coverPreviewStyle = computed(() => {
  if (editData.coverImage) {
    return { backgroundImage: 'url(' + editData.coverImage + ')' }
  }
  return {}
})

async function handleAvatarSelect(e) {
  const file = e.target.files[0]
  if (!file) return
  const base64 = await readFileAsBase64(file)
  editData.avatar = base64
  e.target.value = ''
}

async function handleCoverSelect(e) {
  const file = e.target.files[0]
  if (!file) return
  const base64 = await readFileAsBase64(file)
  editData.coverImage = base64
  e.target.value = ''
}

function handleSave() {
  updateProfile({
    nickname: editData.nickname.trim() || '我',
    avatar: editData.avatar,
    coverImage: editData.coverImage,
    bio: editData.bio.trim()
  })
  emit('saved')
  emit('close')
}

function handleCancel() {
  emit('close')
}
</script>

<style scoped>
.editor-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); z-index: 300;
  display: flex; align-items: center; justify-content: center; padding: 12px;
}
.editor-modal {
  width: 100%; max-width: 440px; background-color: #fff;
  border-radius: 16px; overflow: hidden; animation: fadeIn 0.2s ease;
  max-height: 90vh; display: flex; flex-direction: column;
}
.editor-body { overflow-y: auto; }
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
.editor-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid #EAEAEA;
}
.editor-title { font-size: 16px; font-weight: 600; color: #222; }
.btn-cancel { background: none; border: none; font-size: 15px; color: #888; cursor: pointer; }
.btn-save {
  background-color: #07C160; color: #fff; border: none;
  border-radius: 8px; padding: 6px 18px; font-size: 14px;
  font-weight: 500; cursor: pointer;
}
.btn-save:hover { background-color: #06ad56; }
.editor-body { padding: 16px 20px 20px; }
.editor-section { margin-bottom: 18px; }
.editor-section:last-child { margin-bottom: 0; }
.section-label { display: block; font-size: 13px; color: #888; margin-bottom: 8px; }
.editor-input {
  width: 100%; border: 1px solid #EAEAEA; border-radius: 8px;
  padding: 10px 14px; font-size: 15px; color: #222; outline: none;
  transition: border-color 0.2s;
}
.editor-input:focus { border-color: #07C160; }
.editor-textarea {
  width: 100%; border: 1px solid #EAEAEA; border-radius: 8px;
  padding: 10px 14px; font-size: 15px; color: #222; outline: none;
  resize: none; line-height: 1.5; transition: border-color 0.2s;
}
.editor-textarea:focus { border-color: #07C160; }
.avatar-preview-row { display: flex; align-items: center; gap: 14px; }
.avatar-preview { width: 56px; height: 56px; flex-shrink: 0; }
.preview-img { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; display: block; }
.preview-default {
  width: 56px; height: 56px; border-radius: 10px;
  background-color: #07C160; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 600;
}
.upload-btn {
  display: inline-block; padding: 7px 16px;
  border: 1px solid #EAEAEA; border-radius: 8px;
  font-size: 13px; color: #555; cursor: pointer; transition: all 0.2s;
}
.upload-btn:hover { border-color: #07C160; color: #07C160; }
.cover-preview-row { display: flex; align-items: center; gap: 14px; }
.cover-preview {
  width: 120px; height: 72px; border-radius: 8px;
  background: linear-gradient(135deg, #4a6741, #2d3a2d);
  background-size: cover; background-position: center;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
}
.cover-placeholder { font-size: 12px; color: rgba(255,255,255,0.6); }

@media (max-width: 600px) {
  .editor-modal { border-radius: 14px 14px 0 0; margin-top: auto; max-height: 92vh; }
  .editor-body { padding: 14px 16px 16px; }
  .editor-header { padding: 14px 16px; }
  .editor-section { margin-bottom: 14px; }
}

@media (max-width: 600px) {
  .editor-modal { border-radius: 14px 14px 0 0; margin-top: auto; max-height: 92vh; }
  .editor-body { padding: 14px 16px 16px; }
  .editor-header { padding: 14px 16px; }
  .editor-section { margin-bottom: 14px; }
}
</style>