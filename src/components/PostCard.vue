﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="post-card" @click="emit('open-detail', post.id)">
    <div class="post-header">
      <div class="post-avatar">
        <template v-if="isSage">
          <div class="avatar-sage">{{ sageAvatarText }}</div>
        </template>
        <template v-else>
          <img v-if="profile && profile.avatar" :src="profile.avatar" alt="" class="avatar-img" />
          <div v-else class="avatar-default">{{ displayNickname.charAt(0) }}</div>
        </template>
      </div>
      <div class="post-header-info">
        <div class="post-name" :class="{'sage-author-name': isSage, 'philosopher-link': isSage}" @click.stop="isSage && emit('open-philosopher', post.authorId || post.authorName)">{{ displayNickname }}</div>
        <div class="post-time" @click.stop="showFullTime = !showFullTime">{{ showFullTime ? formatFullTime(post.createdAt) : formatTime(post.createdAt) }}<span v-if="post.updatedAt && post.updatedAt > post.createdAt" class="edited-badge"> · 已编辑</span></div>

      </div>
      <div class="post-more-wrap">
        <button class="more-btn" @click.stop="showMenu = !showMenu">···</button>
        <div v-if="showMenu" class="more-menu" @click.stop>
          <button v-if="canEdit" class="menu-item edit-item" @click="handleEditPost">编辑动态</button>
          <button class="menu-item delete-item" @click="handleDeletePost">删除动态</button>
        </div>
      </div>
    </div>

    <div class="post-body">
      <div v-if="post.content" class="post-content">{{ post.content }}</div>
      <ImageGrid v-if="post.images && post.images.length" :images="post.images" @open-preview="$emit('open-image-preview', $event)" @click.stop />
      <MusicCard v-if="post.music && post.music.title" :music="post.music" @click.stop />
      <div v-if="post.location && post.location.trim()" class="post-location">
        <span class="post-location-icon">📍</span>
        <span class="post-location-text">{{ post.location.trim() }}</span>
      </div>
      <div v-if="post.tags && post.tags.length" class="post-tags">
        <span v-for="tag in post.tags" :key="tag" class="post-tag-chip" @click.stop="emit('filter-by-tag', tag)">#{{ tag }}</span>
      </div>
    </div>

    <div class="post-footer">
      <button class="action-btn" :class="{ liked: post.liked }" @click.stop="handleLike">
        {{ post.liked ? '♥ 已赞' : '♡ 赞' }}
        <span v-if="post.likeCount">({{ post.likeCount }})</span>
      </button>
      <button class="action-btn" @click.stop="emit('open-detail', post.id)">
        评论<span v-if="post.comments && post.comments.length">({{ post.comments.length }})</span>
      </button>
    </div>

    <div v-if="hasInteraction" class="interaction-area" @click.stop>
      <LikeList :likedBy="post.likedBy" :profile="profile" @open-philosopher="(id) => emit('open-philosopher', id)" />

      <div v-if="hasComments" class="comment-section">
        <div v-if="post.comments && post.comments.length" class="comment-divider"></div>

        <template v-for="c in (post.comments || [])" :key="c.id">
          <div class="comment-item" :class="{ 'ai-comment': c.isAi }">
            <div class="comment-content">
              <span v-if="c.isAi" class="ai-badge">先贤评论</span>
              <span class="comment-user" :class="{ 'ai-name': c.isAi, 'philosopher-link': c.isAi }" @click.stop="c.isAi && emit('open-philosopher', c.aiCharacter || c.author)">{{ c.author || '我' }}</span>：{{ c.content }}
            </div>
            <button class="comment-del-btn" @click="handleDeleteComment(c.id)">删除</button>
          </div>

          <div v-if="c.isAi && c.replies && c.replies.length" class="replies-area">
            <div v-for="r in c.replies" :key="r.id" class="reply-item" :class="{ 'ai-reply': r.isAi }">
              <span class="reply-user" :class="{ 'ai-name': r.isAi, 'philosopher-link': r.isAi }" @click.stop="r.isAi && emit('open-philosopher', r.aiCharacter || r.author)">{{ r.author }}</span>
              <span class="reply-to" v-if="r.replyTo"> 回复 {{ r.replyTo }}</span>：{{ r.content }}
            </div>
          </div>

          <div v-if="c.isAi && !c.loading" class="ai-reply-action">
            <button
              v-if="aiReplyCount(c) < 3"
              class="reply-ai-btn"
              @click="openReplyInput(c.id)"
            >回复先贤</button>
            <span v-else class="reply-limit">对话已满</span>
          </div>
          <div v-if="activeReplyId === c.id" class="reply-input-row">
            <input
              v-model="replyText"
              class="reply-input"
              placeholder="回复这位先贤…"
              @keyup.enter="sendReply(c)"
            />
            <button class="reply-send" :disabled="!replyText.trim()" @click="sendReply(c)">发送</button>
          </div>
        </template>

        <div v-if="showComment" class="comment-input-row">
          <input v-model="commentText" class="comment-input" placeholder="写下你的回应…" @keyup.enter="sendComment" />
          <button class="comment-send" :disabled="!commentText.trim()" @click="sendComment">发送</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { formatTime, formatFullTime } from '../utils/time.js'
