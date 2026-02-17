<template>
  <div class="calendar-view">
    <!-- Основной контент -->
    <div class="container">
      <div class="calendar-header">
        <h1>Календарь</h1>
        <button class="add-event-btn" @click="showAddEventModal = true">Добавить событие</button>
      </div>

      <div class="calendar-controls">
        <div class="month-navigation">
          <button class="nav-btn" @click="prevMonth">←</button>
          <button class="nav-btn" @click="prevYear">❮❮</button>
        </div>

        <h2>{{ currentMonthName }} {{ currentYear }}</h2>

        <div class="month-navigation">
          <button class="nav-btn" @click="nextYear">❯❯</button>
          <button class="nav-btn" @click="nextMonth">→</button>
        </div>
      </div>

      <div class="calendar-weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
      </div>

      <div class="calendar-days">
        <div v-for="day in emptyDays" :key="'empty-' + day" class="calendar-day empty"></div>

        <div
          v-for="day in daysInMonth"
          :key="day.date"
          class="calendar-day"
          :class="{ 'has-event': day.hasEvent, today: day.isToday }"
          @click="selectDay(day)"
        >
          <div class="day-number">{{ day.date.getDate() }}</div>
          <div v-if="day.events.length > 0" class="event-block">
            <div class="event-item" v-for="(event, index) in day.events.slice(0, 1)" :key="index">
              {{ truncateTitle(event.title) }}
            </div>
            <div v-if="day.events.length > 1" class="more-events">+{{ day.events.length - 1 }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для добавления события -->
    <div v-if="showAddEventModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>Добавить событие</h2>
        <form @submit.prevent="addEvent" class="event-form">
          <div class="form-group">
            <label for="event-title">Название события</label>
            <input type="text" id="event-title" v-model="newEvent.title" required />
          </div>

          <div class="form-group">
            <label for="event-date">Дата</label>
            <input type="date" id="event-date" v-model="newEvent.date" required />
          </div>

          <div class="form-group">
            <label for="event-time">Время</label>
            <input type="time" id="event-time" v-model="newEvent.time" />
          </div>

          <div class="form-group">
            <label for="event-description">Описание</label>
            <textarea id="event-description" v-model="newEvent.description" rows="3"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeModal">Отмена</button>
            <button type="submit" class="publish-btn">Сохранить</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно для просмотра событий дня -->
    <div v-if="showDayEventsModal" class="modal-overlay" @click.self="closeDayEventsModal">
      <div class="modal day-events-modal">
        <h2>
          События на
          {{ selectedDay.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) }}
        </h2>

        <div v-if="selectedDay.events.length === 0" class="no-events">Нет событий на этот день</div>

        <div v-else class="events-list">
          <div v-for="(event, index) in selectedDay.events" :key="index" class="event-item-full">
            <div class="event-time">{{ formatEventTime(event) }}</div>
            <div class="event-title">{{ event.title }}</div>
            <div class="event-description">{{ event.description }}</div>
            <button class="delete-event" @click.stop="deleteEvent(index)">Удалить</button>
          </div>
        </div>

        <div class="modal-actions">
          <button class="close-btn" @click="closeDayEventsModal">Закрыть</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalendarView',
  data() {
    return {
      currentDate: new Date(),
      weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      showAddEventModal: false,
      showDayEventsModal: false,
      selectedDay: null,
      newEvent: {
        title: '',
        date: '',
        time: '',
        description: '',
      },
      events: JSON.parse(localStorage.getItem('calendarEvents')) || {},
    }
  },
  computed: {
    currentMonthName() {
      return this.currentDate.toLocaleString('ru-RU', { month: 'long' })
    },
    currentYear() {
      return this.currentDate.getFullYear()
    },
    daysInMonth() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      const days = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i)
        const dateKey = date.toISOString().split('T')[0]

        const day = {
          date: new Date(date),
          dateKey: dateKey,
          isToday: date.toDateString() === today.toDateString(),
          hasEvent: this.events[dateKey] && this.events[dateKey].length > 0,
          events: this.events[dateKey] || [],
        }

        days.push(day)
      }

      return days
    },
    emptyDays() {
      const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1)
      return (firstDay.getDay() === 0 ? 7 : firstDay.getDay()) - 1
    },
  },
  methods: {
    truncateTitle(title) {
      if (title.length > 12) {
        return title.substring(0, 12) + '...'
      }
      return title
    },
    prevMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1,
      )
    },
    nextMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1,
      )
    },
    prevYear() {
      this.currentDate = new Date(
        this.currentDate.getFullYear() - 1,
        this.currentDate.getMonth(),
        1,
      )
    },
    nextYear() {
      this.currentDate = new Date(
        this.currentDate.getFullYear() + 1,
        this.currentDate.getMonth(),
        1,
      )
    },
    selectDay(day) {
      this.selectedDay = day
      this.showDayEventsModal = true
    },
    closeModal() {
      this.showAddEventModal = false
      this.newEvent = {
        title: '',
        date: '',
        time: '',
        description: '',
      }
    },
    closeDayEventsModal() {
      this.showDayEventsModal = false
      this.selectedDay = null
    },
    formatEventTime(event) {
      if (event.time) {
        return event.time
      }
      return 'Весь день'
    },
    addEvent() {
      if (!this.newEvent.title || !this.newEvent.date) {
        alert('Пожалуйста, заполните название и дату события')
        return
      }

      const dateKey = this.newEvent.date
      if (!this.events[dateKey]) {
        this.events[dateKey] = []
      }

      this.events[dateKey].push({
        title: this.newEvent.title,
        time: this.newEvent.time,
        description: this.newEvent.description,
      })

      localStorage.setItem('calendarEvents', JSON.stringify(this.events))
      this.closeModal()
    },
    deleteEvent(index) {
      const dateKey = this.selectedDay.dateKey
      this.selectedDay.events.splice(index, 1)
      this.events[dateKey] = this.selectedDay.events

      if (this.selectedDay.events.length === 0) {
        delete this.events[dateKey]
      }

      localStorage.setItem('calendarEvents', JSON.stringify(this.events))
    },
  },
  mounted() {
    // Устанавливаем текущую дату при загрузке
    this.newEvent.date = new Date().toISOString().split('T')[0]
  },
}
</script>

