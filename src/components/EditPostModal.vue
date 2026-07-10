<template>
  <div class="edit-overlay" @click.self="handleCancel">
    <div class="edit-modal">
      <div class="edit-header">
        <button class="btn-cancel" @click="handleCancel">取消</button>
        <span class="edit-title">编辑动态</span>
        <button class="btn-save" :disabled="!canSave" @click="handleSave">保存修改</button>
      </div>

      <textarea
        class="edit-input"
        v-model="draft.content"
        placeholder="这一刻的想法..."
        autofocus
      ></textarea>

      <div class="image-preview-area" v-if="draft.images.length">
        <div class="preview-grid">
          <div v-for="(img, i) in draft.images" :key="i" class="preview-item">
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
        <input class="music-form-input" v-model="draft.music.title" placeholder="歌名（必填）" />
        <input class="music-form-input" v-model="draft.music.artist" placeholder="歌手" />
        <input class="music-form-input" v-model="draft.music.url" placeholder="音乐链接" />
        <div class="music-cover-row">
          <label class="music-cover-btn" v-if="!draft.music.cover">
            <input type="file" accept="image/*" hidden @change="handleCoverSelect" />
            + 封面图
          </label>
          <div v-else class="music-cover-preview">
            <img :src="draft.music.cover" alt="" />
            <button class="remove-btn" @click="draft.music.cover = ''">x</button>
          </div>
        </div>
      </div>

      <div class="location-editor" v-if="showLocationForm">
        <div class="location-form-header">
          <span class="location-form-title">添加地址</span>
          <button class="location-form-clear" @click="clearLocation">清除</button>
        </div>
        <input class="location-input" v-model="draft.location" placeholder="你在哪里？" maxlength="40" />
        <p class="location-preview" v-if="draft.location.trim()">📍 {{ draft.location.trim() }}</p>
        <p class="location-limit-hint" v-if="draft.location.length >= 40">地址最多 40 个字</p>
      </div>

      <div class="tag-editor" v-if="showTagForm">
        <div class="tag-form-header">
          <span class="tag-form-title">编辑标签</span>
          <button class="tag-form-clear" @click="clearTags">清除全部</button>
        </div>
        <div class="tag-chips" v-if="draft.tags.length">
          <span v-for="(tag, i) in draft.tags" :key="i" class="tag-chip-edit">#{{ tag }}<button class="tag-chip-remove" @click="removeTag(i)">×</button></span>
        </div>
        <div class="tag-input-row" v-if="draft.tags.length < 5">
          <input class="tag-input" v-model="tagInput" placeholder="输入标签，按 Enter 添加" @keyup.enter="addTag" maxlength="11" />
          <button class="tag-add-btn" :disabled="!tagInput.trim()" @click="addTag">添加</button>
        </div>
        <p v-else class="tag-limit-hint">最多添加 5 个标签</p>
      </div>

      <div class="edit-footer">
        <label class="add-image-btn" v-if="draft.images.length < 9">
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
          {{ showTagForm ? '- 收起标签' : '+ 编辑标签' }}
        </button>
        <span class="image-count" v-if="draft.images.length">{{ draft.images.length }}/9</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { processImages, readMusicCoverAsBase64 } from '../services/imageService.js'

const props = defineProps({ post: Object })
const emit = defineEmits(['save', 'cancel'])

const draft = reactive({
  content: '',
  images: [],
  music: { title: '', artist: '', url: '', cover: '' },
  location: '',
  tags: []
})

const showMusicForm = ref(false)
const showLocationForm = ref(false)
const showTagForm = ref(false)
const tagInput = ref('')

const canSave = computed(() => {
  return draft.content.trim() || draft.images.length || draft.music.title.trim() || draft.location.trim()
})

