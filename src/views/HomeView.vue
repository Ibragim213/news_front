<template>
  <div class="home" v-if="isAuthenticated">
    <!-- Синяя полоска приветствия -->
    <div class="welcome-banner">
      <h2>Здравствуйте, {{ userFullName || userUsername || 'Гость' }}</h2>
      <p>Вот что происходит в компании сегодня</p>
    </div>

    <!-- Основной контент -->
    <div class="container">
      <!-- Две колонки -->
      <div class="content-grid">
        <!-- Левая колонка - Новости -->
        <div class="left-col">
          <div class="news-header">
            <h2>Последние новости</h2>
          </div>

          <!-- Новости -->
          <div class="news-grid" v-if="loading.news">
            <div class="loading-card" v-for="n in 2" :key="n">Загрузка новостей...</div>
          </div>
          <div v-else-if="newsItems.length > 0" class="news-grid">
            <div v-for="news in newsItems" :key="news.id" class="news-card">
              <img :src="news.image || defaultNewsImage" :alt="news.title" class="news-img" />
              <div class="news-body">
                <h3>{{ news.title }}</h3>
                <span class="news-date">{{ formatDate(news.createdAt || news.date) }}</span>
              </div>
              <div class="news-footer">
                <span>👁 {{ news.views || 0 }}</span>
                <button
                  @click="toggleLike(news.id)"
                  class="like-btn"
                  :class="{ liked: news.liked }"
                >
                  ❤️ {{ news.likes || 0 }}
                </button>
              </div>
            </div>
          </div>
          <div v-else class="no-news">
            <p>Нет новостей для отображения</p>
          </div>
          <button class="all-news-btn" @click="goToNews">Все новости →</button>

          <!-- Статистика -->
          <div class="stats" v-if="loading.stats">
            <div class="stat" v-for="n in 3" :key="n">Загрузка статистики...</div>
          </div>
          <div v-else class="stats">
            <div class="stat">
              📰<br /><strong>{{ stats.news }}</strong
              ><span>Новостей</span>
            </div>
            <div class="stat">
              📄<br /><strong>{{ stats.documents }}</strong
              ><span>Документов</span>
            </div>
            <div class="stat">
              👥<br /><strong>{{ stats.employees }}</strong
              ><span>Сотрудников</span>
            </div>
          </div>

          <!-- Важные объявления -->
          <div class="announcements">
            <h2>Важные объявления</h2>
            <div class="announcement-card">
              <h3>Обновление корпоративной политики</h3>
              <p>
                Уважаемые сотрудники, с 1 июня вступают в силу изменения в корпоративной политике.
                Пожалуйста, ознакомьтесь с новыми правилами.
              </p>
              <button class="detail-btn">Подробнее</button>
            </div>
            <div class="announcement-card">
              <h3>Новые правила безопасности</h3>
              <p>
                В связи с последними событиями, мы обновляем правила безопасности. Ознакомьтесь с
                новыми инструкциями.
              </p>
              <button class="detail-btn">Подробнее</button>
            </div>
          </div>

          <!-- Отзывы сотрудников -->
          <div class="reviews">
            <h2>Отзывы сотрудников</h2>
            <div class="review-card">
              <p>"Отличная команда, всегда готовы помочь!"</p>
              <span>— Анна, менеджер по продажам</span>
            </div>
            <div class="review-card">
              <p>"Работаю здесь уже 5 лет и каждый день радуюсь, что выбрал эту компанию."</p>
              <span>— Дмитрий, разработчик</span>
            </div>
          </div>
        </div>

        <!-- Правая колонка - События -->
        <div class="right-col">
          <h2>Ближайшие события</h2>
          <div v-if="loading.events" class="event-loading">Загрузка событий...</div>
          <template v-else-if="events.length > 0">
            <div v-for="event in events" :key="event.id" class="event">
              {{ event.icon || '📅' }} {{ event.title }}
            </div>
          </template>
          <div v-else class="no-events">
            <p>Нет ближайших событий</p>
          </div>
          <button class="events-btn" @click="goToCalendar">Все события →</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Экран загрузки/редиректа -->
  <div v-else class="loading-screen">
    <h2>Проверка авторизации...</h2>
    <p>{{ debugMessage }}</p>
    <button v-if="!hasToken" @click="forceLogin" class="debug-btn">
      🔓 Принудительный вход (тест)
    </button>
  </div>
</template>

<script>
import api from '@/services/api'
import goneCompani from '@/assets/images/gone_compani.png'
import toCompani from '@/assets/images/to_compani.png'

