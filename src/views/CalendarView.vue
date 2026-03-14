<template>
  <div class="calendar-view">
    <div class="container">
      <section class="calendar-hero">
        <div class="calendar-hero__copy">
          <h1>Календарь</h1>
          <p>Планируйте личные и общие события компании в одном месте.</p>
        </div>

        <button class="add-event-btn" type="button" @click="openAddEventModal">
          {{ canManageSharedEvents ? 'Добавить событие' : 'Добавить личное событие' }}
        </button>
      </section>

      <div v-if="statusMessage" class="message" :class="messageClass">
        {{ statusMessage }}
      </div>

      <section class="calendar-toolbar">
        <div class="calendar-toolbar__nav">
          <button class="nav-btn" type="button" @click="prevYear">‹‹</button>
          <button class="nav-btn" type="button" @click="prevMonth">‹</button>
        </div>

        <h2>{{ currentMonthName }} {{ currentYear }}</h2>

        <div class="calendar-toolbar__nav">
          <button class="nav-btn" type="button" @click="nextMonth">›</button>
          <button class="nav-btn" type="button" @click="nextYear">››</button>
        </div>
      </section>

      <div v-if="loading" class="loading-state">Загрузка событий...</div>

      <template v-else>
        <div class="calendar-weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
        </div>

        <div class="calendar-days">
          <div v-for="day in emptyDays" :key="'empty-' + day" class="calendar-day calendar-day--empty"></div>

          <button
            v-for="day in daysInMonth"
            :key="day.dateKey"
            type="button"
            class="calendar-day"
            :class="{ 'calendar-day--today': day.isToday, 'calendar-day--active': day.hasEvent }"
            @click="selectDay(day)"
          >
            <span class="day-number">{{ day.dayNumber }}</span>

            <div v-if="day.events.length" class="day-events-preview">
              <div
                v-for="event in day.events.slice(0, 2)"
                :key="event.id"
                class="day-event-chip"
                :class="eventTypeClass(event.eventType)"
              >
                <span class="day-event-chip__time">{{ shortEventTime(event) }}</span>
                <span class="day-event-chip__title">{{ truncateTitle(event.title) }}</span>
              </div>

              <div v-if="day.events.length > 2" class="day-events-more">
                +{{ day.events.length - 2 }} еще
              </div>
            </div>
          </button>
        </div>
      </template>
    </div>

    <div v-if="showAddEventModal" class="modal-overlay" @click.self="closeAddEventModal">
      <div class="modal">
        <div class="modal-header">
          <div>
            <h2>Новое событие</h2>
            <p>
              {{ canManageSharedEvents
                ? 'Можно создать личное событие, событие для всех сотрудников или только для выбранных.'
                : 'Личное событие появится только в вашем календаре.' }}
            </p>
          </div>

          <button class="icon-btn" type="button" aria-label="Закрыть окно" @click="closeAddEventModal">
            ×
          </button>
        </div>

        <form class="event-form" @submit.prevent="addEvent">
          <div class="form-group">
            <label for="event-title">Название события</label>
            <input id="event-title" v-model.trim="newEvent.title" type="text" maxlength="120" required />
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="event-date">Дата</label>
              <input id="event-date" v-model="newEvent.eventDate" type="date" required />
            </div>

            <div class="form-group">
              <label for="event-time">Время</label>
              <input id="event-time" v-model="newEvent.eventTime" type="time" />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="event-type">Тип события</label>
              <select id="event-type" v-model="newEvent.eventType">
                <option v-for="option in eventTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="form-group" v-if="canManageSharedEvents">
              <label>Кому показать</label>
              <div class="audience-switcher">
                <button
                  type="button"
                  class="audience-btn"
                  :class="{ 'audience-btn--active': newEvent.audienceType === 'PERSONAL' }"
                  @click="setAudienceType('PERSONAL')"
                >
                  Только мне
                </button>
                <button
                  type="button"
                  class="audience-btn"
                  :class="{ 'audience-btn--active': newEvent.audienceType === 'ALL' }"
                  @click="setAudienceType('ALL')"
                >
                  Всем
                </button>
                <button
                  type="button"
                  class="audience-btn"
                  :class="{ 'audience-btn--active': newEvent.audienceType === 'SELECTED' }"
                  @click="setAudienceType('SELECTED')"
                >
                  Выбранным
                </button>
              </div>
            </div>
          </div>

          <div v-if="canManageSharedEvents && newEvent.audienceType === 'SELECTED'" class="form-group">
            <div class="target-users__header">
              <label>Сотрудники</label>
              <span>Выбрано: {{ newEvent.targetUserIds.length }}</span>
            </div>

            <div v-if="employeesLoading" class="target-users__loading">Загрузка сотрудников...</div>
            <div v-else class="target-users">
              <label v-for="employee in employees" :key="employee.id" class="target-user">
                <input
                  type="checkbox"
                  :checked="newEvent.targetUserIds.includes(employee.id)"
                  @change="toggleTargetUser(employee.id)"
                />
                <span>{{ employee.fullName || employee.username }}</span>
                <small>{{ employee.email }}</small>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="event-description">Описание</label>
            <textarea
              id="event-description"
              v-model.trim="newEvent.description"
              rows="4"
              maxlength="500"
              placeholder="Коротко опишите, что будет происходить"
            />
          </div>

          <div class="modal-actions">
            <button class="ghost-btn" type="button" :disabled="addingEvent" @click="closeAddEventModal">
              Отмена
            </button>
            <button class="submit-btn" type="submit" :disabled="addingEvent">
              {{ addingEvent ? 'Сохраняем...' : 'Сохранить событие' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDayEventsModal && selectedDay" class="modal-overlay" @click.self="closeDayEventsModal">
      <div class="modal modal--wide">
        <div class="modal-header">
          <div>
            <h2>События на {{ formatDayTitle(selectedDay.dateKey) }}</h2>
            <p>Все события этого дня для вашего календаря.</p>
          </div>

          <button class="icon-btn" type="button" aria-label="Закрыть окно" @click="closeDayEventsModal">
            ×
          </button>
        </div>

        <div v-if="selectedDay.events.length === 0" class="empty-day-state">На этот день событий пока нет.</div>

        <div v-else class="events-list">
          <article v-for="event in selectedDay.events" :key="event.id" class="event-card">
            <div class="event-card__meta">
              <span class="event-badge" :class="eventTypeClass(event.eventType)">
                {{ event.eventTypeLabel }}
              </span>
              <span class="event-audience">{{ event.audienceLabel }}</span>
            </div>

            <h3>{{ event.title }}</h3>
            <p v-if="event.description">{{ event.description }}</p>
            <p v-else class="event-card__empty-copy">Описание не указано.</p>

            <div class="event-card__footer">
              <div class="event-card__details">
                <span>{{ formatEventTime(event.eventTime) }}</span>
                <span>Организатор: {{ event.createdByFullName || event.createdByUsername || 'Не указан' }}</span>
              </div>

              <button
                v-if="event.canDelete"
                class="delete-btn"
                type="button"
                :disabled="deletingEventId === event.id"
                @click="deleteEvent(event)"
              >
                {{ deletingEventId === event.id ? 'Удаляем...' : 'Удалить' }}
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import {
  createCalendarEvent,
  deleteCalendarEvent,
  fetchCalendarEventsByMonth,
  formatCalendarEventDate,
  formatCalendarEventTime,
  getEventTypeOptions,
} from '@/services/calendar'
import { canUserManageNews, getCurrentUser } from '@/services/news'

function buildDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTodayKey() {
  return buildDateKey(new Date())
}

function capitalize(value) {
  if (!value) {
    return ''
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default {
  name: 'CalendarView',
  data() {
    return {
      currentDate: new Date(),
      weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      loading: true,
      addingEvent: false,
      deletingEventId: null,
      showAddEventModal: false,
      showDayEventsModal: false,
      employeesLoading: false,
      statusMessage: '',
      statusType: 'info',
      currentUser: getCurrentUser(),
      employees: [],
      eventsByDate: {},
      selectedDay: null,
      newEvent: {
        title: '',
        eventDate: getTodayKey(),
        eventTime: '',
        description: '',
        eventType: 'MEETING',
        audienceType: 'PERSONAL',
        targetUserIds: [],
      },
      eventTypeOptions: getEventTypeOptions(),
    }
  },
  computed: {
    canManageSharedEvents() {
      return canUserManageNews(this.currentUser)
    },
    currentMonthName() {
      return capitalize(this.currentDate.toLocaleString('ru-RU', { month: 'long' }))
    },
    currentYear() {
      return this.currentDate.getFullYear()
    },
    daysInMonth() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const lastDay = new Date(year, month + 1, 0).getDate()
      const todayKey = getTodayKey()

      return Array.from({ length: lastDay }, (_, index) => {
        const date = new Date(year, month, index + 1)
        const dateKey = buildDateKey(date)
        const events = this.eventsByDate[dateKey] || []

        return {
          date,
          dateKey,
          dayNumber: index + 1,
          isToday: dateKey === todayKey,
          hasEvent: events.length > 0,
          events,
        }
      })
    },
    emptyDays() {
      const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1)
      return (firstDay.getDay() === 0 ? 7 : firstDay.getDay()) - 1
    },
    messageClass() {
      return {
        'message--success': this.statusType === 'success',
        'message--error': this.statusType === 'error',
        'message--info': this.statusType === 'info',
      }
    },
  },
  mounted() {
    this.loadMonthEvents()
    this.loadEmployees()
    window.addEventListener('user-updated', this.handleUserUpdated)
  },
  beforeUnmount() {
    window.removeEventListener('user-updated', this.handleUserUpdated)
  },
  methods: {
    handleUserUpdated() {
      this.currentUser = getCurrentUser()
      if (!this.canManageSharedEvents) {
        this.newEvent.audienceType = 'PERSONAL'
        this.newEvent.targetUserIds = []
      }
      this.loadEmployees()
      this.loadMonthEvents()
    },

    async loadEmployees() {
      if (!this.canManageSharedEvents) {
        this.employees = []
        return
      }

      this.employeesLoading = true

      try {
        const response = await api.get('/employees')
        const employees = Array.isArray(response.data) ? response.data : []
        this.employees = [...employees].sort((left, right) =>
          String(left.fullName || left.username).localeCompare(String(right.fullName || right.username), 'ru'),
        )
      } catch (error) {
        this.employees = []
        this.showStatus('Не удалось загрузить список сотрудников для адресных событий.', 'error')
      } finally {
        this.employeesLoading = false
      }
    },

    async loadMonthEvents() {
      this.loading = true

      try {
        const events = await fetchCalendarEventsByMonth(this.currentYear, this.currentDate.getMonth() + 1)
        this.eventsByDate = this.buildEventsMap(events)
        this.refreshSelectedDay()
      } catch (error) {
        this.eventsByDate = {}
        this.showStatus(error.response?.data?.message || 'Не удалось загрузить события.', 'error')
      } finally {
        this.loading = false
      }
    },

    buildEventsMap(events) {
      const map = {}

      events.forEach((event) => {
        const dateKey = event.eventDate
        if (!dateKey) {
          return
        }

        if (!map[dateKey]) {
          map[dateKey] = []
        }

        map[dateKey].push(event)
      })

      Object.keys(map).forEach((dateKey) => {
        map[dateKey].sort((left, right) => {
          const leftTime = left.eventTime || '99:99'
          const rightTime = right.eventTime || '99:99'
          return leftTime.localeCompare(rightTime)
        })
      })

      return map
    },

    prevMonth() {
      this.currentDate = new Date(this.currentYear, this.currentDate.getMonth() - 1, 1)
      this.loadMonthEvents()
    },

    nextMonth() {
      this.currentDate = new Date(this.currentYear, this.currentDate.getMonth() + 1, 1)
      this.loadMonthEvents()
    },

    prevYear() {
      this.currentDate = new Date(this.currentYear - 1, this.currentDate.getMonth(), 1)
      this.loadMonthEvents()
    },

    nextYear() {
      this.currentDate = new Date(this.currentYear + 1, this.currentDate.getMonth(), 1)
      this.loadMonthEvents()
    },

    openAddEventModal() {
      this.resetNewEvent()
      this.showAddEventModal = true
    },

    closeAddEventModal() {
      if (this.addingEvent) {
        return
      }

      this.showAddEventModal = false
      this.resetNewEvent()
    },

    resetNewEvent() {
      this.newEvent = {
        title: '',
        eventDate: getTodayKey(),
        eventTime: '',
        description: '',
        eventType: 'MEETING',
        audienceType: this.canManageSharedEvents ? 'PERSONAL' : 'PERSONAL',
        targetUserIds: [],
      }
    },

    setAudienceType(audienceType) {
      this.newEvent.audienceType = audienceType
      if (audienceType !== 'SELECTED') {
        this.newEvent.targetUserIds = []
      }
    },

    toggleTargetUser(userId) {
      if (this.newEvent.targetUserIds.includes(userId)) {
        this.newEvent.targetUserIds = this.newEvent.targetUserIds.filter((id) => id !== userId)
        return
      }

      this.newEvent.targetUserIds = [...this.newEvent.targetUserIds, userId]
    },

    selectDay(day) {
      this.selectedDay = {
        dateKey: day.dateKey,
        events: [...day.events],
      }
      this.showDayEventsModal = true
    },

    refreshSelectedDay() {
      if (!this.selectedDay) {
        return
      }

      const refreshedEvents = this.eventsByDate[this.selectedDay.dateKey] || []
      this.selectedDay = {
        ...this.selectedDay,
        events: refreshedEvents,
      }
    },

    closeDayEventsModal() {
      this.showDayEventsModal = false
      this.selectedDay = null
    },

    async addEvent() {
      if (!this.newEvent.title || !this.newEvent.eventDate) {
        this.showStatus('Заполните название и дату события.', 'error')
        return
      }

      if (this.canManageSharedEvents && this.newEvent.audienceType === 'SELECTED' && !this.newEvent.targetUserIds.length) {
        this.showStatus('Выберите сотрудников для адресного события.', 'error')
        return
      }

      this.addingEvent = true

      try {
        await createCalendarEvent({
          title: this.newEvent.title,
          description: this.newEvent.description,
          eventDate: this.newEvent.eventDate,
          eventTime: this.newEvent.eventTime || null,
          eventType: this.newEvent.eventType,
          audienceType: this.canManageSharedEvents ? this.newEvent.audienceType : 'PERSONAL',
          targetUserIds: this.newEvent.audienceType === 'SELECTED' ? this.newEvent.targetUserIds : [],
        })

        const [year, month] = this.newEvent.eventDate.split('-').map((value) => Number(value))
        this.currentDate = new Date(year, month - 1, 1)
        await this.loadMonthEvents()
        this.closeAddEventModal()
        this.showStatus('Событие успешно сохранено.', 'success')
        window.dispatchEvent(new Event('events-updated'))
      } catch (error) {
        this.showStatus(error.response?.data?.message || 'Не удалось сохранить событие.', 'error')
      } finally {
        this.addingEvent = false
      }
    },

    async deleteEvent(event) {
      if (!event?.id || !event.canDelete) {
        return
      }

      const confirmed = window.confirm(`Удалить событие "${event.title}"?`)
      if (!confirmed) {
        return
      }

      this.deletingEventId = event.id

      try {
        await deleteCalendarEvent(event.id)
        await this.loadMonthEvents()
        this.refreshSelectedDay()

        if (this.selectedDay && this.selectedDay.events.length === 0) {
          this.closeDayEventsModal()
        }

        this.showStatus('Событие удалено.', 'success')
        window.dispatchEvent(new Event('events-updated'))
      } catch (error) {
        this.showStatus(error.response?.data?.message || 'Не удалось удалить событие.', 'error')
      } finally {
        this.deletingEventId = null
      }
    },

    truncateTitle(title) {
      if (!title) {
        return ''
      }

      return title.length > 14 ? `${title.slice(0, 14)}...` : title
    },

    shortEventTime(event) {
      return event.eventTime ? String(event.eventTime).slice(0, 5) : 'Весь день'
    },

    formatEventTime(eventTime) {
      return formatCalendarEventTime(eventTime)
    },

    formatDayTitle(dateKey) {
      return formatCalendarEventDate(dateKey, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    },

    eventTypeClass(eventType) {
      switch (String(eventType || '').toUpperCase()) {
        case 'ANNOUNCEMENT':
          return 'event-badge--announcement'
        case 'TRAINING':
          return 'event-badge--training'
        case 'DEADLINE':
          return 'event-badge--deadline'
        case 'HOLIDAY':
          return 'event-badge--holiday'
        default:
          return 'event-badge--meeting'
      }
    },

    showStatus(message, type = 'info') {
      this.statusMessage = message
      this.statusType = type
    },
  },
}
</script>

<style scoped>
.calendar-view {
  min-height: calc(100vh - 72px);
  padding: 20px 0 36px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 24%),
    linear-gradient(180deg, #edf3fb 0%, #f5f7fb 38%, #eef3f8 100%);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.calendar-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 18px;
  padding: 28px 24px;
  border-radius: 22px;
  background: linear-gradient(135deg, #2f80d9 0%, #3867e8 56%, #3f66dd 100%);
  color: #ffffff;
  box-shadow: 0 20px 38px rgba(49, 102, 220, 0.2);
}

.calendar-hero h1 {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
}

.calendar-hero p {
  margin: 12px 0 0;
  font-size: 15px;
  line-height: 1.6;
  opacity: 0.95;
}

.add-event-btn,
.submit-btn {
  min-height: 48px;
  padding: 0 20px;
  border: none;
  border-radius: 14px;
  background: #ffffff;
  color: #2253cb;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.add-event-btn:hover,
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(16, 24, 40, 0.12);
  filter: brightness(1.02);
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
  padding: 14px 18px;
  border: 1px solid rgba(191, 200, 214, 0.65);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 14px 30px rgba(148, 163, 184, 0.12);
}

.calendar-toolbar h2 {
  margin: 0;
  color: #101828;
  font-size: 26px;
  font-weight: 800;
}

.calendar-toolbar__nav {
  display: flex;
  gap: 10px;
}

.nav-btn,
.ghost-btn,
.icon-btn,
.delete-btn {
  border: none;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.nav-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #eef2f7;
  color: #344054;
  font-size: 18px;
  font-weight: 700;
}

.nav-btn:hover {
  background: #e3e8ef;
}

.message {
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
}

.message--success {
  background: #e8f7ee;
  color: #166534;
}

.message--error {
  background: #fee2e2;
  color: #dc2626;
}

.message--info {
  background: #e8eefc;
  color: #1d4ed8;
}

.loading-state {
  padding: 44px 28px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(220, 227, 237, 0.9);
  text-align: center;
  color: #667085;
  box-shadow: 0 12px 28px rgba(148, 163, 184, 0.12);
}

.calendar-weekdays,
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}

.calendar-weekdays {
  margin-bottom: 10px;
}

.weekday {
  padding: 10px;
  text-align: center;
  color: #667085;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.calendar-day {
  min-height: 148px;
  padding: 12px;
  border: 1px solid rgba(220, 227, 237, 0.9);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 12px 26px rgba(148, 163, 184, 0.08);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: left;
}

.calendar-day:not(.calendar-day--empty):hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 30px rgba(148, 163, 184, 0.14);
}

.calendar-day--empty {
  min-height: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  pointer-events: none;
}

.calendar-day--today {
  border-color: rgba(59, 130, 246, 0.5);
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.calendar-day--active {
  border-color: rgba(96, 165, 250, 0.45);
}

.day-number {
  align-self: flex-end;
  color: #101828;
  font-size: 15px;
  font-weight: 800;
}

.day-events-preview {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.day-event-chip {
  display: grid;
  gap: 3px;
  padding: 8px 10px;
  border-radius: 12px;
  color: #0f172a;
}

.day-event-chip__time {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.8;
}

.day-event-chip__title {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
}

.day-events-more {
  color: #667085;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 4px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.44);
  backdrop-filter: blur(7px);
}

.modal {
  width: min(100%, 620px);
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.18);
}

.modal--wide {
  width: min(100%, 760px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0 0 8px;
  color: #101828;
  font-size: 28px;
  font-weight: 800;
}

.modal-header p {
  margin: 0;
  color: #667085;
  font-size: 14px;
  line-height: 1.55;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f3f5f8;
  color: #344054;
  font-size: 24px;
}

.icon-btn:hover {
  background: #e8edf3;
}

.event-form {
  display: grid;
  gap: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group label,
.target-users__header label {
  color: #344054;
  font-size: 14px;
  font-weight: 700;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  border: 1px solid #d7e0ec;
  border-radius: 14px;
  background: #ffffff;
  color: #12233d;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  min-height: 116px;
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3c6be0;
  box-shadow: 0 0 0 3px rgba(60, 107, 224, 0.12);
}

.audience-switcher {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.audience-btn {
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid #d7e0ec;
  border-radius: 999px;
  background: #ffffff;
  color: #475467;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.audience-btn--active {
  border-color: #3c6be0;
  background: #eef4ff;
  color: #1d4ed8;
}

.target-users__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.target-users__header span {
  color: #667085;
  font-size: 13px;
  font-weight: 600;
}

.target-users__loading,
.empty-day-state {
  padding: 18px;
  border-radius: 14px;
  background: #f8fafc;
  color: #667085;
  text-align: center;
}

.target-users {
  max-height: 220px;
  overflow-y: auto;
  display: grid;
  gap: 10px;
  padding: 4px 2px;
}

.target-user {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid #e3e9f2;
  border-radius: 14px;
  background: #fbfcfe;
}

.target-user input {
  width: 16px;
  height: 16px;
  margin: 0;
}

.target-user span {
  display: block;
  color: #101828;
  font-size: 14px;
  font-weight: 700;
}

.target-user small {
  color: #667085;
  font-size: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.ghost-btn,
.submit-btn,
.delete-btn {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
}

.ghost-btn {
  background: #eef2f6;
  color: #374151;
}

.ghost-btn:hover:not(:disabled) {
  background: #e3e8ef;
}

.submit-btn {
  background: linear-gradient(135deg, #2f6ce5 0%, #315fdd 100%);
  color: #ffffff;
}

.submit-btn:disabled,
.ghost-btn:disabled,
.delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.events-list {
  display: grid;
  gap: 14px;
}

.event-card {
  padding: 18px;
  border: 1px solid #e3e9f2;
  border-radius: 18px;
  background: #fbfcfe;
}

.event-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.event-badge,
.event-audience {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.event-audience {
  background: #eef2f6;
  color: #475467;
}

.event-card h3 {
  margin: 0 0 10px;
  color: #101828;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.3;
}

.event-card p {
  margin: 0;
  color: #475467;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
}

.event-card__empty-copy {
  color: #98a2b3;
}

.event-card__footer {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.event-card__details {
  display: grid;
  gap: 6px;
  color: #667085;
  font-size: 13px;
  font-weight: 600;
}

.delete-btn {
  background: #fff5f5;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.delete-btn:hover:not(:disabled) {
  background: #fee2e2;
}

.event-badge--meeting {
  background: #e7efff;
  color: #1d4ed8;
}

.event-badge--announcement {
  background: #ede9fe;
  color: #6d28d9;
}

.event-badge--training {
  background: #ecfdf3;
  color: #027a48;
}

.event-badge--deadline {
  background: #fff7ed;
  color: #c2410c;
}

.event-badge--holiday {
  background: #fff1f2;
  color: #e11d48;
}

@media (max-width: 980px) {
  .calendar-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .calendar-day {
    min-height: 132px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .calendar-hero {
    padding: 24px 20px;
  }

  .calendar-hero h1 {
    font-size: 34px;
  }

  .calendar-toolbar {
    padding: 12px 14px;
  }

  .calendar-toolbar h2 {
    font-size: 22px;
    text-align: center;
  }

  .calendar-weekdays,
  .calendar-days {
    gap: 8px;
  }

  .calendar-day {
    min-height: 118px;
    padding: 10px;
  }

  .event-card__footer {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .calendar-toolbar {
    flex-direction: column;
  }

  .calendar-weekdays,
  .calendar-days {
    gap: 6px;
  }

  .calendar-day {
    min-height: 96px;
    padding: 8px;
  }

  .day-event-chip {
    padding: 6px 8px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .ghost-btn,
  .submit-btn,
  .delete-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }

  .calendar-hero {
    padding: 20px 16px;
  }

  .calendar-hero h1 {
    font-size: 28px;
  }

  .calendar-hero p {
    font-size: 14px;
  }

  .add-event-btn {
    width: 100%;
  }

  .calendar-toolbar {
    gap: 12px;
    padding: 12px;
    align-items: stretch;
  }

  .calendar-toolbar h2 {
    font-size: 20px;
  }

  .calendar-toolbar__nav {
    width: 100%;
    justify-content: space-between;
  }

  .nav-btn {
    flex: 1;
  }

  .calendar-weekdays {
    display: none;
  }

  .calendar-days {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .calendar-day--empty {
    display: none;
  }

  .calendar-day {
    min-height: 0;
    padding: 12px;
    border-radius: 16px;
  }

  .day-number {
    align-self: flex-start;
    font-size: 18px;
  }

  .day-events-preview {
    margin-top: 8px;
  }

  .day-event-chip {
    padding: 8px 10px;
  }

  .modal-overlay {
    align-items: flex-start;
    overflow-y: auto;
    padding: 12px;
  }

  .modal {
    margin: 24px 0;
    padding: 20px 14px;
    border-radius: 18px;
  }

  .modal-header,
  .target-users__header {
    flex-direction: column;
    align-items: stretch;
  }

  .event-card {
    padding: 16px;
  }

  .event-card h3 {
    font-size: 18px;
  }
}

@media (max-width: 360px) {
  .container {
    padding: 0 10px;
  }

  .calendar-hero,
  .calendar-toolbar,
  .modal {
    padding-left: 12px;
    padding-right: 12px;
  }

  .calendar-hero h1 {
    font-size: 24px;
  }

  .calendar-toolbar h2,
  .modal-header h2 {
    font-size: 18px;
  }

  .calendar-day,
  .event-card {
    padding: 12px;
  }

  .form-group input,
  .form-group select,
  .form-group textarea,
  .day-event-chip__title,
  .ghost-btn,
  .submit-btn,
  .delete-btn {
    font-size: 13px;
  }
}
</style>
