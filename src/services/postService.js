﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿const STORAGE_KEY = 'xianxianquan_posts'

export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return []
  var seen = {}
  var result = []
  for (var i = 0; i < tags.length; i++) {
    var t = String(tags[i] || '')
    if (t.charAt(0) === '#') t = t.substring(1)
    t = t.trim()
    if (!t) continue
    if (t.length > 10) t = t.substring(0, 10)
    if (seen[t]) continue
    seen[t] = true
    result.push(t)
    if (result.length >= 5) break
  }
  return result
}

const PROFILE_KEY = 'xianxianquan_profile'

function getCurrentNickname() {
  try {
    const data = localStorage.getItem(PROFILE_KEY)
    if (data) { const p = JSON.parse(data); return p.nickname || '我' }
  } catch {}
  return '我'
}

function getCurrentAvatar() {
  try {
    const data = localStorage.getItem(PROFILE_KEY)
    if (data) { const p = JSON.parse(data); return p.avatar || '' }
  } catch {}
  return ''
}

function repairPost(post) {
  if (!post.images) post.images = []
  if (post.liked === undefined) post.liked = false
  if (post.likeCount === undefined) post.likeCount = 0
  if (!post.likedBy) post.likedBy = []
  if (!post.comments) post.comments = []
  if (post.music && !post.music.title) post.music = null
  if (post.music === undefined) post.music = null
  if (post.location === undefined) post.location = ''
  if (typeof post.location !== 'string') post.location = ''
  if (!post.tags) post.tags = []
  if (!Array.isArray(post.tags)) post.tags = []
  post.tags = normalizeTags(post.tags)
  if (!post.tags) post.tags = []
  if (!Array.isArray(post.tags)) post.tags = []
  post.tags = normalizeTags(post.tags)
  if (!post.tags) post.tags = []
  if (!Array.isArray(post.tags)) post.tags = []
  post.tags = normalizeTags(post.tags)
  if (!post.tags) post.tags = []
  if (!Array.isArray(post.tags)) post.tags = []
  post.tags = normalizeTags(post.tags)
  if (!post.tags) post.tags = []
  if (!Array.isArray(post.tags)) post.tags = []
  post.tags = normalizeTags(post.tags)
  if (!post.tags) post.tags = []
  if (!Array.isArray(post.tags)) post.tags = []
  post.tags = normalizeTags(post.tags)
  if (!post.tags) post.tags = []
  if (!Array.isArray(post.tags)) post.tags = []
  post.tags = normalizeTags(post.tags)
  if (post.liked && post.likedBy.length === 0) {
    post.likedBy.push({ id: 'user', name: getCurrentNickname(), avatar: getCurrentAvatar(), type: 'user' })
  }
  if (post.likeCount !== post.likedBy.length) post.likeCount = post.likedBy.length
  if (post.likedBy.length > 0 && !post.liked) post.liked = true
  post.comments.forEach(function(c) {
    if (!c.author && c.userName) c.author = c.userName
    if (!c.author) c.author = '我'
    if (c.isAi === undefined) c.isAi = false
    if (!c.aiCharacter) c.aiCharacter = ''
    if (c.loading === undefined) c.loading = false
    if (!c.replies) c.replies = []
    c.replies.forEach(function(r) {
      if (!r.author) r.author = '我'
      if (r.isAi === undefined) r.isAi = false
      if (!r.aiCharacter) r.aiCharacter = ''
      if (r.loading === undefined) r.loading = false
      if (!r.replyTo) r.replyTo = ''
    })
  })
  return post
}

export function getPosts() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data).map(repairPost)
  } catch { return [] }
}

export function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

export function createPost({ content, images, music, location, tags }) {
  var loc = (typeof location === 'string') ? location.trim() : ''
  if (loc.length > 40) loc = loc.substring(0, 40)
  const posts = getPosts()
  const post = {
    id: Date.now(), content: content || '', images: images || [],
    music: music || null, location: loc, tags: normalizeTags(tags),
    createdAt: Date.now(), liked: false, likeCount: 0,
    likedBy: [], comments: []
  }
  posts.push(post)
  savePosts(posts)
  return post
}

export function updatePost(id, patch) {
  const posts = getPosts()
  const index = posts.findIndex(p => p.id === id)
  if (index === -1) return null
  posts[index] = { ...posts[index], ...patch }
  savePosts(posts)
  return posts[index]
}

