import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { safeSetJson, safeGetJson } from './storageService.js'

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
    return safeGetJson(key, null)
  } catch (e) {
    console.error("[backup] readKey failed", {
      key: key,
      name: e ? e.name : undefined,
      message: e ? e.message : undefined
    })
    return null
  }
}

function writeKey(key, value) {
  if (value === null || value === undefined) return
  try {
    safeSetJson(key, value)
  } catch (e) {
    console.error("[backup] writeKey failed", {
      key: key,
      name: e ? e.name : undefined,
      message: e ? e.message : undefined
    })
    throw e
  }
}

function collectBackupData() {
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
  return data
}

function formatTimestamp() {
  var now = new Date()
  var y = now.getFullYear()
  var m = String(now.getMonth() + 1).padStart(2, '0')
  var d = String(now.getDate()).padStart(2, '0')
  var h = String(now.getHours()).padStart(2, '0')
  var min = String(now.getMinutes()).padStart(2, '0')
  var s = String(now.getSeconds()).padStart(2, '0')
  return y + '-' + m + '-' + d + '-' + h + min + s
}

function buildBackupObject() {
  console.log("[backup] collecting data")
  var data = collectBackupData()
  var backup = {
    appName: '与法贤聊',
    backupVersion: 2,
    exportedAt: Date.now(),
    exportedAtText: formatTimestamp(),
    data: data
  }
  return backup
}

function sanitizeForJson(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch (e) {
    return value
  }
}

async function exportBackupNative() {
  console.log("[backup] native export started")
  console.log("[backup] platform:", Capacitor.getPlatform())

  var backup = buildBackupObject()
  backup.data = sanitizeForJson(backup.data)
  var jsonText = JSON.stringify(backup, null, 2)

  console.log("[backup] json generated", {
    length: jsonText.length
  })

  var fileName = 'yufaxianliao-backup-' + formatTimestamp() + '.json'

  console.log("[backup] writing file to cache:", fileName)

  await Filesystem.writeFile({
    path: fileName,
    data: jsonText,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
    recursive: true
  })

  console.log("[backup] file written")

  var uriResult = await Filesystem.getUri({
    path: fileName,
    directory: Directory.Cache
  })

  console.log("[backup] share opening")

  await Share.share({
    title: '导出与法贤聊数据',
    text: '与法贤聊本地数据备份',
    url: uriResult.uri,
    dialogTitle: '保存或分享备份文件'
  })

  console.log("[backup] share completed")

  return { success: true, fileName: fileName }
}

function exportBackupWeb() {
  console.log("[backup] web export started")

  var backup = buildBackupObject()
  backup.data = sanitizeForJson(backup.data)
  var jsonText = JSON.stringify(backup, null, 2)

  console.log("[backup] json generated", {
    length: jsonText.length
  })

  var fileName = 'yufaxianliao-backup-' + formatTimestamp() + '.json'
  var blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' })
  var url = URL.createObjectURL(blob)
  var a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  setTimeout(function () {
    URL.revokeObjectURL(url)
  }, 1000)

  console.log("[backup] web download triggered")

  return { success: true, fileName: fileName }
}

export async function exportBackup() {
  try {
    if (Capacitor.isNativePlatform()) {
      return await exportBackupNative()
    }
    return exportBackupWeb()
  } catch (error) {
    console.error("[backup] export failed", {
      name: error ? error.name : undefined,
      message: error ? error.message : undefined,
      stack: error ? error.stack : undefined
    })
    throw error
  }
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