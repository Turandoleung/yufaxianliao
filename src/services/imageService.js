const MAX_LONG_SIDE = 1280
const JPEG_QUALITY = 0.8
const COVER_MAX_SIDE = 512
const COVER_QUALITY = 0.8

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
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', q))
    }
    img.onerror = function() { reject(new Error('图片加载失败')) }
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

export async function readMusicCoverAsBase64(file) {
  var raw = await readFileAsBase64(file)
  return compressImage(raw, COVER_MAX_SIDE, COVER_QUALITY)
}
