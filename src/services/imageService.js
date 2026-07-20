import { resolveImageSrc, isNativePlatform, saveBase64Image, getPostImagePath, getDraftImagePath } from './fileStorageService.js'

const MAX_LONG_SIDE = 1280
const JPEG_QUALITY = 0.8
const COVER_MAX_SIDE = 512
const COVER_QUALITY = 0.8

const AVATAR_MAX_SIDE = 512
const AVATAR_QUALITY = 0.85
const COVER_PROFILE_MAX_SIDE = 1600
const COVER_PROFILE_QUALITY = 0.82
const MAX_FILE_SIZE = 20 * 1024 * 1024

var SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
var SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
var UNSUPPORTED_EXTENSIONS = ['.heic', '.heif']

function getFileExtension(name) {
  if (!name) return ''
  var lastDot = name.lastIndexOf('.')
  if (lastDot === -1) return ''
  return name.substring(lastDot).toLowerCase()
}

function isUnsupportedFormat(file) {
  if (file.type && UNSUPPORTED_EXTENSIONS.some(function(ext) {
    return file.type.toLowerCase().indexOf(ext.replace('.', '')) !== -1
  })) {
    return true
  }
  var ext = getFileExtension(file.name)
  if (ext && UNSUPPORTED_EXTENSIONS.indexOf(ext) !== -1) {
    return true
  }
  return false
}

function compressImage(base64, maxSide, quality) {
  var ms = maxSide || MAX_LONG_SIDE
  var q = quality || JPEG_QUALITY
  return new Promise(function(resolve, reject) {
    var img = new Image()
    img.onload = function() {
      var w = img.width
      var h = img.height
      if (w > ms || h > ms) {
        if (w >= h) {
          h = Math.round(h * ms / w)
          w = ms
        } else {
          w = Math.round(w * ms / h)
          h = ms
        }
      }
      var canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      var ctx = canvas.getContext('2d')
      ctx.fillStyle = '#FEF9F0'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', q))
    }
    img.onerror = function() { reject(new Error('图片无法解码，请选择其他图片')) }
    img.src = base64
  })
}

export function readFileAsBase64(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader()
    reader.onload = function() { resolve(reader.result) }
    reader.onerror = function() { reject(new Error('图片读取失败')) }
    reader.readAsDataURL(file)
  })
}

export function processProfileImage(file, _ref) {
  var purpose = (_ref && _ref.purpose) || 'avatar'

  console.log("[profile-image] selected", {
    name: file.name,
    type: file.type || '(empty)',
    size: file.size
  })

  if (isUnsupportedFormat(file)) {
    var err = new Error('当前图片格式暂不支持，请在相册中另存为 JPEG/PNG，或关闭相机的高效图片格式后重试。')
    console.error("[profile-image] unsupported format", {
      name: file.name,
      type: file.type || '(empty)'
    })
    return Promise.reject(err)
  }

  if (file.size > MAX_FILE_SIZE) {
    var err2 = new Error('图片文件过大，请选择较小图片后重试。')
    console.error("[profile-image] file too large", {
      name: file.name,
      size: file.size
    })
    return Promise.reject(err2)
  }

  var maxSide = purpose === 'cover' ? COVER_PROFILE_MAX_SIDE : AVATAR_MAX_SIDE
  var quality = purpose === 'cover' ? COVER_PROFILE_QUALITY : AVATAR_QUALITY

  return readFileAsBase64(file).then(function(raw) {
    console.log("[profile-image] read success")

    return compressImage(raw, maxSide, quality).then(function(result) {
      console.log("[profile-image] compress success", {
        length: result.length
      })
      return result
    })
  })
}

export async function processImages(files) {
  var results = []
  for (var i = 0; i < files.length; i++) {
    try {
      var raw = await readFileAsBase64(files[i])
      var compressed = await compressImage(raw, MAX_LONG_SIDE, JPEG_QUALITY)
      results.push(compressed)
    } catch (e) {
      alert('图片处理失败：' + (files[i].name || '未知文件') + '，请重试或换一张图片')
    }
  }
  return results
}

export async function processImagesForPost(files, postId, startIndex) {
  var results = []
  var offset = startIndex || 0
  for (var i = 0; i < files.length; i++) {
    try {
      var raw = await readFileAsBase64(files[i])
      var compressed = await compressImage(raw, MAX_LONG_SIDE, JPEG_QUALITY)
      var stored = await saveBase64Image({
        base64: compressed,
        path: getPostImagePath(postId, offset + i)
      })
      results.push(stored)
    } catch (e) {
      alert('图片处理失败：' + (files[i].name || '未知文件') + '，请重试或换一张图片')
    }
  }
  return results
}

export async function processImagesForDraft(files, startIndex) {
  var results = []
  var offset = startIndex || 0
  for (var i = 0; i < files.length; i++) {
    try {
      var raw = await readFileAsBase64(files[i])
      var compressed = await compressImage(raw, MAX_LONG_SIDE, JPEG_QUALITY)
      var stored = await saveBase64Image({
        base64: compressed,
        path: getDraftImagePath(offset + i)
      })
      results.push(stored)
    } catch (e) {
      alert('图片处理失败：' + (files[i].name || '未知文件') + '，请重试或换一张图片')
    }
  }
  return results
}

export { resolveImageSrc, isNativePlatform } from './fileStorageService.js'

export async function readMusicCoverAsBase64(file) {
  var raw = await readFileAsBase64(file)
  return compressImage(raw, COVER_MAX_SIDE, COVER_QUALITY)
}