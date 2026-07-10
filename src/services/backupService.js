var BACKUP_KEYS = {
  profile: 'xianxianquan_profile',
  posts: 'xianxianquan_posts',
  settings: 'xianxianquan_settings',
  draft: 'xianxianquan_post_draft',
  dailySagePool: 'xianxianquan_daily_sage_pool',
  importedDailyQuotes: 'xianxianquan_imported_daily_quotes'
}

function readKey(key) {
  try {
    var raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

function writeKey(key, value) {
  if (value === null || value === undefined) return
  localStorage.setItem(key, JSON.stringify(value))
}

export function exportBackup() {
  var data = {}
  var keys = Object.keys(BACKUP_KEYS)
  for (var i = 0; i < keys.length; i++) {
    var name = keys[i]
    var storageKey = BACKUP_KEYS[name]
    var val = readKey(storageKey)
    if (val !== null) {
      data[name] = val
    }
  }
  if (data.settings && data.settings.deepseekApiKey) {
    delete data.settings.deepseekApiKey
  }
  var backup = {
    appName: '与法贤聊',
    version: 1,
    exportedAt: Date.now(),
    data: data
  }
  return backup
}

export function downloadBackup() {
  var backup = exportBackup()
  var json = JSON.stringify(backup, null, 2)
  var now = new Date()
  var y = now.getFullYear()
  var m = String(now.getMonth() + 1).padStart(2, '0')
  var d = String(now.getDate()).padStart(2, '0')
  var filename = '与法贤聊-backup-' + y + '-' + m + '-' + d + '.json'
  var blob = new Blob([json], { type: 'application/json' })
  var url = URL.createObjectURL(blob)
  var a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function validateBackup(text) {
  if (!text || typeof text !== 'string') return { valid: false, error: '文件内容为空' }
  var parsed
  try {
    parsed = JSON.parse(text)
  } catch (e) {
    return { valid: false, error: '文件不是有效的 JSON 格式' }
  }
  if (!parsed || typeof parsed !== 'object') return { valid: false, error: '文件格式不正确' }
  if (parsed.appName !== '与法贤聊') return { valid: false, error: '不是「与法贤聊」的备份文件' }
  if (!parsed.data || typeof parsed.data !== 'object') return { valid: false, error: '备份文件缺少 data 字段' }
  return { valid: true, data: parsed }
}

export function importBackup(text) {
  var result = validateBackup(text)
  if (!result.valid) return { success: false, error: result.error }
  var backup = result.data
  var data = backup.data || {}
  var keys = Object.keys(BACKUP_KEYS)
  for (var i = 0; i < keys.length; i++) {
    var name = keys[i]
    var storageKey = BACKUP_KEYS[name]
    if (data[name] !== undefined && data[name] !== null) {
      if (name === 'settings' && data.settings) {
        var currentSettings = readKey(storageKey) || {}
        var importedSettings = data.settings
        if (currentSettings.deepseekApiKey && !importedSettings.deepseekApiKey) {
          importedSettings.deepseekApiKey = currentSettings.deepseekApiKey
        }
      }
      writeKey(storageKey, data[name])
    }
  }
  return { success: true }
}