﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="app">
    <ProfileHeader
      :profile="profile"
      :calendar-active="showCalendar || !!selectedDate"
      @edit-profile="showProfileEditor = true"
      @open-composer="showComposer = true"
      @open-settings="showSettings = true"
      @toggle-calendar="showCalendar = !showCalendar"
    />

    <main class="app-main" v-if="!selectedPostId">
      <div class="app-main-inner">
        <SearchBar v-model="searchKeyword" @clear="searchKeyword = ''" />

        <CalendarView
          v-if="showCalendar"
          :posts="posts"
          :selected-date="selectedDate"
          @select-date="selectDate"
          @clear-date="clearDate"
        />

        <div v-if="selectedDate || selectedTag || searchKeyword.trim()" class="search-status-bar">
          <span>
            <span v-if="selectedDate">日期：<strong>{{ selectedDate }}</strong></span>
            <span v-if="selectedDate && (selectedTag || searchKeyword.trim())"> · </span>
            <span v-if="selectedTag">标签：<strong>#{{ selectedTag }}</strong></span>
            <span v-if="selectedTag && searchKeyword.trim()"> · </span>
            <span v-if="searchKeyword.trim()">搜索“{{ searchKeyword.trim() }}”：共 {{ visiblePosts.length }} 条</span>
          </span>
          <span class="search-status-actions">
            <button v-if="selectedDate" class="search-status-action" @click="clearDate">清除日期</button>
            <button v-if="searchKeyword.trim()" class="search-status-action" @click="searchKeyword = ''">清除搜索</button>
            <button v-if="selectedTag" class="search-status-action" @click="clearTagFilter">清除筛选</button>
          </span>
        </div>

        <div v-if="visiblePosts.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <p v-if="selectedDate && (selectedTag || searchKeyword.trim())" class="empty-text">没有找到符合当前筛选条件的动态。</p>
          <p v-else-if="selectedDate" class="empty-text">{{ selectedDate }} 没有动态。</p>
          <p v-else-if="selectedTag && searchKeyword.trim()" class="empty-text">没有找到同时符合 #{{ selectedTag }} 和“{{ searchKeyword.trim() }}”的动态。</p>
          <p v-else-if="searchKeyword.trim()" class="empty-text">没有找到与“{{ searchKeyword.trim() }}”相关的动态。</p>
          <p v-else-if="selectedTag" class="empty-text">没有找到 #{{ selectedTag }} 相关动态。</p>
          <p v-else class="empty-text">还没有动态，发布第一条吧。</p>
        </div>

        <div v-else class="post-list">
          <PostCard
            v-for="post in visiblePosts"
            :key="post.id"
            :post="post"
            :profile="profile"
            @toggle-like="toggleLike"
            @add-comment="handleAddComment"
            @delete-post="handleDeletePost"
            @delete-comment="handleDeleteComment"
            @reply-to-ai="handleReplyToAi"
            @open-philosopher="openPhilosopherCard"
            @open-image-preview="openImagePreview"
            @edit-post="handleEditPost"
            @open-detail="openPostDetail"
            @filter-by-tag="filterByTag"
          />
        </div>
      </div>
    </main>

    <PostDetail
      v-if="selectedPostId"
      :post="selectedPost"
      :profile="profile"
      @back="closePostDetail"
      @toggle-like="toggleLike"
      @add-comment="handleAddComment"
      @delete-post="handleDeletePostFromDetail"
      @delete-comment="handleDeleteComment"
      @reply-to-ai="handleReplyToAi"
      @open-philosopher="openPhilosopherCard"
      @open-image-preview="openImagePreview"
      @edit-post="handleEditPost"
      @filter-by-tag="filterByTag"
    /><PostComposer
      v-if="showComposer"
      @close="showComposer = false"
      @published="handlePublished"
    />

    <ProfileEditor
      v-if="showProfileEditor"
      @close="showProfileEditor = false"
      @saved="loadProfile"
    />

    <PhilosopherCard
      v-if="showPhilosopherCard"
      :philosopher="selectedPhilosopher"
      :visible="showPhilosopherCard"
      @close="closePhilosopherCard"
    />

    <SettingsModal
      v-if="showSettings"
      @close="showSettings = false"
      @saved="loadSettings"
    />

    <ImagePreviewModal
      :visible="imagePreviewVisible"
      :images="previewImages"
      :initial-index="previewIndex"
      @close="closeImagePreview"
    />

    <EditPostModal
      v-if="editingPost"
      :post="editingPost"
      @save="handleEditSave"
      @cancel="handleEditCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPosts, createPost, updatePost, updatePostContent, addComment, deletePost, deleteComment, addAiPlaceholder, updateAiComment, addCommentReply, updateCommentReply } from './services/postService.js'