export default {
  name: 'HomeView',
  data() {
    return {
      isAuthenticated: false,
      userUsername: '',
      userFullName: '',
      userRole: '',
      hasToken: false,
      debugMessage: 'Проверка авторизации...',
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
    console.log('🔍 HomeView mounted')
    this.checkAuth()
  },
  methods: {
    checkAuth() {
      console.log('🔍 Checking authentication...')

      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      this.hasToken = !!token

      console.log('📦 Token:', token ? '✅ есть' : '❌ нет')
      console.log('📦 User:', userStr ? '✅ есть' : '❌ нет')

      if (!token || !userStr) {
        console.log('❌ No token or user, showing debug screen')
        this.debugMessage = 'Нет данных авторизации. Нажмите кнопку для тестового входа.'
        return
      }

      try {
        const userData = JSON.parse(userStr)
        console.log('✅ User data:', userData)

        this.userUsername = userData.username || ''
        this.userFullName = userData.fullName || ''
        this.userRole = userData.role || ''
        this.isAuthenticated = true
        this.debugMessage = '✅ Авторизация успешна, загружаем данные...'

        // Загружаем данные
        this.loadNews()
        this.loadStats()
        this.loadEvents()
      } catch (e) {
        console.error('❌ Error parsing user data:', e)
        this.debugMessage = 'Ошибка парсинга данных пользователя'
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },

    async loadNews() {
      this.loading.news = true
      try {
        console.log('📰 Loading news...')
        const response = await api.get('/news?limit=2')
        console.log('📰 News response:', response.data)

        if (response.data && response.data.length > 0) {
          this.newsItems = response.data.map((news) => ({
            ...news,
            image: news.imageUrl || (news.id % 2 === 0 ? toCompani : goneCompani),
            liked: false,
          }))
        } else {
          // Демо-данные если нет новостей
          this.newsItems = [
            {
              id: 1,
              image: goneCompani,
              title: 'Компания получила крупный контракт',
              date: new Date(2023, 4, 25).toISOString(),
              views: 245,
              likes: 18,
              liked: false,
            },
            {
              id: 2,
              image: toCompani,
              title: 'Запущен новый онлайн-сервис',
              date: new Date(2023, 4, 12).toISOString(),
              views: 132,
              likes: 9,
              liked: false,
            },
          ]
        }
        this.loadLikes()
      } catch (error) {
        console.error('❌ Error loading news:', error)
        // Показываем демо-данные при ошибке
        this.newsItems = [
          {
            id: 1,
            image: goneCompani,
            title: 'Компания получила крупный контракт',
            date: new Date(2023, 4, 25).toISOString(),
            views: 245,
            likes: 18,
            liked: false,
          },
          {
            id: 2,
            image: toCompani,
            title: 'Запущен новый онлайн-сервис',
            date: new Date(2023, 4, 12).toISOString(),
            views: 132,
            likes: 9,
            liked: false,
          },
        ]
      } finally {
        this.loading.news = false
      }
    },

    async loadStats() {
      this.loading.stats = true
      try {
        console.log('📊 Loading stats...')

        // Получаем все данные и считаем их длину
        const [newsRes, docsRes, employeesRes] = await Promise.all([
          api.get('/news').catch(() => ({ data: [] })),
          api.get('/documents').catch(() => ({ data: [] })),
          api.get('/employees').catch(() => ({ data: [] })),
        ])

        this.stats = {
          news: newsRes.data?.length || 24,
          documents: docsRes.data?.length || 156,
          employees: employeesRes.data?.length || 82,
        }

        console.log('📊 Stats:', this.stats)
      } catch (error) {
        console.error('❌ Error loading stats:', error)
        this.stats = {
          news: 24,
          documents: 156,
          employees: 82,
        }
      } finally {
        this.loading.stats = false
      }
    },

    async loadEvents() {
      this.loading.events = true
      try {
        console.log('📅 Loading events...')
        // ✅ ИСПРАВЛЕНО: используем правильный URL /calendar/events
        const response = await api.get('/calendar/events?limit=5')
        console.log('📅 Events response:', response.data)

        if (response.data && response.data.length > 0) {
          this.events = response.data
        } else {
          this.events = [
            { id: 1, icon: '📌', title: 'Собрание отдела продаж' },
            { id: 2, icon: '🎉', title: 'День рождения компании' },
            { id: 3, icon: '📚', title: 'Обучение по 1С' },
            { id: 4, icon: '📅', title: 'Планерка на неделю' },
            { id: 5, icon: '🎯', title: 'Корпоративный тренинг' },
          ]
        }
      } catch (error) {
        console.error('❌ Error loading events:', error)
        this.events = [
          { id: 1, icon: '📌', title: 'Собрание отдела продаж' },
          { id: 2, icon: '🎉', title: 'День рождения компании' },
          { id: 3, icon: '📚', title: 'Обучение по 1С' },
          { id: 4, icon: '📅', title: 'Планерка на неделю' },
          { id: 5, icon: '🎯', title: 'Корпоративный тренинг' },
        ]
      } finally {
        this.loading.events = false
      }
    },

    toggleLike(newsId) {
      const news = this.newsItems.find((item) => item.id === newsId)
      if (news) {
        if (news.liked) {
          news.likes--
          news.liked = false
        } else {
          news.likes++
          news.liked = true
        }
        this.saveLikes()
        // Отправляем лайк на сервер (если есть такой эндпоинт)
        api.post(`/news/${newsId}/like`, { liked: news.liked }).catch(() => {})
      }
    },

    saveLikes() {
      const likesData = this.newsItems.map((item) => ({
        id: item.id,
        likes: item.likes,
        liked: item.liked,
      }))
      localStorage.setItem('newsLikes', JSON.stringify(likesData))
    },

    loadLikes() {
      const savedLikes = localStorage.getItem('newsLikes')
      if (savedLikes) {
        const likesData = JSON.parse(savedLikes)
        this.newsItems = this.newsItems.map((news) => {
          const saved = likesData.find((item) => item.id === news.id)
          if (saved) {
            return {
              ...news,
              likes: saved.likes,
              liked: saved.liked,
            }
          }
          return news
        })
      }
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    },

    goToNews() {
      this.$router.push('/news')
    },

    goToCalendar() {
      this.$router.push('/calendar')
    },

    forceLogin() {
      console.log('🔐 Force login with test user')
      const testUser = {
        id: 1,
        username: 'admin',
        fullName: 'Тестовый Администратор',
        role: 'ADMIN',
        email: 'admin@example.com',
        position: 'Администратор системы',
      }
      localStorage.setItem('user', JSON.stringify(testUser))
      localStorage.setItem('token', 'test-token-12345')
      this.checkAuth()
    },
  },
}
</script>

<style scoped>
/* Синяя полоска приветствия */
.welcome-banner {
  background: #1976d2;
  color: white;
  padding: 20px;
  width: 1280px;
  height: 140px;
  border-radius: 25px;
  margin: 16px auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.welcome-banner h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.welcome-banner p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

/* Основной контент */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Сетка */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}

/* Левая колонка */
.left-col {
  width: 100%;
}

/* Новости */
.news-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.news-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.news-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.news-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.news-body {
  padding: 12px;
}

.news-body h3 {
  font-size: 14px;
  margin: 0 0 8px;
}

.news-date {
  font-size: 12px;
  color: #6b7280;
}

.news-footer {
  padding: 8px 12px;
  font-size: 12px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.like-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-btn:hover {
  background-color: #fee2e2;
}

.like-btn.liked {
  color: #ef4444;
  font-weight: bold;
}

/* Кнопка "Все новости" */
.all-news-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-top: 8px;
  transition: color 0.2s ease;
}

.all-news-btn:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Статистика */
.stats {
  display: flex;
  gap: 20px;
  margin-top: 32px;
}

.stat {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  flex: 1;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat strong {
  font-size: 28px;
  display: block;
  color: #1976d2;
  margin: 8px 0 4px;
}

.stat span {
  font-size: 14px;
  color: #6b7280;
}

/* Важные объявления */
.announcements {
  margin-top: 32px;
}

.announcements h2 {
  font-size: 18px;
  margin-bottom: 16px;
}

.announcement-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 4px solid #2563eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.announcement-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.announcement-card h3 {
  font-size: 16px;
  margin: 0 0 8px;
}

.announcement-card p {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 12px;
  line-height: 1.5;
}

/* Кнопка "Подробнее" в объявлениях */
.detail-btn {
  background: #e5e7eb;
  color: #111827;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-btn:hover {
  background: #d1d5db;
}

/* Отзывы сотрудников */
.reviews {
  margin-top: 32px;
}

.reviews h2 {
  font-size: 18px;
  margin-bottom: 16px;
}

.review-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 4px solid #f59e0b;
  font-style: italic;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.review-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.review-card p {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 8px;
  line-height: 1.5;
}

.review-card span {
  font-size: 12px;
  color: #6b7280;
}

/* Правая колонка */
.right-col {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
  transition: transform 0.2s ease;
}

.right-col:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.right-col h2 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #111827;
}

.event {
  height: 48px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  padding-left: 10px;
  color: #4b5563;
  transition: background-color 0.2s ease;
}

.event:hover {
  background-color: #f9fafb;
  cursor: pointer;
}

/* Кнопка "Все события" */
.events-btn {
  margin-top: 24px;
  width: 100%;
  background: #e5e7eb;
  color: #111827;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.events-btn:hover {
  background: #d1d5db;
  transform: translateY(-1px);
}

/* Загрузка */
.loading-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-loading {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  border-bottom: 1px solid #e5e7eb;
}

.no-news,
.no-events {
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 8px;
}

.loading-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 18px;
}

.debug-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.debug-btn:hover {
  background: #059669;
}

/* Адаптив */
@media (max-width: 1300px) {
  .welcome-banner {
    width: calc(100vw - 48px);
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .news-grid {
    grid-template-columns: 1fr;
  }

  .stats {
    flex-direction: column;
    gap: 12px;
  }

  .stat {
    width: 100%;
  }
}

@media (max-width: 320px) {
  .container {
    padding: 0 16px;
  }

  .right-col {
    padding: 20px;
  }
}
</style>
