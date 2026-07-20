﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="composer-overlay" @click.self="handleClose">
    <div class="composer">
      <div class="composer-header">
        <button class="btn-cancel" @click="handleClose" :disabled="publishing">取消</button>
        <span class="composer-title">发布动态</span>
        <button
          class="btn-publish"
          :disabled="!canPublish || publishing"
          @click="handlePublish"
        >
          {{ publishing ? '发布中...' : '发布' }}
        </button>
      </div>

      <div v-if="publishError" class="publish-error">
        {{ publishError }}
      </div>

      <div v-if="draftRestored" class="draft-hint">已恢复上次未发布的草稿</div>

      <textarea
        class="composer-input"
        v-model="content"
        placeholder="这一刻的想法..."
        autofocus
      ></textarea>

      <div class="image-preview-area" v-if="previewImages.length">
        <div class="preview-grid">
          <div v-for="(img, i) in displayPreviewImages" :key="i" class="preview-item">
            <img :src="img" alt="" />
            <button class="remove-btn" @click="removeImage(i)">x</button>
          </div>
        </div>
      </div>

      <div class="music-form" v-if="showMusicForm">
        <div class="music-form-header">
          <span class="music-form-title">音乐卡片</span>
          <button class="music-form-clear" @click="clearMusic">清除</button>
        </div>
        <input class="music-form-input" v-model="musicTitle" placeholder="歌名（必填）" />
        <input class="music-form-input" v-model="musicArtist" placeholder="歌手" />
        <input class="music-form-input" v-model="musicUrl" placeholder="音乐链接" />
        <div class="music-cover-row">
          <label class="music-cover-btn" v-if="!musicCover">
            <input type="file" accept="image/*" hidden @change="handleCoverSelect" />
            + 封面图
          </label>
          <div v-else class="music-cover-preview">
            <img :src="displayMusicCover" alt="" />
            <button class="remove-btn" @click="musicCover = ''">x</button>
          </div>
        </div>
      </div>

      <div class="location-editor" v-if="showLocationForm">
        <div class="location-form-header">
          <span class="location-form-title">添加地址</span>
          <button class="location-form-clear" @click="clearLocation">清除</button>
        </div>
        <input class="location-input" v-model="location" placeholder="你在哪里？" maxlength="40" />
        <p class="location-preview" v-if="location.trim()">📍 {{ location.trim() }}</p>
        <p class="location-limit-hint" v-if="location.length >= 40">地址最多 40 个字</p>
      </div>

      <div class="tag-editor" v-if="showTagForm">
        <div class="tag-form-header">
          <span class="tag-form-title">添加标签</span>
          <button class="tag-form-clear" @click="clearTags">清除全部</button>
        </div>
        <div class="tag-chips" v-if="tags.length">
          <span v-for="(tag, i) in tags" :key="i" class="tag-chip-edit">#{{ tag }}<button class="tag-chip-remove" @click="removeTag(i)">×</button></span>
        </div>
        <div class="tag-input-row" v-if="tags.length < 5">
          <input class="tag-input" v-model="tagInput" placeholder="输入标签，按 Enter 添加" @keyup.enter="addTag" maxlength="11" />
          <button class="tag-add-btn" :disabled="!tagInput.trim()" @click="addTag">添加</button>
        </div>
        <p v-else class="tag-limit-hint">最多添加 5 个标签</p>
        <div class="tag-suggestions">
          <span class="tag-suggest-label">常用：</span>
          <button v-for="s in suggestedTags" :key="s" class="tag-suggest-btn" :class="{'tag-suggest-active': tags.includes(s)}" @click="addSuggestedTag(s)">#{{ s }}</button>
        </div>
      </div>

      <div class="composer-footer">
        <label class="add-image-btn" v-if="previewImages.length < 9">
          <input type="file" accept="image/*" multiple hidden @change="handleImageSelect" />
          + 添加图片
        </label>
        <button class="add-music-btn" @click="showMusicForm = !showMusicForm">
          {{ showMusicForm ? '- 收起音乐' : '+ 添加音乐' }}
        </button>
        <button class="add-location-btn" @click="showLocationForm = !showLocationForm">
          {{ showLocationForm ? '- 收起地址' : '+ 添加地址' }}
        </button>
        <button class="add-tag-btn" @click="showTagForm = !showTagForm">
          {{ showTagForm ? '- 收起标签' : '+ 添加标签' }}
        </button>
        <span class="image-count" v-if="previewImages.length">{{ previewImages.length }}/9</span>
      </div>
    </div>

    <div v-if="showConfirm" class="confirm-overlay" @click.self="showConfirm = false">
      <div class="confirm-dialog">
        <div class="confirm-title">保留草稿？</div>
        <div class="confirm-desc">你正在编辑的内容还没有发布，是否保留为草稿？</div>
        <div class="confirm-actions">
          <button class="confirm-btn confirm-discard" @click="discardAndClose">不保留</button>
          <button class="confirm-btn confirm-continue" @click="showConfirm = false">继续编辑</button>
          <button class="confirm-btn confirm-keep" @click="keepAndClose">保留</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { processImages, readMusicCoverAsBase64, processImagesForDraft, isNativePlatform } from '../services/imageService.js'