import { getProfile } from './services/profileService.js'
import { getApiKey, isAiCommentEnabled, getCommentTone, getCommentLength, getAiLikeFrequency } from './services/settingsService.js'
import { getRandomPhilosopher, generateAiComment, generateAiReply, getPhilosopherByName } from './services/aiService.js'
import { generateAiLikes } from './services/aiLikeService.js'
import { philosophers } from './data/philosophers.js'
import { generateDailySagePostIfNeeded } from './services/dailySageService.js'
import ProfileHeader from './components/ProfileHeader.vue'
import ProfileEditor from './components/ProfileEditor.vue'
import PostComposer from './components/PostComposer.vue'
import PostCard from './components/PostCard.vue'
import PhilosopherCard from './components/PhilosopherCard.vue'
import SettingsModal from './components/SettingsModal.vue'
import ImagePreviewModal from './components/ImagePreviewModal.vue'
import EditPostModal from './components/EditPostModal.vue'
import PostDetail from './components/PostDetail.vue'
import SearchBar from './components/SearchBar.vue'
import CalendarView from './components/CalendarView.vue'
import { postMatchesSearch } from './utils/search.js'

const posts = ref([])
const profile = ref({})
const showComposer = ref(false)
const showProfileEditor = ref(false)
const showSettings = ref(false)
const selectedPhilosopher = ref(null)
const showPhilosopherCard = ref(false)
const imagePreviewVisible = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)
const editingPostId = ref(null)
const editingPost = ref(null)
const selectedPostId = ref(null)
const selectedTag = ref('')
const searchKeyword = ref('')
const selectedDate = ref('')
const showCalendar = ref(false)

const selectedPost = computed(() => {
  if (!selectedPostId.value) return null
  return posts.value.find(p => p.id === selectedPostId.value) || null
})

const visiblePosts = computed(() => {
  var result = posts.value
  if (selectedTag.value) {
    result = result.filter(function(post) {
      return Array.isArray(post.tags) && post.tags.includes(selectedTag.value)
    })
  }
  if (searchKeyword.value.trim()) {
    var kw = searchKeyword.value.trim()
    result = result.filter(function(post) {
      return postMatchesSearch(post, kw)
    })
  }
  if (selectedDate.value) {
    var dk = selectedDate.value
    result = result.filter(function(post) {
      if (!post || !post.createdAt) return false
      var d = new Date(post.createdAt)
      if (isNaN(d.getTime())) return false
      var y = d.getFullYear()
      var m = String(d.getMonth() + 1).padStart(2, '0')
      var day = String(d.getDate()).padStart(2, '0')
      return (y + '-' + m + '-' + day) === dk
    })
  }
  return result
})

function loadData() {
  posts.value = getPosts().sort((a, b) => b.createdAt - a.createdAt)
}

function loadProfile() {
  profile.value = getProfile()
}

function loadSettings() {}

function handlePublished(content, images, music, location, tags) {
  var post = createPost({ content, images, music, location, tags })

  var frequency = getAiLikeFrequency()
  if (frequency !== 'off') {
    var aiLikers = generateAiLikes({
      philosophers: philosophers,
      frequency: frequency,
      existingLikedBy: post.likedBy || []
    })
    if (aiLikers.length > 0) {
      var currentLikedBy = post.likedBy || []
      var merged = currentLikedBy.concat(aiLikers)
      updatePost(post.id, { likedBy: merged, likeCount: merged.length })
    }
  }

  loadData()

  if (isAiCommentEnabled()) {
    var apiKey = getApiKey()
    if (!apiKey) {
      console.warn('[AI] 先贤评论已开启，但未填写 API Key')
      return
    }

    var philosopher = getRandomPhilosopher()
    var placeholder = addAiPlaceholder(post.id, philosopher.name)
    loadData()

    generateAiComment({
      content: content + (music ? ' [分享音乐：' + music.title + (music.artist ? ' - ' + music.artist : '') + ']' : ''),
      philosopher: philosopher,
      apiKey: apiKey,
      commentTone: getCommentTone(),
      commentLength: getCommentLength(),
      location: location || '',
      tags: tags || []
    }).then(function(commentText) {
      updateAiComment(post.id, placeholder.id, commentText, false)
      loadData()
    }).catch(function() {
      updateAiComment(post.id, placeholder.id, '先贤暂时沉默，请稍后再试。', false)
      loadData()
    })
  }
}

