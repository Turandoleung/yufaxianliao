import { isNativePlatform, saveBase64Image, getProfileAvatarPath, getProfileCoverPath, getPostImagePath, getPostMusicCoverPath, getDraftImagePath, getDraftMusicCoverPath } from './fileStorageService.js'
import { getPosts, savePosts } from './postService.js'
import { getProfile, saveProfile } from './profileService.js'
import { getDraft, saveDraft } from './draftService.js'
function isBase64(value) {
  return typeof value === 'string' && value.indexOf('data:image/') === 0
}

export async function migrateLegacyImages(onProgress) {
  if (!isNativePlatform()) {
    return { migratedCount: 0, failedCount: 0, skippedCount: 0 }
  }

  var migratedCount = 0
  var failedCount = 0
  var skippedCount = 0

  function report(stage) {
    if (typeof onProgress === 'function') {
      onProgress({ stage: stage, migratedCount: migratedCount, failedCount: failedCount, skippedCount: skippedCount })
    }
  }

  function markMigrated() {
    migratedCount++
  }

  function markFailed() {
    failedCount++
  }

  function markSkipped() {
    skippedCount++
  }

  // 1. 迁移 profile.avatar
  report('profile-avatar')
  try {
    var profile = getProfile()
    if (profile.avatar && isBase64(profile.avatar)) {
      try {
        var avatarPath = await saveBase64Image({ base64: profile.avatar, path: getProfileAvatarPath() })
        profile.avatar = avatarPath
        saveProfile(profile)
        markMigrated()
      } catch (e) {
        console.error("[migrate] profile avatar failed", { message: e?.message })
        markFailed()
      }
    } else {
      markSkipped()
    }
  } catch (e) {
    console.error("[migrate] profile avatar read failed", { message: e?.message })
    markFailed()
  }

  // 2. 迁移 profile.coverImage
  report('profile-cover')
  try {
    var profile2 = getProfile()
    if (profile2.coverImage && isBase64(profile2.coverImage)) {
      try {
        var coverPath = await saveBase64Image({ base64: profile2.coverImage, path: getProfileCoverPath() })
        profile2.coverImage = coverPath
        saveProfile(profile2)
        markMigrated()
      } catch (e) {
        console.error("[migrate] profile cover failed", { message: e?.message })
        markFailed()
      }
    } else {
      markSkipped()
    }
  } catch (e) {
    console.error("[migrate] profile cover read failed", { message: e?.message })
    markFailed()
  }

  // 3. 迁移 draft.images
  report('draft-images')
  try {
    var draft = getDraft()
    var draftChanged = false
    if (draft.images && draft.images.length > 0) {
      for (var di = 0; di < draft.images.length; di++) {
        if (isBase64(draft.images[di])) {
          try {
            var dPath = await saveBase64Image({ base64: draft.images[di], path: getDraftImagePath(di) })
            draft.images[di] = dPath
            draftChanged = true
            markMigrated()
          } catch (e) {
            console.error("[migrate] draft image failed", { index: di, message: e?.message })
            markFailed()
          }
        } else {
          markSkipped()
        }
      }
    }
    if (draftChanged) {
      saveDraft(draft)
    }
  } catch (e) {
    console.error("[migrate] draft images read failed", { message: e?.message })
    markFailed()
  }

  // 4. 迁移 draft.music.cover
  report('draft-music-cover')
  try {
    var draft2 = getDraft()
    if (draft2.music && draft2.music.cover && isBase64(draft2.music.cover)) {
      try {
        var dmPath = await saveBase64Image({ base64: draft2.music.cover, path: getDraftMusicCoverPath() })
        draft2.music.cover = dmPath
        saveDraft(draft2)
        markMigrated()
      } catch (e) {
        console.error("[migrate] draft music cover failed", { message: e?.message })
        markFailed()
      }
    } else {
      markSkipped()
    }
  } catch (e) {
    console.error("[migrate] draft music cover read failed", { message: e?.message })
    markFailed()
  }

  // 5. 迁移 posts[].images[] 和 posts[].music.cover
  report('posts')
  try {
    var posts = getPosts()
    var postsChanged = false

    for (var pi = 0; pi < posts.length; pi++) {
      var post = posts[pi]
      if (!post) continue

      report('post-' + (pi + 1) + 'of' + posts.length)

      if (post.images && post.images.length > 0) {
        for (var ii = 0; ii < post.images.length; ii++) {
          if (isBase64(post.images[ii])) {
            try {
              var imgPath = await saveBase64Image({
                base64: post.images[ii],
                path: getPostImagePath(post.id, ii)
              })
              post.images[ii] = imgPath
              postsChanged = true
              markMigrated()
            } catch (e) {
              console.error("[migrate] post image failed", {
                postId: post.id, index: ii, message: e?.message
              })
              markFailed()
            }
          } else {
            markSkipped()
          }
        }
      } else {
        markSkipped()
      }

      if (post.music && post.music.cover && isBase64(post.music.cover)) {
        try {
          var mcPath = await saveBase64Image({
            base64: post.music.cover,
            path: getPostMusicCoverPath(post.id)
          })
          post.music.cover = mcPath
          postsChanged = true
          markMigrated()
        } catch (e) {
          console.error("[migrate] post music cover failed", {
            postId: post.id, message: e?.message
          })
          markFailed()
        }
      } else {
        markSkipped()
      }
    }

    if (postsChanged) {
      savePosts(posts)
    }
  } catch (e) {
    console.error("[migrate] posts read failed", { message: e?.message })
    markFailed()
  }

  report('done')

  return {
    migratedCount: migratedCount,
    failedCount: failedCount,
    skippedCount: skippedCount
  }
}