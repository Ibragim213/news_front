import api from '@/services/api'

const ADMIN_USERNAME = 'admin'
const ADMIN_ROLE = 'ADMIN'
const ADMIN_POSITION_RU = '\u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440'
const NEWS_PREFIX_RU = '\u043d\u043e\u0432\u043e\u0441\u0442'
const NEWS_EDITOR_RU = '\u0440\u0435\u0434\u0430\u043a\u0442\u043e\u0440'
const DEFAULT_CATEGORY = '\u041e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u044f'

export function getCurrentUser() {
  const userStr = localStorage.getItem('user')

  if (!userStr) {
    return null
  }

  try {
    return JSON.parse(userStr)
  } catch (error) {
    return null
  }
}

export function getCurrentUserId() {
  return getCurrentUser()?.id ?? null
}

export function normalizePosition(position) {
  return String(position || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

export function canUserManageNews(user = getCurrentUser()) {
  if (!user) {
    return false
  }

  const role = String(user.role || '').trim().toUpperCase()
  const username = String(user.username || '').trim().toLowerCase()
  const position = normalizePosition(user.position)

  const isAdminPosition =
    position === 'admin' || position.includes(ADMIN_POSITION_RU) || position.includes('administrator')
  const isNewsEditor =
    (position.includes(NEWS_PREFIX_RU) && position.includes(NEWS_EDITOR_RU)) ||
    position.includes('news editor')

  return role === ADMIN_ROLE || role.endsWith(ADMIN_ROLE) || username === ADMIN_USERNAME || isAdminPosition || isNewsEditor
}

export function isNewsLikedByUser(news, userId = getCurrentUserId()) {
  return Boolean(userId && Array.isArray(news?.likedBy) && news.likedBy.includes(userId))
}

export function formatNewsDate(dateString) {
  if (!dateString) {
    return ''
  }

  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function normalizeNews(news) {
  const likedBy = Array.isArray(news?.likedBy) ? news.likedBy : []
  const content = news?.content || news?.description || ''

  return {
    ...news,
    content,
    description: content,
    category: news?.category || DEFAULT_CATEGORY,
    gradient: news?.gradient || 1,
    views: news?.views || 0,
    likes: news?.likes || 0,
    likedBy,
    date: formatNewsDate(news?.createdAt),
    liked: isNewsLikedByUser({ ...news, likedBy }),
  }
}

export async function fetchNews(limit) {
  const params = limit ? { limit } : undefined
  const response = await api.get('/news', { params })
  return Array.isArray(response.data) ? response.data.map(normalizeNews) : []
}

export async function fetchNewsById(id) {
  const response = await api.get(`/news/${id}`)
  return normalizeNews(response.data)
}

export async function createNews(news) {
  const response = await api.post('/news', {
    title: news.title,
    content: news.description,
    category: news.category,
    gradient: news.gradient,
    imageUrl: null,
  })

  return normalizeNews(response.data)
}

export async function updateNews(id, news) {
  const response = await api.put(`/news/${id}`, {
    title: news.title,
    content: news.description,
    category: news.category,
    gradient: news.gradient,
    imageUrl: null,
  })

  return normalizeNews(response.data)
}

export async function deleteNews(id) {
  await api.delete(`/news/${id}`)
}

export async function toggleNewsLike(id) {
  const response = await api.post(`/news/${id}/like`)
  return normalizeNews(response.data)
}

export async function registerNewsView(id) {
  const response = await api.post(`/news/${id}/view`)
  return normalizeNews(response.data)
}