import { getDraft, saveDraft, clearDraft, isDraftEmpty } from '../services/draftService.js'
import { useImageUrls, useImageUrl } from '../composables/useImageUrl.js'
import { saveBase64Image, getDraftMusicCoverPath, clearDraftFiles, deleteStoredFile } from '../services/fileStorageService.js'

const props = defineProps({
  publishing: {
    type: Boolean,
    default: false
  },
  publishError: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'published'])
const content = ref('')
const previewImages = ref([])
const displayPreviewImages = useImageUrls(previewImages)
const showMusicForm = ref(false)
const musicTitle = ref('')
const musicArtist = ref('')
const musicUrl = ref('')
const musicCover = ref('')
const displayMusicCover = useImageUrl(musicCover)
const draftRestored = ref(false)
const showConfirm = ref(false)
const location = ref('')
const showLocationForm = ref(false)
const tags = ref([])
const tagInput = ref('')
const showTagForm = ref(false)
const suggestedTags = ['生活', '读书', '法理', '罗马法', '情绪', '课堂', '随想', '工作', '音乐', '今日先贤']

var saveTimer = null

const canPublish = computed(() => {
  return content.value.trim() || previewImages.value.length || musicTitle.value.trim() || location.value.trim()
})

function getCurrentDraft() {
  var music = null
  if (musicTitle.value.trim()) {
    music = {
      title: musicTitle.value.trim(),
      artist: musicArtist.value.trim(),
      url: musicUrl.value.trim(),
      cover: musicCover.value
    }
  }
  return {
    content: content.value,
    images: previewImages.value.slice(),
    music: music,
    location: location.value,
    tags: tags.value.slice()
  }
}

function isCurrentEmpty() {
  return isDraftEmpty(getCurrentDraft())
}

function autoSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(function() {
    var draft = getCurrentDraft()
    if (isDraftEmpty(draft)) {
      clearDraft()
    } else {
      var ok = saveDraft(draft)
      if (!ok) {
        console.warn('[Draft] 保存失败，图片可能过大')
      }
    }
  }, 300)
}

watch(content, autoSave)
watch(previewImages, autoSave, { deep: true })
watch(musicTitle, autoSave)
watch(musicArtist, autoSave)
watch(musicUrl, autoSave)
watch(musicCover, autoSave)
watch(location, autoSave)
watch(showLocationForm, autoSave)
watch(tags, autoSave, { deep: true })
watch(showTagForm, autoSave)

