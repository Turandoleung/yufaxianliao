﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import { safeSetJson, safeGetJson, replaceLargeStorageItem } from './storageService.js'

const STORAGE_KEY = 'xianxianquan_posts'

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
    const data = safeGetJson(PROFILE_KEY)
    if (data) { return data.nickname || '我' }
  } catch (e) { /* ignore */ }
  return '我'
}

function getCurrentAvatar() {
  try {
    const data = safeGetJson(PROFILE_KEY)
    if (data) { return data.avatar || '' }
  } catch (e) { /* ignore */ }
  return ''
}

function normalizeLikedBy(likedBy) {
  if (!Array.isArray(likedBy)) return []
  var map = new Map()
  for (var i = 0; i < likedBy.length; i++) {
    var item = likedBy[i]
    if (!item || !item.id) continue
    var itemId = String(item.id)
    if (map.has(itemId)) continue
    map.set(itemId, {
      id: itemId,
      name: String(item.name || ''),
      avatar: String(item.avatar || ''),
      type: item.type === 'ai' ? 'ai' : 'user'
    })
  }
  return Array.from(map.values())
}

function repairPost(post) {
  if (!post.images || !Array.isArray(post.images)) post.images = []
  if (!post.comments || !Array.isArray(post.comments)) post.comments = []
  if (post.music && !post.music.title) post.music = null
  if (post.music === undefined) post.music = null
  if (post.location === undefined || post.location === null) post.location = ''
  if (typeof post.location !== 'string') post.location = ''
  if (typeof post.content !== 'string') post.content = String(post.content || '')
  if (!post.authorType || typeof post.authorType !== 'string') post.authorType = 'user'
  post.tags = normalizeTags(post.tags)
  var likedBy = normalizeLikedBy(post.likedBy)

  var userInLikedBy = false
  for (var ui = 0; ui < likedBy.length; ui++) {
    if (likedBy[ui].id === 'user') { userInLikedBy = true; break }
  }

  if (post.liked && !userInLikedBy) {
    likedBy.push({ id: 'user', name: getCurrentNickname(), avatar: getCurrentAvatar(), type: 'user' })
    userInLikedBy = true
  }

  post.likedBy = likedBy
  post.liked = userInLikedBy
  post.likeCount = likedBy.length
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
    var data = safeGetJson(STORAGE_KEY, null)
    if (!data) return []
    if (!Array.isArray(data)) {
      console.warn("[posts] stored data is not an array, resetting")
      safeSetJson(STORAGE_KEY, [])
      return []
    }

    var result = []
    for (var i = 0; i < data.length; i++) {
      try {
        result.push(repairPost(data[i]))
      } catch (e) {
        console.error("[posts] repairPost failed on item", i, {
          name: e ? e.name : undefined,
          message: e ? e.message : undefined
        })
      }
    }
    return result
  } catch (e) {
    console.error("[posts] getPosts failed", {
      name: e ? e.name : undefined,
      message: e ? e.message : undefined
    })
    return []
  }
}

export function savePosts(posts) {
  if (!Array.isArray(posts)) {
    throw new Error("savePosts: posts must be an array")
  }

  console.log("[publish] before savePosts")
  console.log("[publish] posts count:", posts.length)

  replaceLargeStorageItem(STORAGE_KEY, posts, "动态保存失败，当前内容已保留，请迁移旧图片或释放空间后重试。")

  console.log("[publish] save completed")
}

export function createPost({ content, images, music, location, tags, id }) {
  console.log("[publish] payload created")
  console.log("[publish] content length:", (content || "").length)

  var loc = (typeof location === 'string') ? location.trim() : ''
  if (loc.length > 40) loc = loc.substring(0, 40)
  const posts = getPosts()

  var safeImages = []
  if (Array.isArray(images)) {
    for (var i = 0; i < images.length && i < 9; i++) {
      if (typeof images[i] === 'string') safeImages.push(images[i])
    }
  }

  var safeMusic = null
  if (music && typeof music === 'object' && music.title && String(music.title).trim()) {
    safeMusic = {
      title: String(music.title).trim(),
      artist: String(music.artist || '').trim(),
      url: String(music.url || '').trim(),
      cover: String(music.cover || '')
    }
  }

  const post = {
    id: id || Date.now(),
    content: String(content || ''),
    images: safeImages,
    music: safeMusic,
    location: loc,
    tags: normalizeTags(tags),
    authorType: 'user',
    createdAt: Date.now(),
    liked: false,
    likeCount: 0,
    likedBy: [],
    comments: []
  }

  console.log("[publish] post created:", post.id)

  posts.push(post)
  savePosts(posts)

  console.log("[publish] reactive state updated")
  return post
}

export function updatePost(id, patch) {
  const posts = getPosts()
  const index = posts.findIndex(p => p.id === id)
  if (index === -1) return null
  posts[index] = { ...posts[index], ...patch }
  try {
    savePosts(posts)
  } catch (error) {
    console.error("[update] save failed", {
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })
  }
  return posts[index]
}

export function deletePost(id) {
  var posts = getPosts()

  console.log("[delete] posts before:", posts.length)

  var updatedPosts = posts.filter(function(p) {
    return String(p.id) !== String(id)
  })

  if (updatedPosts.length === posts.length) {
    console.warn("[delete] post not found:", id)
  }

  console.log("[delete] posts after:", updatedPosts.length)

  try {
    savePosts(updatedPosts)
  } catch (error) {
    console.error("[delete] save failed", {
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })
    throw new Error("删除未完成，本地数据仍保留。请先迁移旧图片数据后再试。")
  }

  console.log("[delete] storage saved")

  return updatedPosts
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
  try {
    savePosts(posts)
  } catch (error) {
    console.error("[comment] save failed", {
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })
    throw new Error("评论保存失败，请迁移旧图片数据后重试。")
  }
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
  try {
    savePosts(posts)
  } catch (e) {
    console.error("[ai-placeholder] save failed", {
      name: e ? e.name : undefined,
      message: e ? e.message : undefined
    })
    throw e
  }
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
  try {
    savePosts(posts)
  } catch (error) {
    console.error("[ai-comment] save failed", {
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })
  }
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
  try {
    savePosts(posts)
  } catch (error) {
    console.error("[reply] save failed", {
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })
  }
  return reply
}

export function deleteComment(postId, commentId) {
  const posts = getPosts()
  const post = posts.find(p => p.id === postId)
  if (!post || !post.comments) return null
  post.comments = post.comments.filter(c => c.id !== commentId)
  try {
    savePosts(posts)
  } catch (error) {
    console.error("[delete-comment] save failed", {
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })
    throw new Error("删除评论失败，请迁移旧图片数据后重试。")
  }
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
  try {
    savePosts(posts)
  } catch (error) {
    console.error("[like] save failed", {
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })
    throw new Error("操作失败，请迁移旧图片数据后重试。")
  }
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
  try {
    savePosts(posts)
  } catch (error) {
    console.error("[edit] save failed", {
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })
    throw new Error("修改未保存，当前编辑内容已保留，请迁移旧图片数据后重试。")
  }
  return post
}