function initFromPost(post) {
  draft.content = post.content || ''
  draft.images = (post.images || []).slice()
  draft.location = post.location || ''
  if (post.music && post.music.title) {
    draft.music = {
      title: post.music.title || '',
      artist: post.music.artist || '',
      url: post.music.url || '',
      cover: post.music.cover || ''
    }
    showMusicForm.value = true
  } else {
    draft.music = { title: '', artist: '', url: '', cover: '' }
    showMusicForm.value = false
  }
  if (draft.location.trim()) {
    showLocationForm.value = true
  }
  draft.tags = Array.isArray(post.tags) ? post.tags.slice() : []
  if (draft.tags.length) {
    showTagForm.value = true
  }
}

initFromPost(props.post)

function handleCancel() {
  emit('cancel')
}

function handleSave() {
  if (!canSave.value) return
  var music = null
  if (draft.music.title.trim()) {
    music = {
      title: draft.music.title.trim(),
      artist: draft.music.artist.trim(),
      url: draft.music.url.trim(),
      cover: draft.music.cover
    }
  }
  emit('save', {
    content: draft.content.trim(),
    images: [...draft.images],
    music: music,
    location: draft.location.trim(),
    tags: draft.tags.slice()
  })
}

async function handleImageSelect(e) {
  const files = Array.from(e.target.files)
  const remaining = 9 - draft.images.length
  if (files.length > remaining) {
    alert('最多只能选择 9 张图片')
    files.splice(remaining)
  }
  const newImages = await processImages(files)
  draft.images.push(...newImages)
  e.target.value = ''
}

async function handleCoverSelect(e) {
  var file = e.target.files && e.target.files[0]
  if (!file) return
  try {
    draft.music.cover = await readMusicCoverAsBase64(file)
  } catch (err) {
    alert('封面图处理失败')
  }
  e.target.value = ''
}

function removeImage(index) {
  draft.images.splice(index, 1)
}

function clearMusic() {
  draft.music = { title: '', artist: '', url: '', cover: '' }
  showMusicForm.value = false
}

function clearLocation() {
  draft.location = ''
  showLocationForm.value = false
}

function addTag() {
  var t = tagInput.value.trim()
  if (!t) return
  if (t.charAt(0) === '#') t = t.substring(1)
  t = t.trim()
  if (!t) return
  if (t.length > 10) t = t.substring(0, 10)
  if (draft.tags.includes(t)) { tagInput.value = ''; return }
  if (draft.tags.length >= 5) { alert('最多添加 5 个标签'); return }
  draft.tags.push(t)
  tagInput.value = ''
}

function removeTag(index) {
  draft.tags.splice(index, 1)
}

function clearTags() {
  draft.tags = []
  tagInput.value = ''
}
</script>

<style scoped>
.edit-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); z-index: 200;
  display: flex; align-items: flex-end; justify-content: center;
}
.edit-modal {
  width: 100%; max-width: 720px;
  background-color: #fff; border-radius: 16px 16px 0 0;
  padding: 16px 20px; max-height: 90vh; overflow-y: auto;
  animation: slideUp 0.25s ease;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.edit-header {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 14px;
}
.edit-title { font-size: 16px; font-weight: 600; color: #222; }
.btn-cancel { background: none; border: none; font-size: 15px; color: #888; cursor: pointer; }
.btn-save {
  background-color: #07C160; color: #fff; border: none;
  border-radius: 8px; padding: 7px 20px; font-size: 14px;
  font-weight: 500; cursor: pointer; transition: background-color 0.2s;
}
.btn-save:disabled { background-color: #a0e8b8; cursor: not-allowed; }
.btn-save:not(:disabled):hover { background-color: #06ad56; }
.edit-input {
  width: 100%; min-height: 130px; border: none; outline: none;
  resize: none; font-size: 15px; line-height: 1.7; color: #222;
  font-family: inherit;
}
.edit-input::placeholder { color: #ccc; }
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
.edit-footer {
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
  .edit-modal { padding: 14px 14px; max-height: 90vh; }
  .edit-input { min-height: 100px; }
  .add-image-btn, .add-music-btn, .add-location-btn { padding: 6px 12px; font-size: 12px; }
}
</style>