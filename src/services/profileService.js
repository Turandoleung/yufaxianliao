const PROFILE_KEY = 'xianxianquan_profile'

const defaultProfile = {
  nickname: '我',
  avatar: '',
  coverImage: '',
  bio: '保持思考，记录生活。'
}

export function getProfile() {
  try {
    const data = localStorage.getItem(PROFILE_KEY)
    if (data) {
      return { ...defaultProfile, ...JSON.parse(data) }
    }
    return { ...defaultProfile }
  } catch {
    return { ...defaultProfile }
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function updateProfile(patch) {
  const profile = getProfile()
  const updated = { ...profile, ...patch }
  saveProfile(updated)
  return updated
}
