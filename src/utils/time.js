﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿export function formatTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return minutes + '分钟前'
  if (hours < 24) return hours + '小时前'
  if (days < 30) return days + '天前'

  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}

export function formatFullTime(timestamp) {
  if (timestamp === null || timestamp === undefined) return ''
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return y + '-' + mo + '-' + d + ' ' + h + ':' + mi
}

export function formatDateKey(date) {
  if (!date) return ''
  var d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  var y = d.getFullYear()
  var m = String(d.getMonth() + 1).padStart(2, '0')
  var day = String(d.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + day
}

export function isToday(date) {
  if (!date) return false
  var d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return false
  var now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export function getMonthCalendarDays(year, month) {
  var firstDay = new Date(year, month, 1)
  var startDow = firstDay.getDay()
  var offset = startDow === 0 ? 6 : startDow - 1
  var startDate = new Date(year, month, 1 - offset)
  var days = []
  for (var i = 0; i < 42; i++) {
    var d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
    days.push({
      date: d,
      dateKey: formatDateKey(d),
      day: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
      isToday: isToday(d)
    })
  }
  return days
}

export function getPostCountByDate(posts) {
  var counts = {}
  if (!Array.isArray(posts)) return counts
  for (var i = 0; i < posts.length; i++) {
    var p = posts[i]
    if (!p || !p.createdAt) continue
    var key = formatDateKey(p.createdAt)
    if (!key) continue
    counts[key] = (counts[key] || 0) + 1
  }
  return counts
}

export function getAvailableYears(posts) {
  var years = {}
  var currentYear = new Date().getFullYear()
  years[currentYear] = true
  if (Array.isArray(posts)) {
    for (var i = 0; i < posts.length; i++) {
      var p = posts[i]
      if (!p || !p.createdAt) continue
      var d = new Date(p.createdAt)
      if (!isNaN(d.getTime())) {
        years[d.getFullYear()] = true
      }
    }
  }
  return Object.keys(years).map(Number).sort(function(a, b) { return b - a })
}