import ImageGrid from './ImageGrid.vue'
import LikeList from './LikeList.vue'
import MusicCard from './MusicCard.vue'
import { philosophers } from '../data/philosophers.js'

function isSagePost(post) {
  return post?.isDailySage === true || post?.authorType === 'sage'
}

function findPhilosopherNameById(id) {
  if (!id) return null
  var found = philosophers.find(function(p) { return p.id === id })
  return found ? found.name : null
}

function getPostAuthorName(post, profile) {
  if (isSagePost(post)) {
    return post.authorName || findPhilosopherNameById(post.authorId) || '今日先贤'
  }
  return (profile && profile.nickname) || '我'
}

function getSageAvatarText(name) {
  return name ? name.charAt(0) : '贤'
}

const props = defineProps({ post: Object, profile: Object })
const emit = defineEmits(['toggle-like', 'add-comment', 'delete-post', 'delete-comment', 'reply-to-ai', 'open-philosopher', 'open-image-preview', 'edit-post', 'open-detail', 'filter-by-tag'])
const showComment = ref(false)
const commentText = ref('')
const showMenu = ref(false)
const showFullTime = ref(false)
const activeReplyId = ref(null)
const replyText = ref('')

const displayNickname = computed(() => {
  return getPostAuthorName(props.post, props.profile)
})

const isSage = computed(() => isSagePost(props.post))

const sageAvatarText = computed(() => {
  var name = getPostAuthorName(props.post, props.profile)
  return getSageAvatarText(name)
})

const canEdit = computed(() => {
  return !props.post.isDailySage && props.post.authorType !== 'sage'
})

const hasComments = computed(() => {
  return showComment.value || (props.post.comments && props.post.comments.length)
})

const hasInteraction = computed(() => {
  return (props.post.likedBy && props.post.likedBy.length) || hasComments.value
})

function handleLike() { emit('toggle-like', props.post.id) }

function sendComment() {
  if (!commentText.value.trim()) return
  emit('add-comment', props.post.id, commentText.value.trim())
  commentText.value = ''
}

function handleEditPost() {
  showMenu.value = false
  emit('edit-post', props.post.id)
}

function handleDeletePost() {
  showMenu.value = false
  if (confirm('确定要删除这条动态吗？')) {
    emit('delete-post', props.post.id)
  }
}

function handleDeleteComment(commentId) {
  if (confirm('确定要删除这条评论吗？')) {
    emit('delete-comment', props.post.id, commentId)
  }
}

function aiReplyCount(comment) {
  if (!comment.replies) return 0
  return comment.replies.filter(function(r) { return r.isAi }).length
}