function handleReplyToAi({ postId, commentId, content, aiCharacter }) {
  var userReply = {
    id: 'ru_' + Date.now(),
    author: (profile.value && profile.value.nickname) || '我',
    content: content,
    createdAt: Date.now(),
    isAi: false,
    aiCharacter: '',
    loading: false,
    replyTo: aiCharacter
  }
  addCommentReply(postId, commentId, userReply)
  loadData()

  if (!isAiCommentEnabled()) {
    console.warn('[AI] 先贤评论已关闭，不生成回复')
    return
  }

  var apiKey = getApiKey()
  if (!apiKey) {
    console.warn('[AI] 未填写 API Key，不生成回复')
    return
  }

  var philosopher = getPhilosopherByName(aiCharacter)
  if (!philosopher) {
    console.error('[AI] 找不到先贤:', aiCharacter)
    return
  }

  var allPosts = getPosts()
  var post = allPosts.find(function(p) { return p.id === postId })
  var comment = post && post.comments.find(function(c) { return c.id === commentId })
  var previousReplies = (comment && comment.replies) || []

  var aiPlaceholder = {
    id: 'rr_' + Date.now(),
    author: aiCharacter,
    content: '先贤思考中...',
    createdAt: Date.now(),
    isAi: true,
    aiCharacter: aiCharacter,
    loading: true,
    replyTo: (profile.value && profile.value.nickname) || '我'
  }
  addCommentReply(postId, commentId, aiPlaceholder)
  loadData()

  generateAiReply({
    postContent: post ? post.content : '',
    originalAiComment: comment ? comment.content : '',
    userReply: content,
    previousReplies: previousReplies,
    philosopher: philosopher,
    apiKey: apiKey,
    commentTone: getCommentTone(),
    commentLength: getCommentLength()
  }).then(function(replyText) {
    updateCommentReply(postId, commentId, aiPlaceholder.id, {
      content: replyText,
      loading: false
    })
    loadData()
  }).catch(function() {
    updateCommentReply(postId, commentId, aiPlaceholder.id, {
      content: '先贤暂时沉默，请稍后再试。',
      loading: false
    })
    loadData()
  })
}

function toggleLike(postId) {
  const post = posts.value.find(p => p.id === postId)
  if (!post) return
  const liked = !post.liked
  const likeCount = post.likeCount + (liked ? 1 : -1)
  updatePost(postId, { liked, likeCount })
  loadData()
}

function handleAddComment(postId, content) {
  addComment(postId, content)
  loadData()
}

function handleDeletePost(postId) {
  deletePost(postId)
  loadData()
}

function handleDeleteComment(postId, commentId) {
  deleteComment(postId, commentId)
  loadData()
}

function openPhilosopherCard(idOrName) {
  if (!idOrName) return
  var p = null
  for (var i = 0; i < philosophers.length; i++) {
    if (philosophers[i].id === idOrName || philosophers[i].name === idOrName) {
      p = philosophers[i]; break
    }
  }
  if (p) {
    selectedPhilosopher.value = p
    showPhilosopherCard.value = true
  }
}

function closePhilosopherCard() {
  showPhilosopherCard.value = false
  selectedPhilosopher.value = null
}

function openImagePreview({ images, index }) {
  previewImages.value = images || []
  previewIndex.value = index || 0
  imagePreviewVisible.value = true
}

function closeImagePreview() {
  imagePreviewVisible.value = false
  previewImages.value = []
  previewIndex.value = 0
}

function handleEditPost(postId) {
  var allPosts = getPosts()
  var post = allPosts.find(function(p) { return p.id === postId })
  if (!post) return
  if (post.isDailySage || post.authorType === 'sage') return
  editingPostId.value = postId
  editingPost.value = post
}

function handleEditSave(patch) {
  updatePostContent(editingPostId.value, patch)
  editingPostId.value = null
  editingPost.value = null
  loadData()
}

function handleEditCancel() {
  editingPostId.value = null
  editingPost.value = null
}

function openPostDetail(postId) {
  selectedPostId.value = postId
}

function closePostDetail() {
  selectedPostId.value = null
}

function handleDeletePostFromDetail(postId) {
  deletePost(postId)
  selectedPostId.value = null
  loadData()
}

function filterByTag(tag) {
  selectedTag.value = tag
}

function clearTagFilter() {
  selectedTag.value = ''
}

function selectDate(dateKey) {
  selectedDate.value = dateKey
}

function clearDate() {
  selectedDate.value = ''
}

onMounted(() => {
  loadProfile()
  loadData()
  generateDailySagePostIfNeeded()
  loadData()
})
</script>

<style scoped>
.app-main { background-color: #F7F7F7; }
.app-main-inner { padding: 14px 12px 24px; }
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 80px 16px 0;
}
.empty-icon { margin-bottom: 16px; }
.empty-text { font-size: 15px; color: #888; }

@media (max-width: 600px) {
  .app-main-inner { padding: 10px 8px 20px; }
}
</style>