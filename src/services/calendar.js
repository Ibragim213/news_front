import api from '@/services/api'

const EVENT_TYPE_LABELS = {
  MEETING: 'Встреча',
  ANNOUNCEMENT: 'Объявление',
  TRAINING: 'Обучение',
  DEADLINE: 'Срок',
  HOLIDAY: 'Праздник',
}

const AUDIENCE_LABELS = {
  PERSONAL: 'Личное событие',
  ALL: 'Для всех сотрудников',
  SELECTED: 'Для выбранных сотрудников',
}

export function normalizeCalendarEvent(event) {
  const audienceType = String(event?.audienceType || 'PERSONAL').trim().toUpperCase()
  const eventType = String(event?.eventType || 'MEETING').trim().toUpperCase()

  return {
    ...event,
    eventDate: event?.eventDate || event?.date || '',
    eventTime: event?.eventTime || event?.time || '',
    audienceType,
    audienceLabel: event?.audienceLabel || AUDIENCE_LABELS[audienceType] || AUDIENCE_LABELS.PERSONAL,
    eventType,
    eventTypeLabel: EVENT_TYPE_LABELS[eventType] || EVENT_TYPE_LABELS.MEETING,
    canDelete: Boolean(event?.canDelete),
  }
}

export async function fetchCalendarEvents(params) {
  const response = await api.get('/calendar/events', { params })
  return Array.isArray(response.data) ? response.data.map(normalizeCalendarEvent) : []
}

export async function fetchPublicCalendarEvents(limit = 5) {
  try {
    const response = await api.get('/calendar/events/public', {
      params: { limit },
    })

    return Array.isArray(response.data) ? response.data.map(normalizeCalendarEvent) : []
  } catch (error) {
    const fallbackLimit = Math.max(limit * 4, 20)
    const events = await fetchCalendarEvents({ limit: fallbackLimit })

    return events
      .filter((event) => event.audienceType === 'ALL')
      .slice(0, limit)
  }
}

export async function fetchCalendarEventsByMonth(year, month) {
  const response = await api.get('/calendar/events/month', {
    params: { year, month },
  })

  return Array.isArray(response.data) ? response.data.map(normalizeCalendarEvent) : []
}

export async function createCalendarEvent(payload) {
  const response = await api.post('/calendar/events', payload)
  return normalizeCalendarEvent(response.data)
}

export async function deleteCalendarEvent(id) {
  await api.delete(`/calendar/events/${id}`)
}

export function formatCalendarEventTime(eventTime) {
  if (!eventTime) {
    return 'Весь день'
  }

  return String(eventTime).slice(0, 5)
}

export function formatCalendarEventDate(eventDate, options) {
  if (!eventDate) {
    return ''
  }

  const [year, month, day] = String(eventDate)
    .split('-')
    .map((value) => Number(value))

  if (!year || !month || !day) {
    return ''
  }

  return new Date(year, month - 1, day).toLocaleDateString(
    'ru-RU',
    options || {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )
}

export function getEventTypeOptions() {
  return [
    { value: 'MEETING', label: EVENT_TYPE_LABELS.MEETING },
    { value: 'ANNOUNCEMENT', label: EVENT_TYPE_LABELS.ANNOUNCEMENT },
    { value: 'TRAINING', label: EVENT_TYPE_LABELS.TRAINING },
    { value: 'DEADLINE', label: EVENT_TYPE_LABELS.DEADLINE },
    { value: 'HOLIDAY', label: EVENT_TYPE_LABELS.HOLIDAY },
  ]
}