export function deletePost(id) {
  const posts = getPosts()
  savePosts(posts.filter(p => p.id !== id))
}

export function addComment(postId, content) {
  const posts = getPosts()
  const post = posts.find(p => p.id === postId)
  if (!post) return null
  if (!post.comments) post.comments = []
  const comment = {
    id: Date.now(), author: getCurrentNickname(),
    content, createdAt: Date.now(),
    isAi: false, aiCharacter: '', loading: false, replies: []
  }
  post.comments.push(comment)
  savePosts(posts)
  return comment
}

export function addAiPlaceholder(postId, philosopherName) {
  const posts = getPosts()
  const post = posts.find(p => p.id === postId)
  if (!post) return null
  if (!post.comments) post.comments = []
  const placeholder = {
    id: 'ai_' + Date.now(), author: philosopherName,
    content: '先贤思考中...', createdAt: Date.now(),
    isAi: true, aiCharacter: philosopherName, loading: true, replies: []
  }
  post.comments.push(placeholder)
  savePosts(posts)
  return placeholder
}

export function updateAiComment(postId, commentId, content, loading) {
  const posts = getPosts()
  const post = posts.find(p => p.id === postId)
  if (!post || !post.comments) return null
  const comment = post.comments.find(c => c.id === commentId)
  if (!comment) return null
  comment.content = content
  comment.loading = loading
  savePosts(posts)
  return comment
}

export function addCommentReply(postId, commentId, reply) {
  const posts = getPosts()
  const post = posts.find(p => p.id === postId)
  if (!post || !post.comments) return null
  const comment = post.comments.find(c => c.id === commentId)
  if (!comment) return null
  if (!comment.replies) comment.replies = []
  comment.replies.push(reply)
  savePosts(posts)
  return reply
}

export function updateCommentReply(postId, commentId, replyId, patch) {
  const posts = getPosts()
  const post = posts.find(p => p.id === postId)
  if (!post || !post.comments) return null
  const comment = post.comments.find(c => c.id === commentId)
  if (!comment || !comment.replies) return null
  const reply = comment.replies.find(r => r.id === replyId)
  if (!reply) return null
  Object.assign(reply, patch)
  savePosts(posts)
  return reply
}

export function deleteComment(postId, commentId) {
  const posts = getPosts()
  const post = posts.find(p => p.id === postId)
  if (!post || !post.comments) return null
  post.comments = post.comments.filter(c => c.id !== commentId)
  savePosts(posts)
  return post
}

export function toggleLike(postId) {
  const posts = getPosts()
  const post = posts.find(p => p.id === postId)
  if (!post) return null
  if (!post.likedBy) post.likedBy = []
  const userIndex = post.likedBy.findIndex(function(u) { return u.id === 'user' })
  if (userIndex === -1) {
    post.likedBy.push({ id: 'user', name: getCurrentNickname(), avatar: getCurrentAvatar(), type: 'user' })
    post.liked = true
  } else {
    post.likedBy.splice(userIndex, 1)
    post.liked = false
  }
  post.likeCount = post.likedBy.length
  savePosts(posts)
  return post
}

export function updatePostContent(postId, patch) {
  const posts = getPosts()
  const index = posts.findIndex(p => p.id === postId)
  if (index === -1) return null
  const post = posts[index]
  if (patch.content !== undefined) {
    post.content = patch.content
  }
  if (patch.images !== undefined) {
    post.images = Array.isArray(patch.images) ? patch.images.slice(0, 9) : []
  }
  if (patch.music !== undefined) {
    if (patch.music && typeof patch.music === 'object' && patch.music.title && patch.music.title.trim()) {
      post.music = {
        title: patch.music.title.trim(),
        artist: (patch.music.artist || '').trim(),
        url: (patch.music.url || '').trim(),
        cover: patch.music.cover || ''
      }
    } else {
      post.music = null
    }
  }
  if (patch.location !== undefined) {
    var loc = (typeof patch.location === 'string') ? patch.location.trim() : ''
    if (loc.length > 40) loc = loc.substring(0, 40)
    post.location = loc
  }
  if (patch.tags !== undefined) {
    post.tags = normalizeTags(patch.tags)
  }
  post.updatedAt = Date.now()
  savePosts(posts)
  return post
}