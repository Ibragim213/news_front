<template>
  <div v-if="isAuthenticated" class="home-page-old">
    <div class="home-page-old__container">
      <section class="home-page-old__banner">
        <h2>Здравствуйте, {{ userFullName || userUsername || 'Гость' }}</h2>
        <p>Вот что происходит в компании сегодня</p>
      </section>

      <div class="home-page-old__layout">
        <main class="home-page-old__main">
          <section class="home-page-old__section">
            <div class="home-page-old__section-header">
              <h2>Последние новости</h2>
            </div>

            <div v-if="loading.news" class="home-page-old__news-grid">
              <div v-for="n in 2" :key="n" class="home-page-old__loading-card">Загрузка новостей...</div>
            </div>

            <div v-else-if="newsItems.length > 0" class="home-page-old__news-grid">
              <article
                v-for="news in newsItems"
                :key="news.id"
                class="home-page-old__news-card"
                @click="openNews(news.id)"
              >
                <div class="home-page-old__news-link">
                  <img :src="news.image || defaultNewsImage" :alt="news.title" class="home-page-old__news-image" />
                  <div class="home-page-old__news-body">
                    <h3>{{ news.title }}</h3>
                    <span>{{ formatDate(news.createdAt || news.date) }}</span>
                  </div>
                  <div class="home-page-old__news-footer">
                    <span>Просмотры: {{ news.views || 0 }}</span>
                    <button
                      class="home-page-old__like-btn"
                      :class="{ 'is-liked': news.liked }"
                      @click.stop="toggleLike(news.id)"
                    >
                      ❤ {{ news.likes || 0 }}
                    </button>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="home-page-old__empty-state">Нет новостей для отображения</div>

            <button class="home-page-old__link-btn" @click="goToNews">Все новости →</button>
          </section>

          <section class="home-page-old__stats" v-if="loading.stats">
            <div v-for="n in 3" :key="n" class="home-page-old__stat-card home-page-old__stat-card--loading">
              Загрузка статистики...
            </div>
          </section>

          <section v-else class="home-page-old__stats">
            <article class="home-page-old__stat-card">
              <div class="home-page-old__stat-icon">📰</div>
              <strong>{{ stats.news }}</strong>
              <span>Новостей</span>
            </article>

            <article class="home-page-old__stat-card">
              <div class="home-page-old__stat-icon">📄</div>
              <strong>{{ stats.documents }}</strong>
              <span>Документов</span>
            </article>

            <article class="home-page-old__stat-card">
              <div class="home-page-old__stat-icon">👥</div>
              <strong>{{ stats.employees }}</strong>
              <span>Сотрудников</span>
            </article>
          </section>

          <section class="home-page-old__section">
            <div class="home-page-old__section-header">
              <h2>Важные объявления</h2>
            </div>

            <article class="home-page-old__info-card home-page-old__info-card--blue">
              <h3>Обновление корпоративной политики</h3>
              <p>
                Уважаемые сотрудники, с 1 июня вступают в силу изменения в корпоративной политике.
                Пожалуйста, ознакомьтесь с новыми правилами.
              </p>
            </article>

            <article class="home-page-old__info-card home-page-old__info-card--blue">
              <h3>Новые правила безопасности</h3>
              <p>
                В связи с последними событиями, мы обновили внутренние правила безопасности.
                Ознакомьтесь с новыми инструкциями.
              </p>
            </article>
          </section>

          <section class="home-page-old__section">
            <div class="home-page-old__section-header">
              <h2>Отзывы сотрудников</h2>
            </div>

            <article class="home-page-old__info-card home-page-old__info-card--gold">
              <p>"Отличная команда, всегда готовы помочь!"</p>
              <span>Анна, менеджер по продажам</span>
            </article>

            <article class="home-page-old__info-card home-page-old__info-card--gold">
              <p>"Работаю здесь уже 5 лет и каждый день радуюсь, что выбрал эту компанию."</p>
              <span>Дмитрий, разработчик</span>
            </article>
          </section>
        </main>

        <aside class="home-page-old__sidebar">
          <section class="home-page-old__events-card">
            <h2>Ближайшие события</h2>

            <div v-if="loading.events" class="home-page-old__event-loading">Загрузка событий...</div>

            <template v-else-if="events.length > 0">
              <div v-for="event in events" :key="event.id" class="home-page-old__event-item">
                <div class="home-page-old__event-date">
                  <strong>{{ formatEventDate(event.eventDate) }}</strong>
                  <span>{{ formatEventTime(event.eventTime) }}</span>
                </div>
                <div class="home-page-old__event-copy">
                  <strong>{{ event.title }}</strong>
                  <span>{{ event.audienceLabel }}</span>
                </div>
              </div>
            </template>

            <div v-else class="home-page-old__empty-state">Нет ближайших событий</div>

            <button class="home-page-old__secondary-btn home-page-old__events-btn" @click="goToCalendar">
              Все события →
            </button>
          </section>
        </aside>
      </div>
    </div>
  </div>

  <div v-else class="home-page-old__guest">
    <h2>Войдите в аккаунт</h2>
    <p>После входа будут доступны новости, документы, сотрудники и календарь.</p>
    <button class="home-page-old__login-btn" @click="$router.push('/login')">Перейти ко входу</button>
  </div>
