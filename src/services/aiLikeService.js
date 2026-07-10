export function getAiLikeCountByFrequency(frequency) {
  if (frequency === 'off') return 0
  if (frequency === 'low') {
    var r = Math.random()
    if (r < 0.6) return 0
    return 1
  }
  if (frequency === 'medium') {
    var r2 = Math.random()
    if (r2 < 0.4) return 0
    if (r2 < 0.75) return 1
    if (r2 < 0.95) return 2
    return 3
  }
  if (frequency === 'high') {
    var r3 = Math.random()
    if (r3 < 0.2) return 2
    if (r3 < 0.6) return 3
    if (r3 < 0.9) return 4
    return 5
  }
  return 0
}

export function generateAiLikes({ philosophers, frequency, existingLikedBy }) {
  var count = getAiLikeCountByFrequency(frequency)
  if (count === 0 || !philosophers || !philosophers.length) return []

  var existingIds = {}
  if (existingLikedBy && existingLikedBy.length) {
    for (var i = 0; i < existingLikedBy.length; i++) {
      if (existingLikedBy[i].id) existingIds[existingLikedBy[i].id] = true
    }
  }

  var available = []
  for (var j = 0; j < philosophers.length; j++) {
    if (!existingIds[philosophers[j].id] && philosophers[j].id !== 'user') {
      available.push(philosophers[j])
    }
  }

  if (available.length === 0) return []
  if (count > available.length) count = available.length

  var shuffled = available.slice().sort(function() { return Math.random() - 0.5 })
  var selected = shuffled.slice(0, count)
  return selected.map(function(p) {
    return { id: p.id, name: p.name, avatar: '', type: 'ai' }
  })
}