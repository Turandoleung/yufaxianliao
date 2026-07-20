export function isQuotaError(error) {
  if (!error) return false
  if (error.name === 'QuotaExceededError') return true
  if (error.name === 'NS_ERROR_DOM_QUOTA_REACHED') return true
  if (String(error.message || '').toLowerCase().indexOf('quota') !== -1) return true
  return false
}

export function safeSetJson(key, value) {
  try {
    const json = JSON.stringify(value)

    console.log("[storage] writing", {
      key,
      chars: json.length,
      approxKB: Math.round(json.length * 2 / 1024)
    })

    localStorage.setItem(key, json)

    console.log("[storage] write success:", key)
    return true
  } catch (error) {
    console.error("[storage] write failed", {
      key,
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })

    if (isQuotaError(error)) {
      throw new Error(
        "手机本地存储空间不足，请删除部分图片动态、草稿或旧素材后重试。"
      )
    }

    throw new Error("本地数据保存失败，请稍后重试。")
  }
}

export function replaceLargeStorageItem(key, nextValue, errorMessage) {
  var oldValue = undefined
  try {
    oldValue = localStorage.getItem(key)
  } catch (e) {
    // ignore
  }

  var nextJson = undefined
  try {
    nextJson = JSON.stringify(nextValue)
  } catch (e) {
    throw new Error("数据序列化失败，请稍后重试。")
  }

  try {
    localStorage.setItem(key, nextJson)
    return
  } catch (error) {
    if (!isQuotaError(error)) {
      throw new Error("本地数据保存失败，请稍后重试。")
    }
  }

  if (
    typeof oldValue === 'string' &&
    nextJson.length < oldValue.length
  ) {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      // ignore
    }

    try {
      localStorage.setItem(key, nextJson)
      return
    } catch (secondError) {
      try {
        if (typeof oldValue === 'string') {
          localStorage.setItem(key, oldValue)
        }
      } catch (restoreError) {
        console.error("[storage] restore failed", restoreError)
      }

      throw new Error(
        errorMessage ||
        "手机本地存储空间不足，无法完成此操作。请先导出备份并迁移旧图片数据。"
      )
    }
  }

  throw new Error(
    errorMessage ||
    "手机本地存储空间不足，无法完成此操作。请先导出备份并迁移旧图片数据。"
  )
}

export function safeGetJson(key, fallback) {
  try {
    const data = localStorage.getItem(key)
    if (!data) return fallback !== undefined ? fallback : null
    return JSON.parse(data)
  } catch (error) {
    console.error("[storage] read failed", {
      key,
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })
    try { localStorage.removeItem(key) } catch (e) { /* ignore */ }
    return fallback !== undefined ? fallback : null
  }
}

export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key)
    console.log("[storage] removed:", key)
  } catch (error) {
    console.error("[storage] remove failed", {
      key,
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })
  }
}

function countBase64InValue(value) {
  if (!value || typeof value !== 'string') return 0
  var count = 0
  var pos = 0
  while (true) {
    pos = value.indexOf('data:image/', pos)
    if (pos === -1) break
    count++
    pos += 1
  }
  return count
}

export function logStorageUsage() {
  try {
    var results = []
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i)
      if (!key) continue
      var value = localStorage.getItem(key) || ''
      var size = value.length * 2
      var base64Count = countBase64InValue(value)
      results.push({
        key: key,
        chars: value.length,
        approxKB: Math.round(size / 1024),
        base64Count: base64Count
      })
    }
    console.log("[storage-usage]", results)
    return results
  } catch (error) {
    console.error("[storage-usage] failed", {
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })
    return []
  }
}

export function logStorageStats() {
  try {
    var total = 0
    var keys = []
    var totalBase64 = 0
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i)
      if (!key) continue
      var value = localStorage.getItem(key) || ''
      var size = value.length * 2
      total += size
      var base64Count = countBase64InValue(value)
      totalBase64 += base64Count
      keys.push({
        key: key,
        chars: value.length,
        approxKB: Math.round(size / 1024),
        base64Count: base64Count
      })
    }
    console.log("[storage] stats", {
      totalItems: keys.length,
      totalApproxKB: Math.round(total / 1024),
      totalApproxMB: (total / (1024 * 1024)).toFixed(2),
      totalBase64Count: totalBase64,
      items: keys
    })
  } catch (error) {
    console.error("[storage] stats failed", {
      name: error ? error.name : undefined,
      message: error ? error.message : undefined
    })
  }
}