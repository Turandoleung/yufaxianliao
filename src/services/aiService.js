﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import { philosophers } from '../data/philosophers.js'

export function getRandomPhilosopher() {
  var index = Math.floor(Math.random() * philosophers.length)
  return philosophers[index]
}

export function getPhilosopherByName(name) {
  return philosophers.find(function(p) { return p.name === name })
}

export function getRandomAiLikeCount() {
  var r = Math.random()
  if (r < 0.4) return 0
  if (r < 0.75) return 1
  if (r < 0.95) return 2
  return 3
}

export function getRandomAiLikers() {
  var count = getRandomAiLikeCount()
  if (count === 0) return []
  var shuffled = philosophers.slice().sort(function() { return Math.random() - 0.5 })
  var selected = shuffled.slice(0, count)
  return selected.map(function(p) {
    return { id: p.id, name: p.name, avatar: '', type: 'ai' }
  })
}

export var COMMENT_TONE_MAP = {
  gentle: {
    label: '温和',
    prompt: '请使用温和、耐心、克制的语气。即使指出问题，也要像长者劝导，不要尖锐讽刺。'
  },
  serious: {
    label: '严肃',
    prompt: '请使用严肃、庄重的语气，强调原则、责任、秩序和判断，不要过度玩笑化。'
  },
  sharp: {
    label: '犀利',
    prompt: '请使用更直接、有锋芒的语气，可以指出矛盾和问题，但不要攻击用户，不要刻薄羞辱。'
  },
  poetic: {
    label: '诗意',
    prompt: '请使用更有文采、比喻感和哲思感的表达，但不要堆砌辞藻，不要过度抒情。'
  },
  jurisprudential: {
    label: '法理化',
    prompt: '请更突出法理分析，围绕权利、义务、正义、秩序、制度、责任、自由与边界来评论，但仍要像朋友圈短评，不要写成论文。'
  }
}

export function getTonePrompt(commentTone) {
  var tone = COMMENT_TONE_MAP[commentTone]
  if (!tone) tone = COMMENT_TONE_MAP.gentle
  return tone
}

export var COMMENT_LENGTH_MAP = {
  short: {
    label: '简短',
    maxChars: 50,
    maxTokens: 90,
    prompt: '请将评论控制在 50 个汉字以内，表达要凝练。'
  },
  standard: {
    label: '标准',
    maxChars: 80,
    maxTokens: 130,
    prompt: '请将评论控制在 80 个汉字以内，表达清楚但不要展开太多。'
  },
  deep: {
    label: '深度',
    maxChars: 150,
    maxTokens: 240,
    prompt: '请将评论控制在 150 个汉字以内，可以有更充分的法理或哲学分析，但不要写成论文。'
  }
}

export function getLengthConfig(commentLength) {
  var config = COMMENT_LENGTH_MAP[commentLength]
  if (!config) config = COMMENT_LENGTH_MAP.standard
  return config
}

export function buildPrompt({ content, philosopher, commentTone, commentLength, location, tags }) {
  var text = content || '（图文动态）'
  var toneInfo = getTonePrompt(commentTone || 'gentle')
  var lengthInfo = getLengthConfig(commentLength || 'standard')
  var result = '有人发了一条朋友圈："' + text + '"\n'
  if (location && location.trim()) {
    result += '用户发布地点：' + location.trim() + '\n'
  }
  if (tags && Array.isArray(tags) && tags.length) {
    result += '用户给这条动态添加了标签：' + tags.map(function(t) { return '#' + t }).join(' ') + '\n'
  }
  result += '\n'
  result += '请以' + philosopher.name + '的身份，用你的风格对此评论。\n\n'
  result += '用户当前选择的点评风格是：【' + toneInfo.label + '】\n'
  result += '风格要求：' + toneInfo.prompt + '\n\n'
  result += '评论长度要求：【' + lengthInfo.label + '】\n'
  result += lengthInfo.prompt + '\n\n'
  result += '注意：语气风格是对你原本风格的补充，不是替代。仍然必须保留你本人的思想和口吻。不要输出Markdown，不要输出标题，只输出评论正文。\n\n'
  result += philosopher.systemPrompt
  return result
}

export function buildReplyPrompt({ postContent, originalAiComment, userReply, previousReplies, philosopher, commentTone, commentLength }) {
  var text = postContent || '（图文动态）'
  var toneInfo = getTonePrompt(commentTone || 'gentle')
  var lengthInfo = getLengthConfig(commentLength || 'standard')
  var prompt = '你正在扮演【' + philosopher.name + '】。\n'
  prompt += philosopher.style + '\n\n'
  prompt += '用户发了一条朋友圈：\n「' + text + '」\n\n'
  prompt += '你之前评论：\n「' + originalAiComment + '」\n\n'
  if (previousReplies && previousReplies.length > 0) {
    var recent = previousReplies.slice(-3)
    prompt += '之前的对话：\n'
    recent.forEach(function(r) {
      prompt += r.author + '：' + r.content + '\n'
    })
    prompt += '\n'
  }
  prompt += '用户现在回复你：\n「' + userReply + '」\n\n'
  prompt += '请你继续以【' + philosopher.name + '】的口吻回复用户一句。\n\n'
  prompt += '当前点评风格：【' + toneInfo.label + '】\n'
  prompt += '风格要求：' + toneInfo.prompt + '\n\n'
  prompt += '回复长度要求：【' + lengthInfo.label + '】\n'
  prompt += lengthInfo.prompt + '\n\n'
  prompt += '注意：语气风格是对你原本风格的补充，不是替代。仍然保留你本人的思想和口吻。\n'
  prompt += '要求：像朋友圈评论区里的简短回复，' + lengthInfo.maxChars + '字以内，不要写成论文，不要使用Markdown，不要解释你是谁，只输出回复正文。'
  return prompt
}