<style scoped>
/* Основные стили */
.calendar-view {
  background: #f3f4f6;
  min-height: 100vh;
  padding: 20px 0;
  overflow: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header h1 {
  font-size: 24px;
  color: #111827;
  font-weight: 600;
  margin: 0;
}

.add-event-btn {
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-event-btn:hover {
  background: #1d4ed8;
}

/* Элементы управления календарем */
.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.month-navigation {
  display: flex;
  gap: 8px;
}

.calendar-controls h2 {
  font-size: 18px;
  color: #111827;
  font-weight: 600;
  margin: 0 10px;
}

.nav-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #e5e7eb;
}

/* Дни недели */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-weight: 500;
  color: #4b5563;
  padding: 6px;
  font-size: 14px;
}

/* Дни месяца */
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 20px;
}

.calendar-day {
  aspect-ratio: 1;
  min-height: 80px;
  border-radius: 8px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  border: 1px solid #e5e7eb;
  position: relative;
}

.calendar-day.empty {
  background: transparent;
  border: none;
  cursor: default;
}

.calendar-day:hover:not(.empty) {
  background: #f3f4f6;
}

.calendar-day.today {
  background: #e0f2fe;
  border-color: #2563eb;
  font-weight: 600;
}

.day-number {
  margin-bottom: 4px;
  font-weight: 500;
  color: #111827;
  font-size: 14px;
  align-self: flex-end;
}

/* Блоки событий */
.event-block {
  width: 100%;
  margin-top: 4px;
}

.event-item {
  width: 100%;
  padding: 4px 6px;
  background: #bfdbfe;
  color: #1e40af;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.more-events {
  width: 100%;
  padding: 2px 4px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 6px;
  font-size: 10px;
  text-align: center;
}

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin: 0 0 20px;
  font-size: 20px;
  color: #111827;
  font-weight: 600;
}

.event-form {
  overflow: hidden;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: #fafafa;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  background: white;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn,
.close-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover,
.close-btn:hover {
  background: #e5e7eb;
}

.publish-btn {
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.publish-btn:hover {
  background: #1d4ed8;
}

/* События дня */
.day-events-modal {
  max-width: 500px;
}

.no-events {
  text-align: center;
  padding: 20px 0;
  color: #6b7280;
  font-size: 14px;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.event-item-full {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  position: relative;
}

.event-time {
  font-size: 12px;
  color: #2563eb;
  font-weight: 500;
  margin-bottom: 4px;
}

.event-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.event-description {
  font-size: 13px;
  color: #4b5563;
  white-space: pre-line;
}

.delete-event {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: #ef4444;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.delete-event:hover {
  background: #fee2e2;
}

/* Адаптивность */
@media (max-width: 768px) {
  .calendar-weekdays,
  .calendar-days {
    grid-template-columns: repeat(5, 1fr);
  }

  .weekday:nth-child(6),
  .weekday:nth-child(7),
  .calendar-day:nth-child(7n-1),
  .calendar-day:nth-child(7n) {
    display: none;
  }

  .calendar-day {
    min-height: 60px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 10px;
  }

  .calendar-header h1 {
    font-size: 20px;
  }

  .modal {
    width: 95%;
    padding: 16px;
  }
}
</style>
