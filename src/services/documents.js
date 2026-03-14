import axios from 'axios'

const DOCUMENTS_API_URL = 'http://localhost:8080/api/documents'

function buildAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem('token')

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function createRequestError(response, fallbackMessage) {
  const error = new Error(response?.data?.message || fallbackMessage)
  error.response = response
  return error
}

export async function fetchDocuments() {
  const response = await axios.get(DOCUMENTS_API_URL, {
    headers: buildAuthHeaders(),
    validateStatus: () => true,
  })

  if (response.status === 200) {
    return Array.isArray(response.data) ? response.data : []
  }

  throw createRequestError(response, 'Не удалось загрузить документы.')
}

export async function uploadDocument({ title, description, category, file }) {
  const formData = new FormData()
  formData.append('title', title)
  formData.append('description', description || '')
  formData.append('category', category || '')
  formData.append('file', file)

  const response = await axios.post(`${DOCUMENTS_API_URL}/upload`, formData, {
    headers: buildAuthHeaders(),
    validateStatus: () => true,
  })

  if (response.status >= 200 && response.status < 300) {
    return response.data
  }

  throw createRequestError(response, 'Не удалось загрузить документ.')
}

export async function deleteDocument(id) {
  const response = await axios.delete(`${DOCUMENTS_API_URL}/${id}`, {
    headers: buildAuthHeaders(),
    validateStatus: () => true,
  })

  if (response.status >= 200 && response.status < 300) {
    return
  }

  throw createRequestError(response, 'Не удалось удалить документ.')
}

export async function downloadDocumentFile(id, fileName) {
  const response = await axios.get(`${DOCUMENTS_API_URL}/download/${id}`, {
    headers: buildAuthHeaders(),
    responseType: 'blob',
    validateStatus: () => true,
  })

  if (response.status < 200 || response.status >= 300) {
    throw createRequestError(response, 'Не удалось скачать документ.')
  }

  const contentType = response.headers['content-type'] || 'application/octet-stream'
  const blob = new Blob([response.data], { type: contentType })
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = downloadUrl
  link.download = fileName || `document-${id}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(downloadUrl)
}
