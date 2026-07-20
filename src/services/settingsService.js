﻿import { safeSetJson, safeGetJson } from './storageService.js'

const SETTINGS_KEY = 'xianxianquan_settings'
const POOL_KEY = 'xianxianquan_daily_sage_pool'

const defaultSettings = {
  deepseekApiKey: '',
  enableAiComment: false,
  enableAiLikes: true,
  enableDailySagePost: true,
  dailySageMode: 'local',
  dailySageLastDate: '',
  commentTone: 'gentle',
  commentLength: 'standard',
  aiLikeFrequency: 'medium'
}

export function getSettings() {
  try {
    const data = safeGetJson(SETTINGS_KEY)
    if (data) return { ...defaultSettings, ...data }
    return { ...defaultSettings }
  } catch (e) {
    console.error("[settings] getSettings failed", {
      name: e ? e.name : undefined,
      message: e ? e.message : undefined
    })
    return { ...defaultSettings }
  }
}

export function saveSettings(settings) {
  safeSetJson(SETTINGS_KEY, settings)
}

export function getApiKey() { return getSettings().deepseekApiKey || '' }

export function saveApiKey(key) {
  var s = getSettings(); s.deepseekApiKey = key; saveSettings(s)
}

export function isAiCommentEnabled() { return getSettings().enableAiComment === true }

export function isAiLikesEnabled() { return getSettings().enableAiLikes !== false }

const VALID_FREQUENCIES = ['off', 'low', 'medium', 'high']

export function getAiLikeFrequency() {
  var settings = getSettings()
  var freq = settings.aiLikeFrequency
  if (!freq) {
    if (settings.enableAiLikes === false) return 'off'
    return 'medium'
  }
  if (VALID_FREQUENCIES.indexOf(freq) === -1) return 'medium'
  return freq
}

export function isDailySageEnabled() { return getSettings().enableDailySagePost !== false }

export function getDailySageMode() { return getSettings().dailySageMode || 'local' }

const VALID_TONES = ['gentle', 'serious', 'sharp', 'poetic', 'jurisprudential']
const VALID_LENGTHS = ['short', 'standard', 'deep']

export function getCommentTone() {
  var tone = getSettings().commentTone
  if (!tone || VALID_TONES.indexOf(tone) === -1) return 'gentle'
  return tone
}

export function getCommentLength() {
  var len = getSettings().commentLength
  if (!len || VALID_LENGTHS.indexOf(len) === -1) return 'standard'
  return len
}

export function getDailySagePool() {
  try {
    const data = safeGetJson(POOL_KEY)
    if (!data) return []
    var arr = data
    if (!Array.isArray(arr)) return []
    return arr
  } catch (e) {
    console.error("[settings] getDailySagePool failed", {
      name: e ? e.name : undefined,
      message: e ? e.message : undefined
    })
    return []
  }
}

export function saveDailySagePool(pool) {
  safeSetJson(POOL_KEY, pool)
}

export function addItemsToPool(items) {
  var pool = getDailySagePool()
  items.forEach(function(item) {
    pool.push(item)
  })
  saveDailySagePool(pool)
  return pool
}

export function markPoolItemUsed(itemId) {
  var pool = getDailySagePool()
  for (var i = 0; i < pool.length; i++) {
    if (pool[i].id === itemId) { pool[i].used = true; break }
  }
  saveDailySagePool(pool)
  return pool
}

export function clearUsedPoolItems() {
  var pool = getDailySagePool()
  pool = pool.filter(function(item) { return !item.used })
  saveDailySagePool(pool)
  return pool
}

export function getPoolStats() {
  var pool = getDailySagePool()
  var available = pool.filter(function(i) { return !i.used }).length
  var used = pool.filter(function(i) { return i.used }).length
  return { available: available, used: used, total: pool.length }
}