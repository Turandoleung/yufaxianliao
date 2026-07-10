﻿﻿﻿﻿import { philosophers } from '../data/philosophers.js'
import { getPosts } from './postService.js'
import {
  getSettings, saveSettings,
  isDailySageEnabled, getDailySageMode,
  getDailySagePool, markPoolItemUsed
} from './settingsService.js'
import {
  getAvailableImportedQuotes, markImportedQuoteUsed
} from './dailyQuoteImportService.js'

function getTodayKey() {
  var d = new Date()
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')
}

function hasDailySageToday(posts) {
  if (!posts || !posts.length) return false
  var todayKey = getTodayKey()
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].isDailySage && posts[i].dailyDate === todayKey) return true
  }
  return false
}

function generateImportedPost() {
  var available = getAvailableImportedQuotes()
  if (!available.length) return null
  var qi = Math.floor(Math.random() * available.length)
  var q = available[qi]
  markImportedQuoteUsed(q.id)
  var explanation = q.explanation || ''
  var inspiration = q.inspiration || '愿你在今日的判断中，保有清醒与节制。'
  var content = q.philosopherName + '今日留下这样一句话：' + '\n\n'
    + '"' + q.quote + '"\n'
    + explanation + '\n'
    + inspiration
  return {
    content: content,
    authorId: q.philosopherId,
    authorName: q.philosopherName,
    mode: 'local',
    dailySource: 'imported',
    dailySourceId: q.id,
    tags: q.tags || []
  }
}

function generateBuiltinPost() {
  var idx = Math.floor(Math.random() * philosophers.length)
  var sage = philosophers[idx]
  var quotes = sage.quotes || []
  if (!quotes.length) return null
  var qi = Math.floor(Math.random() * quotes.length)
  var quoteText = quotes[qi]
  var content = sage.name + '今日留下这样一句话：' + '\n'
    + '"' + quoteText + '"'
  var sageTags = []
  if (Array.isArray(sage.tags) && sage.tags.length) {
    sageTags = sage.tags.slice(0, 2)
  }
  return {
    content: content,
    authorId: sage.id,
    authorName: sage.name,
    mode: 'local',
    dailySource: 'builtin',
    tags: sageTags
  }
}

function generateLocalPost() {
  var imported = generateImportedPost()
  if (imported) return imported
  return generateBuiltinPost()
}

function generatePoolPost() {
  var pool = getDailySagePool()
  for (var i = 0; i < pool.length; i++) {
    if (!pool[i].used && pool[i].content) {
      markPoolItemUsed(pool[i].id)
      var authorId = pool[i].philosopherId || 'unknown'
      var authorName = pool[i].philosopherName
      if (!authorName && authorId && authorId !== 'unknown') {
        var found = philosophers.find(function(p) { return p.id === authorId })
        if (found) authorName = found.name
      }
      if (!authorName) authorName = '今日先贤'
      return {
        content: pool[i].content,
        authorId: authorId,
        authorName: authorName,
        mode: 'pool',
        dailySource: 'pool',
        dailySourceId: pool[i].id
      }
    }
  }
  return null
}

function savePostToStorage(postData) {
  var todayKey = getTodayKey()
  postData.id = 'daily-sage-' + todayKey
  postData.isDailySage = true
  postData.authorType = 'sage'
  postData.dailyDate = todayKey
  postData.createdAt = Date.now()
  postData.images = []
  postData.music = null
  postData.liked = false
  postData.likeCount = 0
  postData.likedBy = []
  postData.comments = []
  postData.tags = result.tags || []

  var allPosts = getPosts()
  var exists = allPosts.find(function(p) { return p.id === postData.id })
  if (!exists) {
    allPosts.push(postData)
    localStorage.setItem('xianxianquan_posts', JSON.stringify(allPosts))
  }
  return postData
}

export function generateDailySagePostIfNeeded() {
  if (!isDailySageEnabled()) return null

  var settings = getSettings()
  var lastDate = settings.dailySageLastDate || ''
  var todayKey = getTodayKey()

  if (lastDate === todayKey) return null

  var posts = getPosts()
  if (hasDailySageToday(posts)) {
    settings.dailySageLastDate = todayKey
    saveSettings(settings)
    return null
  }

  var result = null
  var mode = getDailySageMode()

  if (mode === 'pool') {
    result = generatePoolPost()
    if (!result) result = generateLocalPost()
  } else if (mode === 'realtime') {
    result = generateLocalPost()
  } else {
    result = generateLocalPost()
  }

  if (!result) return null

  var postData = {
    id: 'daily-sage-' + todayKey,
    type: 'daily_sage',
    content: result.content,
    images: [],
    music: null,
    authorType: 'sage',
    authorId: result.authorId,
    authorName: result.authorName,
    createdAt: Date.now(),
    isDailySage: true,
    dailyDate: todayKey,
    dailyMode: result.mode || 'local',
    dailySource: result.dailySource || 'builtin',
    dailySourceId: result.dailySourceId || '',
    tags: result.tags || [],
    liked: false,
    likeCount: 0,
    likedBy: [],
    comments: []
  }

  var allPosts = getPosts()
  var exists = allPosts.find(function(p) { return p.id === postData.id })
  if (!exists) {
    allPosts.push(postData)
    localStorage.setItem('xianxianquan_posts', JSON.stringify(allPosts))
  }

  settings.dailySageLastDate = todayKey
  saveSettings(settings)

  return postData
}