</template>

<script>
import axios from 'axios'
import { fetchPublicCalendarEvents, formatCalendarEventDate, formatCalendarEventTime } from '@/services/calendar'
import { fetchNews, formatNewsDate, toggleNewsLike } from '@/services/news'
import goneCompani from '@/assets/images/gone_compani.png'
import toCompani from '@/assets/images/to_compani.png'

const API_BASE_URL = 'http://localhost:8080/api'

export default {
  name: 'HomeView',
  data() {
    return {
      isAuthenticated: false,
      userUsername: '',
      userFullName: '',
      newsItems: [],
      events: [],
      stats: {
        news: 0,
        documents: 0,
        employees: 0,
      },
      loading: {
        news: true,
        stats: true,
        events: true,
      },
      defaultNewsImage: goneCompani,
    }
  },
  mounted() {
    this.loadSession()
    window.addEventListener('user-updated', this.loadSession)
    window.addEventListener('events-updated', this.loadEvents)
  },
  beforeUnmount() {
    window.removeEventListener('user-updated', this.loadSession)
    window.removeEventListener('events-updated', this.loadEvents)
  },
  methods: {
    async safeGet(path, fallbackValue) {
      const token = localStorage.getItem('token')

      try {
        const response = await axios.get(`${API_BASE_URL}${path}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          validateStatus: () => true,
        })

        return response.status === 200 ? response.data : fallbackValue
      } catch (error) {
        return fallbackValue
      }
    },
    loadSession() {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (!token || !userStr) {
        this.isAuthenticated = false
        this.userUsername = ''
        this.userFullName = ''
        return
      }

      try {
        const userData = JSON.parse(userStr)
        this.userUsername = userData.username || ''
        this.userFullName = userData.fullName || ''
        this.isAuthenticated = true
        this.loadDashboard()
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        this.isAuthenticated = false
      }
    },

    async loadDashboard() {
      await Promise.all([this.loadNews(), this.loadStats(), this.loadEvents()])
    },

    async loadNews() {
      this.loading.news = true

      try {
        const items = await fetchNews(2)
        this.newsItems = items.map((news) => ({
          ...news,
          image: news.imageUrl || (news.id % 2 === 0 ? toCompani : goneCompani),
        }))
      } catch (error) {
        console.error('Error loading news:', error)
        this.newsItems = []
      } finally {
        this.loading.news = false
      }
    },

    async loadStats() {
      this.loading.stats = true

      try {
        const [newsData, docsData, employeesData] = await Promise.all([
          this.safeGet('/news', []),
          this.safeGet('/documents', []),
          this.safeGet('/employees', []),
        ])

        this.stats = {
          news: Array.isArray(newsData) ? newsData.length : 0,
          documents: Array.isArray(docsData) ? docsData.length : 0,
          employees: Array.isArray(employeesData) ? employeesData.length : 0,
        }
      } catch (error) {
        console.error('Error loading stats:', error)
        this.stats = {
          news: 0,
          documents: 0,
          employees: 0,
        }
      } finally {
        this.loading.stats = false
      }
    },

    async loadEvents() {
      this.loading.events = true

      try {
        this.events = await fetchPublicCalendarEvents(5)
      } catch (error) {
        console.error('Error loading events:', error)
        this.events = []
      } finally {
        this.loading.events = false
      }
    },

    async toggleLike(newsId) {
      try {
        const updatedNews = await toggleNewsLike(newsId)
        this.newsItems = this.newsItems.map((news) =>
          news.id === newsId
            ? {
                ...updatedNews,
                image: news.image,
              }
            : news,
        )
      } catch (error) {
        console.error('Error toggling like:', error)
      }
    },

    openNews(newsId) {
      this.$router.push(`/news/${newsId}`)
    },

    formatDate(dateString) {
      return formatNewsDate(dateString)
    },

    formatEventDate(eventDate) {
      return formatCalendarEventDate(eventDate, {
        day: 'numeric',
        month: 'short',
      })
    },

    formatEventTime(eventTime) {
      return formatCalendarEventTime(eventTime)
    },

    goToNews() {
      this.$router.push('/news')
    },

    goToCalendar() {
      this.$router.push('/calendar')
    },
  },
}
</script>

<style scoped>
.home-page-old {
  min-height: calc(100vh - 72px);
  background: #ececec;
  padding: 20px 0 36px;
}

.home-page-old__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.home-page-old__banner {
  min-height: 140px;
  margin-bottom: 26px;
  padding: 28px 36px;
  border-radius: 26px;
  background: linear-gradient(135deg, #3c6be0 0%, #2d62db 100%);
  color: #fff;
  box-shadow: 0 18px 40px rgba(60, 107, 224, 0.2);
}

.home-page-old__banner h2 {
  margin: 0 0 10px;
  font-size: 34px;
  font-weight: 700;
}

.home-page-old__banner p {
  margin: 0;
  font-size: 16px;
  opacity: 0.92;
}

.home-page-old__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 28px;
}

.home-page-old__main {
  min-width: 0;
}

.home-page-old__section {
  margin-bottom: 28px;
}

.home-page-old__section-header {
  margin-bottom: 16px;
}

.home-page-old__section-header h2 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #101828;
}

.home-page-old__news-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.home-page-old__news-card {
  min-width: 0;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
}

.home-page-old__news-link {
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  display: block;
}

.home-page-old__news-image {
  width: 100%;
  height: 190px;
  object-fit: cover;
  display: block;
}

.home-page-old__news-body {
  padding: 16px 16px 10px;
}

.home-page-old__news-body h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: #101828;
}

.home-page-old__news-body span {
  font-size: 13px;
  color: #667085;
}

.home-page-old__news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 16px;
  font-size: 13px;
  color: #667085;
}

.home-page-old__like-btn {
  border: none;
  border-radius: 999px;
  background: #f2f4f7;
  color: #344054;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  cursor: pointer;
}

.home-page-old__like-btn.is-liked {
  background: #fee4e2;
  color: #d92d20;
}

.home-page-old__link-btn {
  margin-top: 14px;
  border: none;
  background: transparent;
  color: #3c6be0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.home-page-old__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.home-page-old__stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 16px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
}

.home-page-old__stat-card strong {
  display: block;
  margin: 10px 0 4px;
  font-size: 28px;
  color: #3c6be0;
}

.home-page-old__stat-card span {
  font-size: 14px;
  color: #667085;
}

.home-page-old__stat-icon {
  font-size: 22px;
}

.home-page-old__stat-card--loading,
.home-page-old__loading-card {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #98a2b3;
}

.home-page-old__loading-card {
  min-height: 300px;
}

.home-page-old__info-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
}

.home-page-old__info-card--blue {
  border-left: 4px solid #3c6be0;
}

.home-page-old__info-card--gold {
  border-left: 4px solid #f59e0b;
}

.home-page-old__info-card h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #101828;
}

.home-page-old__info-card p {
  margin: 0 0 12px;
  font-size: 15px;
  line-height: 1.6;
  color: #475467;
}

.home-page-old__info-card p:last-child {
  margin-bottom: 0;
}

.home-page-old__info-card span {
  font-size: 14px;
  color: #667085;
}

.home-page-old__secondary-btn,
.home-page-old__login-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.home-page-old__secondary-btn {
  background: #e4e7ec;
  color: #344054;
}

.home-page-old__sidebar {
  min-width: 0;
}

.home-page-old__events-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px 20px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
  position: sticky;
  top: 92px;
}

.home-page-old__events-card h2 {
  margin: 0 0 18px;
  font-size: 26px;
  color: #101828;
}

.home-page-old__event-item {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #eaecf0;
}

.home-page-old__event-date {
  display: grid;
  gap: 4px;
  align-content: start;
}

.home-page-old__event-date strong {
  color: #101828;
  font-size: 13px;
  font-weight: 800;
}

.home-page-old__event-date span {
  color: #667085;
  font-size: 12px;
  font-weight: 600;
}

.home-page-old__event-copy {
  display: grid;
  gap: 6px;
}

.home-page-old__event-copy strong {
  color: #101828;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
}

.home-page-old__event-copy span {
  color: #667085;
  font-size: 12px;
  font-weight: 600;
}

.home-page-old__events-btn {
  width: 100%;
  margin-top: 18px;
}

.home-page-old__event-loading,
.home-page-old__empty-state {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f9fafb;
  color: #98a2b3;
  font-size: 14px;
}

.home-page-old__guest {
  min-height: calc(100vh - 72px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: #ececec;
  padding: 24px;
  text-align: center;
}

.home-page-old__guest h2 {
  margin: 0;
  font-size: 34px;
  color: #101828;
}

.home-page-old__guest p {
  max-width: 520px;
  margin: 0;
  font-size: 16px;
  color: #475467;
}

.home-page-old__login-btn {
  background: #3c6be0;
  color: #fff;
}

@media (max-width: 1100px) {
  .home-page-old__layout {
    grid-template-columns: 1fr;
  }

  .home-page-old__events-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .home-page-old__container {
    padding: 0 16px;
  }

  .home-page-old__banner {
    padding: 24px 20px;
  }

  .home-page-old__banner h2 {
    font-size: 28px;
  }

  .home-page-old__section-header h2 {
    font-size: 26px;
  }

  .home-page-old__news-grid,
  .home-page-old__stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .home-page-old__container {
    padding: 0 12px;
  }

  .home-page-old__banner {
    min-height: 0;
    padding: 20px 16px;
  }

  .home-page-old__banner h2 {
    font-size: 24px;
    line-height: 1.25;
  }

  .home-page-old__banner p {
    font-size: 14px;
  }

  .home-page-old__section,
  .home-page-old__events-card {
    padding: 20px 16px;
  }

  .home-page-old__section-header h2,
  .home-page-old__events-card h2 {
    font-size: 22px;
  }

  .home-page-old__news-image {
    height: 170px;
  }

  .home-page-old__news-body {
    padding: 14px 14px 10px;
  }

  .home-page-old__news-body h3 {
    font-size: 18px;
  }

  .home-page-old__news-footer {
    flex-wrap: wrap;
    padding: 12px 14px 14px;
  }

  .home-page-old__stat-card {
    padding: 16px 14px;
  }

  .home-page-old__stat-icon {
    font-size: 24px;
  }

  .home-page-old__info-card {
    padding: 16px;
  }

  .home-page-old__info-card h3 {
    font-size: 18px;
  }

  .home-page-old__info-card p {
    font-size: 14px;
  }

  .home-page-old__event-item {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .home-page-old__event-date {
    grid-auto-flow: column;
    justify-content: space-between;
    align-items: center;
  }

  .home-page-old__secondary-btn,
  .home-page-old__events-btn,
  .home-page-old__link-btn,
  .home-page-old__login-btn {
    width: 100%;
  }

  .home-page-old__guest h2 {
    font-size: 26px;
  }

  .home-page-old__guest p {
    font-size: 14px;
  }
}

@media (max-width: 360px) {
  .home-page-old__container {
    padding: 0 10px;
  }

  .home-page-old__banner,
  .home-page-old__section,
  .home-page-old__events-card {
    padding: 18px 14px;
  }

  .home-page-old__banner h2,
  .home-page-old__guest h2 {
    font-size: 22px;
  }

  .home-page-old__section-header h2,
  .home-page-old__events-card h2 {
    font-size: 20px;
  }

  .home-page-old__news-body h3 {
    font-size: 17px;
  }

  .home-page-old__news-footer,
  .home-page-old__event-copy strong,
  .home-page-old__info-card p,
  .home-page-old__guest p {
    font-size: 13px;
  }
}
</style>