export function sanitizeAiComment(text, maxChars) {
  if (!text) return ''
  var limit = maxChars || 80
  var result = text.trim()
  result = result.replace(/`[\s\S]*?`/g, '')
  result = result.replace(/`[^]*`/g, '')
  result = result.replace(/[^]+/g, '')
  result = result.replace(/\*\*([^*]+)\*\*/g, '')
  result = result.replace(/\*([^*]+)\*/g, '')
  result = result.replace(/#{1,6}\s/g, '')
  result = result.replace(/^[\s\u201c\u201d\u2018\u2019\"']+|[\s\u201c\u201d\u2018\u2019\"']+$/g, '')
  result = result.trim()
  if (result.length > limit) {
    result = result.substring(0, limit - 3) + '...'
  }
  return result
}

export async function generateAiComment({ content, philosopher, apiKey, commentTone, commentLength, location }) {
  var prompt = buildPrompt({ content, philosopher, commentTone, commentLength, location })
  var lengthConfig = getLengthConfig(commentLength || 'standard')

  var response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: philosopher.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: lengthConfig.maxTokens
    })
  })

  if (!response.ok) {
    var errBody = ''
    try { errBody = await response.text() } catch (e) {}
    console.error('[AI] API error:', response.status, errBody)
    throw new Error('API request failed: ' + response.status)
  }

  var data = await response.json()
  var raw = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
  if (!raw || !raw.trim()) {
    console.error('[AI] Empty response from API')
    throw new Error('Empty response')
  }

  var cleaned = sanitizeAiComment(raw, lengthConfig.maxChars)
  if (!cleaned) {
    console.warn('[AI] sanitize cleared content, using raw text')
    cleaned = raw.trim().substring(0, lengthConfig.maxChars)
  }
  return cleaned
}

export async function generateAiReply({ postContent, originalAiComment, userReply, previousReplies, philosopher, apiKey, commentTone, commentLength }) {
  var prompt = buildReplyPrompt({ postContent, originalAiComment, userReply, previousReplies, philosopher, commentTone, commentLength })
  var lengthConfig = getLengthConfig(commentLength || 'standard')

  var response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: philosopher.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: lengthConfig.maxTokens
    })
  })

  if (!response.ok) {
    var errBody = ''
    try { errBody = await response.text() } catch (e) {}
    console.error('[AI] Reply API error:', response.status, errBody)
    throw new Error('API request failed: ' + response.status)
  }

  var data = await response.json()
  var raw = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
  if (!raw || !raw.trim()) {
    console.error('[AI] Empty reply from API')
    throw new Error('Empty response')
  }

  var cleaned = sanitizeAiComment(raw, lengthConfig.maxChars)
  if (!cleaned) {
    console.warn('[AI] sanitize cleared reply, using raw text')
    cleaned = raw.trim().substring(0, lengthConfig.maxChars)
  }
  return cleaned
}

export async function generateDailySagePoolItems({ philosophers, count, apiKey }) {
  var listText = philosophers.map(function(p) {
    return '{ id: "' + p.id + '", name: "' + p.name + '" }'
  }).join('\n')

  var prompt = '你要为"与法贤聊"生成 ' + count + ' 条每日先贤朋友圈动态素材。\n\n'
  prompt += '每条动态随机选择一位先贤，解释一句法谚或格言，给用户启发。\n\n'
  prompt += '可用先贤列表：\n' + listText + '\n\n'
  prompt += '要求：\n'
  prompt += '1. 输出必须是 JSON 数组，长度为 ' + count + '。\n'
  prompt += '2. 每项包含：philosopherId（必须用上面列表中的id）, philosopherName, quote, content（100-180字朋友圈风格）, tags。\n'
  prompt += '3. content 像朋友圈动态，不要像论文。\n'
  prompt += '4. quote 自然出现在 content 里。\n'
  prompt += '5. 不要 Markdown，不要代码块，不要解释。\n'
  prompt += '6. 只输出纯 JSON 数组。'

  var response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.85,
      max_tokens: 3000
    })
  })

  if (!response.ok) throw new Error('API request failed: ' + response.status)

  var data = await response.json()
  var raw = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
  if (!raw || !raw.trim()) throw new Error('Empty response')

  var cleaned = raw.trim()
  cleaned = cleaned.replace(/^`json\s*/i, '')
  cleaned = cleaned.replace(/`\s*$/, '')
  cleaned = cleaned.replace(/^`\s*/i, '')
  cleaned = cleaned.replace(/`\s*$/, '')

  var parsed
  try { parsed = JSON.parse(cleaned) } catch (e) { throw new Error('JSON parse failed') }
  if (!Array.isArray(parsed)) throw new Error('Not an array')

  var validIds = {}
  philosophers.forEach(function(p) { validIds[p.id] = p.name })

  var results = []
  for (var i = 0; i < parsed.length; i++) {
    var item = parsed[i]
    if (!item.philosopherId || !item.philosopherName || !item.content) continue
    if (!validIds[item.philosopherId]) continue
    results.push({
      id: 'pool_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 5),
      philosopherId: item.philosopherId,
      philosopherName: validIds[item.philosopherId] || item.philosopherName,
      quote: item.quote || '',
      content: item.content.substring(0, 300),
      tags: item.tags || [],
      createdAt: Date.now(),
      used: false
    })
  }

  if (results.length === 0) throw new Error('No valid items generated')
  return results
}