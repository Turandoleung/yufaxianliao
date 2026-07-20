import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'

export function isNativePlatform() {
  return Capacitor.isNativePlatform()
}

export function isBase64Image(value) {
  return typeof value === 'string' && value.startsWith('data:image/')
}

export function isStoredFilePath(value) {
  return typeof value === 'string' &&
    !value.startsWith('data:image/') &&
    !value.startsWith('http://') &&
    !value.startsWith('https://') &&
    !value.startsWith('blob:')
}

function stripBase64Prefix(base64) {
  if (!base64 || typeof base64 !== 'string') return ''
  const idx = base64.indexOf(',')
  if (idx > 0) {
    return base64.substring(idx + 1)
  }
  return base64
}

export async function saveBase64Image({ base64, path }) {
  if (!isNativePlatform()) {
    return base64
  }

  const cleanBase64 = stripBase64Prefix(base64)

  try {
    const dirPath = path.split('/').slice(0, -1).join('/')
    if (dirPath) {
      try {
        await Filesystem.mkdir({
          path: dirPath,
          directory: Directory.Data,
          recursive: true
        })
      } catch (e) {
      }
    }

    await Filesystem.writeFile({
      path: path,
      data: cleanBase64,
      directory: Directory.Data,
      encoding: Encoding.Base64
    })

    console.log('[file-storage] saved', { path })
    return path
  } catch (error) {
    console.error('[file-storage] save failed', {
      path,
      name: error?.name,
      message: error?.message
    })
    throw new Error('图片保存失败，请稍后重试')
  }
}

export async function readImageUrl(path) {
  if (!path || typeof path !== 'string') return ''

  if (isBase64Image(path)) {
    return path
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  if (!isNativePlatform()) {
    return path
  }

  try {
    const result = await Filesystem.getUri({
      path: path,
      directory: Directory.Data
    })
    return Capacitor.convertFileSrc(result.uri)
  } catch (error) {
    console.error('[file-storage] read failed', {
      path,
      name: error?.name,
      message: error?.message
    })
    return ''
  }
}

export async function resolveImageSrc(value) {
  return await readImageUrl(value)
}

export async function deleteStoredFile(path) {
  if (!isNativePlatform()) return true

  try {
    await Filesystem.deleteFile({
      path: path,
      directory: Directory.Data
    })
    console.log('[file-storage] deleted file', { path })
    return true
  } catch (error) {
    console.warn('[file-storage] delete file failed', {
      path,
      name: error?.name,
      message: error?.message
    })
    return false
  }
}

export async function deleteStoredDirectory(path) {
  if (!isNativePlatform()) return true

  try {
    await Filesystem.rmdir({
      path: path,
      directory: Directory.Data,
      recursive: true
    })
    console.log('[file-storage] deleted directory', { path })
    return true
  } catch (error) {
    console.warn('[file-storage] delete directory failed', {
      path,
      name: error?.name,
      message: error?.message
    })
    return false
  }
}

export function getProfileAvatarPath() {
  return 'profile/avatar-' + Date.now() + '.jpg'
}

export function getProfileCoverPath() {
  return 'profile/cover-' + Date.now() + '.jpg'
}

export function isStoredPath(value) {
  return typeof value === 'string' &&
    !value.startsWith('data:image/') &&
    !value.startsWith('http://') &&
    !value.startsWith('https://') &&
    !value.startsWith('blob:')
}

export async function deleteStoredFileSafe(path) {
  if (!isNativePlatform()) return
  if (!path || !isStoredPath(path)) return
  try {
    await Filesystem.deleteFile({ path: path, directory: Directory.Data })
    console.log('[file-storage] deleted old file', { path })
  } catch (e) {
    console.warn('[file-storage] delete old file failed', { path })
  }
}

export function getPostImagePath(postId, index) {
  return 'posts/' + String(postId) + '/image-' + String(index) + '.jpg'
}

export function getPostMusicCoverPath(postId) {
  return 'posts/' + String(postId) + '/music-cover.jpg'
}

export function getDraftImagePath(index) {
  return 'draft/images/draft-' + String(index) + '.jpg'
}

export function getDraftMusicCoverPath() {
  return 'draft/music-cover.jpg'
}

export async function copyFile(srcPath, dstPath) {
  if (!isNativePlatform()) return true

  try {
    const data = await Filesystem.readFile({
      path: srcPath,
      directory: Directory.Data,
      encoding: Encoding.Base64
    })

    const dirPath = dstPath.split('/').slice(0, -1).join('/')
    if (dirPath) {
      try {
        await Filesystem.mkdir({
          path: dirPath,
          directory: Directory.Data,
          recursive: true
        })
      } catch (e) {
      }
    }

    await Filesystem.writeFile({
      path: dstPath,
      data: data.data,
      directory: Directory.Data,
      encoding: Encoding.Base64
    })

    console.log('[file-storage] copied', { srcPath, dstPath })
    return true
  } catch (error) {
    console.error('[file-storage] copy failed', {
      srcPath, dstPath,
      name: error?.name,
      message: error?.message
    })
    throw new Error('图片迁移失败，请稍后重试')
  }
}

export async function clearDraftFiles() {
  if (!isNativePlatform()) return
  await deleteStoredDirectory('draft')
}