function openReplyInput(commentId) {
  if (activeReplyId.value === commentId) {
    activeReplyId.value = null
  } else {
    activeReplyId.value = commentId
    replyText.value = ''
  }
}

function sendReply(comment) {
  if (!replyText.value.trim()) return
  emit('reply-to-ai', {
    postId: props.post.id,
    commentId: comment.id,
    content: replyText.value.trim(),
    aiCharacter: comment.aiCharacter || comment.author
  })
  replyText.value = ''
  activeReplyId.value = null
}

function closeMenu() { showMenu.value = false }

onMounted(() => { document.addEventListener('click', closeMenu) })
onUnmounted(() => { document.removeEventListener('click', closeMenu) })
</script>

<style scoped>
.post-card {
  background-color: #fff; border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05); padding: 16px; position: relative;
}
.post-header { display: flex; align-items: center; margin-bottom: 10px; }
.post-avatar { flex-shrink: 0; margin-right: 10px; }
.avatar-img { width: 42px; height: 42px; border-radius: 8px; object-fit: cover; display: block; }
.avatar-default {
  width: 42px; height: 42px; border-radius: 8px;
  background-color: #07C160; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 600;
}
.avatar-sage {
  width: 42px; height: 42px; border-radius: 50%;
  background: #F6EBD2; color: #8A6A2F;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700;
}
.sage-author-name {
  color: #8A6A2F; font-weight: 600;
}
.post-header-info { display: flex; flex-direction: column; flex: 1; }
.post-name { font-size: 15px; font-weight: 600; color: #576b95; line-height: 1.3; }
.post-time { font-size: 12px; color: #888; margin-top: 2px; cursor: pointer; }
.post-time:hover { color: #576B95; }
.post-more-wrap { position: relative; margin-left: 8px; }
.more-btn {
  background: none; border: none; font-size: 18px; color: #888;
  cursor: pointer; padding: 4px 8px; border-radius: 6px; line-height: 1;
}
.more-btn:hover { background-color: #f0f0f0; color: #555; }
.more-menu {
  position: absolute; right: 0; top: 100%; z-index: 10;
  background-color: #fff; border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15); overflow: hidden; min-width: 100px;
}
.menu-item {
  display: block; width: 100%; padding: 10px 16px;
  background: none; border: none; font-size: 14px;
  color: #222; cursor: pointer; text-align: left;
}
.menu-item:hover { background-color: #f5f5f5; }
.edit-item { color: #576b95; }
.edit-item:hover { background-color: #f0f3fa; }
.delete-item { color: #e74c3c; }
.delete-item:hover { background-color: #fef0ef; }
.edited-badge { font-size: 12px; color: #999; }
.post-body { margin-bottom: 10px; }
.post-content {
  font-size: 15px; line-height: 1.6; color: #222;
  word-break: break-word; white-space: pre-wrap; margin-bottom: 8px;
}
.post-location {
  display: inline-flex; align-items: center; gap: 4px;
  margin-top: 6px; font-size: 13px; color: #576B95;
  max-width: 100%; cursor: default;
}
.post-location-icon { flex-shrink: 0; }
.post-location-text {
  overflow: hidden; white-space: nowrap;
  text-overflow: ellipsis;
}
.post-footer {
  display: flex; justify-content: flex-end; gap: 20px;
  padding-top: 8px; border-top: 1px solid #EAEAEA;
}
.action-btn {
  background: none; border: none; font-size: 13px;
  color: #888; cursor: pointer; padding: 4px 0; transition: color 0.2s;
}
.action-btn:active { color: #576b95; }
.action-btn.liked { color: #07C160; }

.interaction-area {
  background-color: #F3F3F3; border-radius: 8px;
  margin-top: 10px; overflow: hidden;
}
.comment-section { padding: 8px 10px; }
.comment-divider {
  height: 1px; background-color: #EAEAEA; margin: 0 -10px 8px;
}
.comment-item {
  font-size: 14px; line-height: 1.7; color: #222;
  padding: 3px 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
}
.comment-item.ai-comment {
  background-color: #FBF6EC; border: 1px solid #C9A96E;
  border-radius: 6px; padding: 8px 10px; margin: 6px 0;
}
.comment-content { flex: 1; min-width: 0; }
.ai-badge {
  display: inline-block; font-size: 11px; color: #C9A96E;
  border: 1px solid #C9A96E; border-radius: 4px;
  padding: 1px 6px; margin-right: 6px; font-weight: 500;
}
.comment-user { color: #576b95; font-weight: 500; }
.comment-user.ai-name { color: #C9A96E; }
.comment-del-btn {
  background: none; border: none; font-size: 12px;
  color: #bbb; cursor: pointer; padding: 0 4px; flex-shrink: 0;
  transition: color 0.2s;
}
.comment-del-btn:hover { color: #e74c3c; }

.replies-area {
  margin: 2px 0 4px 16px;
  padding-left: 10px;
  border-left: 2px solid #E8DCC8;
}
.reply-item {
  font-size: 13px; line-height: 1.7; color: #222; padding: 2px 0;
}
.reply-item.ai-reply {
  color: #6B5B3E;
}
.reply-user { color: #576b95; font-weight: 500; }
.reply-user.ai-name { color: #C9A96E; }
.reply-to { color: #999; font-size: 12px; }

.ai-reply-action {
  margin: 4px 0 2px 16px; padding-left: 10px;
}
.reply-ai-btn {
  background: none; border: none; font-size: 12px;
  color: #C9A96E; cursor: pointer; padding: 2px 6px;
  border-radius: 4px; transition: background-color 0.2s;
}
.reply-ai-btn:hover { background-color: #FBF6EC; }
.reply-limit { font-size: 12px; color: #bbb; }

.reply-input-row {
  display: flex; gap: 6px; margin: 4px 0 6px 16px; padding-left: 10px;
}
.reply-input {
  flex: 1; border: 1px solid #EAEAEA; border-radius: 6px;
  padding: 6px 10px; font-size: 13px; outline: none;
  background-color: #fff; transition: border-color 0.2s;
}
.reply-input:focus { border-color: #C9A96E; }
.reply-send {
  background-color: #C9A96E; color: #fff; border: none;
  border-radius: 6px; padding: 6px 14px; font-size: 13px;
  cursor: pointer; flex-shrink: 0; transition: background-color 0.2s;
}
.reply-send:disabled { background-color: #ddd; cursor: not-allowed; }
.reply-send:not(:disabled):hover { background-color: #b8944f; }

.comment-input-row { display: flex; gap: 8px; margin-top: 8px; }
.comment-input {
  flex: 1; border: 1px solid #EAEAEA; border-radius: 6px;
  padding: 7px 12px; font-size: 13px; outline: none;
  background-color: #fff; transition: border-color 0.2s;
}
.comment-input:focus { border-color: #07C160; }
.comment-send {
  background-color: #07C160; color: #fff; border: none;
  border-radius: 6px; padding: 7px 16px; font-size: 13px;
  cursor: pointer; flex-shrink: 0; transition: background-color 0.2s;
}
.comment-send:disabled { background-color: #a0e8b8; cursor: not-allowed; }
.comment-send:not(:disabled):hover { background-color: #06ad56; }
.philosopher-link {
  cursor: pointer;
  transition: opacity 0.2s;
}
.philosopher-link:hover {
  text-decoration: underline;
  opacity: 0.8;
}

@media (max-width: 600px) {
  .post-card { padding: 14px 12px; }
  .post-content { font-size: 14px; }
  .comment-input-row { position: sticky; bottom: 0; background: #F3F3F3; padding: 6px 0; z-index: 1; }
  .reply-input-row { position: sticky; bottom: 0; background: #F3F3F3; padding: 4px 0; z-index: 1; }
  .comment-input { font-size: 14px; }
  .reply-input { font-size: 14px; }
  .interaction-area { border-radius: 6px; }
}
</style>