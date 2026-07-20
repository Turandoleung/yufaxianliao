import { safeSetJson, safeGetJson } from './storageService.js'

const PROFILE_KEY = 'xianxianquan_profile'

const defaultProfile = {
  nickname: '我',
  avatar: '',
  coverImage: '',
  bio: '保持思考，记录生活。'
}

export function getProfile() {
  try {
    const data = safeGetJson(PROFILE_KEY)
    if (data) {
      return { ...defaultProfile, ...data }
    }
    return { ...defaultProfile }
  } catch (e) {
    console.error("[profile] getProfile failed", {
      name: e ? e.name : undefined,
      message: e ? e.message : undefined
    })
    return { ...defaultProfile }
  }
}

export function saveProfile(profile) {
  safeSetJson(PROFILE_KEY, profile)
}

export function updateProfile(patch) {
  const profile = getProfile()
  const updated = { ...profile, ...patch }
  saveProfile(updated)
  return updated
}