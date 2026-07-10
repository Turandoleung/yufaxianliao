export function normalizeSearchText(value) {
  return String(value || '').toLowerCase().trim()
}

export function getPostSearchText(post) {
  var parts = []

  if (post.content) parts.push(post.content)
  if (post.location) parts.push(post.location)
  if (post.authorName) parts.push(post.authorName)
  if (post.authorId) parts.push(post.authorId)

  if (Array.isArray(post.tags)) {
    for (var i = 0; i < post.tags.length; i++) {
      if (post.tags[i]) parts.push(post.tags[i])
    }
  }

  if (post.music && typeof post.music === 'object') {
    if (post.music.title) parts.push(post.music.title)
    if (post.music.artist) parts.push(post.music.artist)
    if (post.music.url) parts.push(post.music.url)
  }

  if (Array.isArray(post.likedBy)) {
    for (var i = 0; i < post.likedBy.length; i++) {
      var item = post.likedBy[i]
      if (item.name) parts.push(item.name)
      if (item.id) parts.push(item.id)
    }
  }

  if (Array.isArray(post.comments)) {
    for (var i = 0; i < post.comments.length; i++) {
      var c = post.comments[i]
      if (c.content) parts.push(c.content)
      if (c.author) parts.push(c.author)
      if (c.aiCharacter) parts.push(c.aiCharacter)

      if (Array.isArray(c.replies)) {
        for (var j = 0; j < c.replies.length; j++) {
          var r = c.replies[j]
          if (r.content) parts.push(r.content)
          if (r.author) parts.push(r.author)
          if (r.aiCharacter) parts.push(r.aiCharacter)
        }
      }
    }
  }

  return parts.filter(Boolean).join(' ').toLowerCase()
}

export function postMatchesSearch(post, keyword) {
  var q = normalizeSearchText(keyword)
  if (!q) return true
  return getPostSearchText(post).includes(q)
}