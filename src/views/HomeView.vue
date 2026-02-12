<template>
  <div class="home">
    <!-- Синяя полоска приветствия -->
    <div class="welcome-banner">
      <h2>Здравствуйте, Ибраим</h2>
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
          <div class="news-grid">
            <div v-for="news in newsItems" :key="news.id" class="news-card">
              <img :src="news.image" :alt="news.title" class="news-img" />
              <div class="news-body">
                <h3>{{ news.title }}</h3>
                <span class="news-date">{{ news.date }}</span>
              </div>
              <div class="news-footer">
                <span>👁 {{ news.views }}</span>
                <button
                  @click="toggleLike(news.id)"
                  class="like-btn"
                  :class="{ liked: news.liked }"
                >
                  ❤️ {{ news.likes }}
                </button>
              </div>
            </div>
          </div>
          <button class="all-news-btn">Все новости →</button>

          <!-- Статистика -->
          <div class="stats">
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
              ><span>Сотрудника</span>
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
              <button class="btn secondary">Подробнее</button>
            </div>
            <div class="announcement-card">
              <h3>Новые правила безопасности</h3>
              <p>
                В связи с последними событиями, мы обновляем правила безопасности. Ознакомьтесь с
                новыми инструкциями.
              </p>
              <button class="btn secondary">Подробнее</button>
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
          <div class="event">📌 Собрание отдела продаж</div>
          <div class="event">🎉 День рождения компании</div>
          <div class="event">📚 Обучение по 1С</div>
          <div class="event">📅 Планерка на неделю</div>
          <div class="event">🎯 Корпоративный тренинг</div>
          <button class="btn secondary events-btn">Все события →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Импортируем изображения
import goneCompani from '@/assets/images/gone_compani.png'
import toCompani from '@/assets/images/to_compani.png'

export default {
  name: 'HomeView',
  data() {
    return {
      newsItems: [
        {
          id: 1,
          image: goneCompani, // Используем импортированное изображение
          title: 'Компания получила крупный контракт',
          date: '25 мая 2023',
          views: 245,
          likes: 18,
          liked: false,
        },
        {
          id: 2,
          image: toCompani, // Используем импортированное изображение
          title: 'Запущен новый онлайн-сервис',
          date: '12 мая 2023',
          views: 132,
          likes: 9,
          liked: false,
        },
      ],
      stats: {
        news: 24,
        documents: 156,
        employees: 82,
      },
    }
  },
  mounted() {
    this.loadLikes()
  },
  methods: {
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
.events-btn {
  margin-top: 24px; /* Отступ сверху */
  width: 100%; /* На всю ширину */
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

.all-news-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-top: 8px;
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
  width: 160px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat strong {
  font-size: 24px;
  display: block;
  color: #1976d2;
  margin: 8px 0 4px;
}

.stat span {
  font-size: 12px;
  color: #6b7280;
}

/* Важные объявления */
.announcements {
  margin-top: 32px;
}

.announcement-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 4px solid #2563eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.announcement-card h3 {
  font-size: 16px;
  margin: 0 0 8px;
}

.announcement-card p {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 12px;
}

/* Отзывы сотрудников */
.reviews {
  margin-top: 32px;
}

.review-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 4px solid #f59e0b;
  font-style: italic;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Правая колонка */
.right-col {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.right-col h2 {
  font-size: 18px;
  margin-bottom: 20px;
}

.event {
  height: 48px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  padding-left: 10px;
}

/* Кнопки */
.btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}

.btn.secondary {
  background: #e5e7eb;
  color: #111827;
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
  }

  .stat {
    width: 100%;
  }
}
</style>