function restoreDraft() {
  var draft = getDraft()
  if (isDraftEmpty(draft)) return
  content.value = draft.content || ''
  previewImages.value = draft.images || []
  if (draft.music && draft.music.title) {
    musicTitle.value = draft.music.title
    musicArtist.value = draft.music.artist || ''
    musicUrl.value = draft.music.url || ''
    musicCover.value = draft.music.cover || ''
    showMusicForm.value = true
    draftRestored.value = true
  }
  if (draft.location && draft.location.trim()) {
    location.value = draft.location
    showLocationForm.value = true
    draftRestored.value = true
  }
  if (draft.tags && draft.tags.length) {
    tags.value = draft.tags.slice()
    showTagForm.value = true
    draftRestored.value = true
  }
  if (!draftRestored.value && (draft.content.trim() || (draft.images && draft.images.length))) {
    draftRestored.value = true
  }
}

function handleClose() {
  if (isCurrentEmpty()) {
    clearDraft()
    emit('close')
    return
  }
  showConfirm.value = true
}

function keepAndClose() {
  saveDraft(getCurrentDraft())
  showConfirm.value = false
  emit('close')
}

function discardAndClose() {
  clearDraft()
  showConfirm.value = false
  emit('close')
}

async function handleImageSelect(e) {
  const files = Array.from(e.target.files)
  const remaining = 9 - previewImages.value.length
  if (files.length > remaining) {
    alert('最多只能选择 9 张图片')
    files.splice(remaining)
  }
  const newImages = isNativePlatform()
    ? await processImagesForDraft(files, previewImages.value.length)
    : await processImages(files)
  previewImages.value.push(...newImages)
  e.target.value = ''
}

async function handleCoverSelect(e) {
  var file = e.target.files && e.target.files[0]
  if (!file) return
  try {
    var base64 = await readMusicCoverAsBase64(file)
    if (isNativePlatform()) {
      musicCover.value = await saveBase64Image({
        base64: base64,
        path: getDraftMusicCoverPath()
      })
    } else {
      musicCover.value = base64
    }
  } catch (err) {
    alert('封面图处理失败')
  }
  e.target.value = ''
}

function removeImage(index) {
  var removed = previewImages.value[index]
  previewImages.value.splice(index, 1)
  if (isNativePlatform() && typeof removed === 'string' && removed.indexOf('draft/') === 0) {
    deleteStoredFile(removed).catch(function() {})
  }
}

function clearMusic() {
  musicTitle.value = ''
  musicArtist.value = ''
  musicUrl.value = ''
  musicCover.value = ''
  showMusicForm.value = false
}

function clearLocation() {
  location.value = ''
  showLocationForm.value = false
}

function addTag() {
  var t = tagInput.value.trim()
  if (!t) return
  if (t.charAt(0) === '#') t = t.substring(1)
  t = t.trim()
  if (!t) return
  if (t.length > 10) t = t.substring(0, 10)
  if (tags.value.includes(t)) { tagInput.value = ''; return }
  if (tags.value.length >= 5) { alert('最多添加 5 个标签'); return }
  tags.value.push(t)
  tagInput.value = ''
}

function removeTag(index) {
  tags.value.splice(index, 1)
}

function clearTags() {
  tags.value = []
  tagInput.value = ''
}

function addSuggestedTag(s) {
  if (tags.value.includes(s)) return
  if (tags.value.length >= 5) { alert('最多添加 5 个标签'); return }
  tags.value.push(s)
}

function handlePublish() {
  if (!canPublish.value || props.publishing) return

  var music = null
  if (musicTitle.value.trim()) {
    music = {
      title: String(musicTitle.value).trim(),
      artist: String(musicArtist.value).trim(),
      url: String(musicUrl.value).trim(),
      cover: String(musicCover.value)
    }
  }

  var safeImages = []
  if (Array.isArray(previewImages.value)) {
    for (var i = 0; i < previewImages.value.length; i++) {
      if (typeof previewImages.value[i] === 'string') {
        safeImages.push(previewImages.value[i])
      }
    }
  }

  var payload = {
    content: String(content.value || '').trim(),
    images: safeImages,
    music: music,
    location: String(location.value || '').trim(),
    tags: Array.isArray(tags.value) ? tags.value.slice() : []
  }

  console.log("[publish] button clicked")
  console.log("[publish] platform:", window.Capacitor && window.Capacitor.getPlatform ? window.Capacitor.getPlatform() : "web")
  console.log("[publish] content length:", payload.content ? payload.content.length : 0)
  console.log("[publish] payload created")

  try {
    emit('published', payload)

    onPublishSuccess()
  } catch (error) {
    console.error("[publish] emit failed", {
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })
  }
}

