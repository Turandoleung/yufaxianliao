﻿﻿﻿const DRAFT_KEY = 'xianxianquan_post_draft'

function createEmptyDraft() {
  return { content: '', images: [], music: null, location: '', tags: [], updatedAt: 0 }
}

export function normalizeDraft(draft) {
  if (!draft || typeof draft !== 'object') return createEmptyDraft()
  return {
    content: typeof draft.content === 'string' ? draft.content : '',
    images: Array.isArray(draft.images) ? draft.images : [],
    music: draft.music && typeof draft.music === 'object' ? {
      title: typeof draft.music.title === 'string' ? draft.music.title : '',
      artist: typeof draft.music.artist === 'string' ? draft.music.artist : '',
      url: typeof draft.music.url === 'string' ? draft.music.url : '',
      cover: typeof draft.music.cover === 'string' ? draft.music.cover : ''
    } : null,
    location: typeof draft.location === 'string' ? draft.location : '',
    tags: Array.isArray(draft.tags) ? draft.tags : [],
    updatedAt: typeof draft.updatedAt === 'number' ? draft.updatedAt : 0
  }
}

export function getDraft() {
  try {
    var data = localStorage.getItem(DRAFT_KEY)
    if (!data) return createEmptyDraft()
    var parsed = JSON.parse(data)
    return normalizeDraft(parsed)
  } catch (e) {
    try { localStorage.removeItem(DRAFT_KEY) } catch (x) {}
    return createEmptyDraft()
  }
}

export function saveDraft(draft) {
  var d = normalizeDraft(draft)
  d.updatedAt = Date.now()
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d))
    return true
  } catch (e) {
    console.error('[Draft] save failed:', e)
    return false
  }
}

export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY) } catch (e) {}
}

export function isDraftEmpty(draft) {
  var d = draft ? normalizeDraft(draft) : getDraft()
  if (d.content.trim()) return false
  if (d.images && d.images.length) return false
  if (d.music && d.music.title && d.music.title.trim()) return false
  if (d.location && d.location.trim()) return false
  return true
}

export function hasDraft() {
  return !isDraftEmpty(getDraft())
}