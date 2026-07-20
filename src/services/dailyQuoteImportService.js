import { philosophers } from '../data/philosophers.js'
import { safeSetJson, safeGetJson, safeRemoveItem } from './storageService.js'

const IMPORTED_QUOTES_KEY = 'xianxianquan_imported_daily_quotes'

function findPhilosopherByName(name) {
  if (!name) return null
  return philosophers.find(function(p) { return p.name === name }) || null
}

function findPhilosopherById(id) {
  if (!id) return null
  return philosophers.find(function(p) { return p.id === id }) || null
}

export function normalizeImportedQuote(item) {
  if (!item || !item.quote || !String(item.quote).trim()) return null

  var quote = String(item.quote).trim()
  var philosopherId = item.philosopherId || ''
  var philosopherName = item.philosopherName || ''

  if (!philosopherId && philosopherName) {
    var found = findPhilosopherByName(philosopherName)
    if (found) philosopherId = found.id
  }
  if (!philosopherName && philosopherId) {
    var found2 = findPhilosopherById(philosopherId)
    if (found2) philosopherName = found2.name
  }
  if (!philosopherId && !philosopherName) {
    philosopherId = 'unknown'
    philosopherName = '佚名法贤'
  }

  var tags = Array.isArray(item.tags) ? item.tags : []

  return {
    id: 'imported-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8),
    philosopherId: philosopherId,
    philosopherName: philosopherName,
    quote: quote,
    explanation: item.explanation ? String(item.explanation).trim() : '',
    inspiration: item.inspiration ? String(item.inspiration).trim() : '愿你在今日的判断中，保有清醒与节制。',
    tags: tags,
    source: 'imported',
    createdAt: Date.now(),
    used: false
  }
}

export function parseImportedQuotes(jsonText) {
  var data
  try {
    data = JSON.parse(jsonText)
  } catch (e) {
    throw new Error('JSON 格式错误，请检查文件内容')
  }

  var rawItems = []
  if (Array.isArray(data)) {
    rawItems = data
  } else if (data && Array.isArray(data.items)) {
    rawItems = data.items
  } else if (data && Array.isArray(data.quotes)) {
    rawItems = data.quotes
  } else {
    throw new Error('格式错误：需要 JSON 数组，或包含 items/quotes 数组的对象')
  }

  var validItems = []
  for (var i = 0; i < rawItems.length; i++) {
    var normalized = normalizeImportedQuote(rawItems[i])
    if (normalized) validItems.push(normalized)
  }

  if (validItems.length === 0) {
    throw new Error('没有找到有效的法谚数据，每条至少需要 quote 字段')
  }

  return validItems
}

export function dedupeImportedQuotes(existingQuotes, newQuotes) {
  var existingKeys = {}
  for (var i = 0; i < existingQuotes.length; i++) {
    var key = (existingQuotes[i].philosopherId || '') + '|' + existingQuotes[i].quote
    existingKeys[key] = true
  }
  var unique = []
  for (var j = 0; j < newQuotes.length; j++) {
    var nkey = (newQuotes[j].philosopherId || '') + '|' + newQuotes[j].quote
    if (!existingKeys[nkey]) {
      unique.push(newQuotes[j])
      existingKeys[nkey] = true
    }
  }
  return unique
}

export function getImportedQuotes() {
  try {
    var data = safeGetJson(IMPORTED_QUOTES_KEY)
    if (!data) return []
    if (!Array.isArray(data)) return []
    return data
  } catch (e) {
    console.error("[quotes] getImportedQuotes failed", {
      name: e ? e.name : undefined,
      message: e ? e.message : undefined
    })
    return []
  }
}

export function saveImportedQuotes(quotes) {
  safeSetJson(IMPORTED_QUOTES_KEY, quotes)
}

export function mergeImportedQuotes(newQuotes) {
  var existing = getImportedQuotes()
  var uniqueNew = dedupeImportedQuotes(existing, newQuotes)
  var merged = existing.concat(uniqueNew)
  saveImportedQuotes(merged)
  return { imported: uniqueNew.length, total: merged.length }
}

export function markImportedQuoteUsed(quoteId) {
  var quotes = getImportedQuotes()
  for (var i = 0; i < quotes.length; i++) {
    if (quotes[i].id === quoteId) { quotes[i].used = true; break }
  }
  saveImportedQuotes(quotes)
}

export function getImportedQuoteCount() {
  return getImportedQuotes().length
}

export function getAvailableImportedQuotes() {
  return getImportedQuotes().filter(function(q) { return !q.used })
}

export function clearImportedQuotes() {
  safeRemoveItem(IMPORTED_QUOTES_KEY)
}

export function resetImportedQuotesUsage() {
  var quotes = getImportedQuotes()
  for (var i = 0; i < quotes.length; i++) {
    quotes[i].used = false
  }
  saveImportedQuotes(quotes)
}