function onPublishSuccess() {
  content.value = ''
  previewImages.value = []
  musicTitle.value = ''
  musicArtist.value = ''
  musicUrl.value = ''
  musicCover.value = ''
  showMusicForm.value = false
  location.value = ''
  showLocationForm.value = false
  tags.value = []
  tagInput.value = ''
  showTagForm.value = false
  draftRestored.value = false
  clearDraft()
}

onMounted(() => {
  restoreDraft()
})
</script>

<style scoped>
.composer-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); z-index: 200;
  display: flex; align-items: flex-end; justify-content: center;
}
.composer {
  width: 100%; max-width: 720px;
  background-color: #fff; border-radius: 16px 16px 0 0;
  padding: 16px 20px; max-height: 90vh; overflow-y: auto;
  animation: slideUp 0.25s ease;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.composer-header {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 14px;
}
.composer-title { font-size: 16px; font-weight: 600; color: #222; }
.btn-cancel { background: none; border: none; font-size: 15px; color: #888; cursor: pointer; }
.btn-publish {
  background-color: #07C160; color: #fff; border: none;
  border-radius: 8px; padding: 7px 20px; font-size: 14px;
  font-weight: 500; cursor: pointer; transition: background-color 0.2s;
}
.btn-publish:disabled { background-color: #a0e8b8; cursor: not-allowed; }
.btn-publish:not(:disabled):hover { background-color: #06ad56; }
.publish-error {
  background: #FFF0F0; color: #D32F2F; font-size: 13px;
  border-radius: 8px; padding: 8px 12px; margin-bottom: 10px;
  line-height: 1.5;
  border: 1px solid #FFCDD2;
}
.draft-hint {
  background: #FFF8E1; color: #8D6E00; font-size: 13px;
  border-radius: 8px; padding: 8px 12px; margin-bottom: 10px;
  line-height: 1.4;
}
.composer-input {
  width: 100%; min-height: 130px; border: none; outline: none;
  resize: none; font-size: 15px; line-height: 1.7; color: #222;
  font-family: inherit;
}
.composer-input::placeholder { color: #ccc; }
.image-preview-area { margin-bottom: 8px; }
.preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.preview-item { position: relative; aspect-ratio: 1; border-radius: 6px; overflow: hidden; }
.preview-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
.remove-btn {
  position: absolute; top: 4px; right: 4px; width: 22px; height: 22px;
  border-radius: 50%; background-color: rgba(0,0,0,0.5); color: #fff;
  border: none; font-size: 12px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; line-height: 1;
}
.music-form {
  background: #f7f7f7; border-radius: 10px; padding: 12px;
  margin-bottom: 8px;
}
.music-form-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px;
}
.music-form-title { font-size: 14px; font-weight: 600; color: #222; }
.music-form-clear {
  background: none; border: none; font-size: 13px;
  color: #e74c3c; cursor: pointer;
}
.music-form-input {
  width: 100%; box-sizing: border-box;
  border: 1px solid #e0e0e0; border-radius: 8px;
  padding: 8px 12px; font-size: 14px; color: #222;
  outline: none; margin-bottom: 8px; transition: border-color 0.2s;
}
.music-form-input:focus { border-color: #07C160; }
.music-cover-row { display: flex; align-items: center; gap: 8px; }
.music-cover-btn {
  display: inline-block; padding: 6px 14px;
  border: 1px dashed #ccc; border-radius: 8px;
  font-size: 13px; color: #888; cursor: pointer; transition: all 0.2s;
}
.music-cover-btn:hover { border-color: #07C160; color: #07C160; border-style: solid; }
.music-cover-preview { position: relative; width: 64px; height: 64px; border-radius: 8px; overflow: hidden; }
.music-cover-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.composer-footer {
  display: flex; align-items: center; gap: 12px;
  padding-top: 10px; border-top: 1px solid #EAEAEA;
  flex-wrap: wrap;
}
.add-image-btn {
  display: inline-block; padding: 7px 16px;
  border: 1px dashed #ccc; border-radius: 8px;
  font-size: 13px; color: #888; cursor: pointer; transition: all 0.2s;
}
.add-image-btn:hover { border-color: #07C160; color: #07C160; border-style: solid; }
.add-music-btn {
  background: none; border: 1px dashed #ccc; border-radius: 8px;
  padding: 7px 16px; font-size: 13px; color: #888;
  cursor: pointer; transition: all 0.2s;
}
.add-music-btn:hover { border-color: #C9A96E; color: #C9A96E; border-style: solid; }
.add-location-btn {
  background: none; border: 1px dashed #ccc; border-radius: 8px;
  padding: 7px 16px; font-size: 13px; color: #888;
  cursor: pointer; transition: all 0.2s;
}
.add-location-btn:hover { border-color: #576B95; color: #576B95; border-style: solid; }
.image-count { font-size: 12px; color: #888; white-space: nowrap; }

@media (max-width: 600px) {
  .composer { padding: 14px 14px; max-height: 90vh; }
  .composer-input { min-height: 100px; }
  .add-image-btn, .add-music-btn, .add-location-btn { padding: 6px 12px; font-size: 12px; }
  .confirm-dialog { width: 280px; padding: 20px 16px 16px; }
  .confirm-actions { flex-wrap: wrap; }
  .confirm-btn { padding: 7px 14px; font-size: 12px; }
}
.location-editor {
  background: #f7f7f7; border-radius: 10px; padding: 12px;
  margin-bottom: 8px;
}
.location-form-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px;
}
.location-form-title { font-size: 14px; font-weight: 600; color: #222; }
.location-form-clear {
  background: none; border: none; font-size: 13px;
  color: #e74c3c; cursor: pointer;
}
.location-input {
  width: 100%; box-sizing: border-box;
  border: 1px solid #e5e5e5; border-radius: 8px;
  padding: 8px 12px; font-size: 14px; color: #222;
  outline: none; transition: border-color 0.2s;
}
.location-input:focus { border-color: #576B95; }
.location-preview {
  margin-top: 8px; font-size: 13px; color: #576B95;
}
.location-limit-hint {
  margin-top: 4px; font-size: 12px; color: #e74c3c;
}

.confirm-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.4); z-index: 250;
  display: flex; align-items: center; justify-content: center;
}
.confirm-dialog {
  width: 300px; background: #fff; border-radius: 14px;
  padding: 24px 20px 18px; text-align: center;
  animation: fadeIn 0.15s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.confirm-title { font-size: 16px; font-weight: 600; color: #222; margin-bottom: 8px; }
.confirm-desc { font-size: 13px; color: #888; line-height: 1.5; margin-bottom: 20px; }
.confirm-actions { display: flex; gap: 8px; justify-content: center; }
.confirm-btn {
  padding: 8px 16px; border-radius: 8px; font-size: 13px;
  font-weight: 500; cursor: pointer; border: none; transition: all 0.2s;
}
.confirm-discard { background: #f5f5f5; color: #888; }
.confirm-discard:hover { background: #eee; color: #555; }
.confirm-continue { background: #f5f5f5; color: #555; }
.confirm-continue:hover { background: #eee; }
.confirm-keep { background: #07C160; color: #fff; }
.confirm-keep:hover { background: #06ad56; }
</style>