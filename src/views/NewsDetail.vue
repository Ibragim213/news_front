<template>
  <div class="news-detail">
    <div class="container">
      <div class="news-detail-card">
        <img :src="news.image" alt="News Image" class="news-detail-img" />
        <div class="news-detail-body">
          <h1>{{ news.title }}</h1>
          <div class="news-meta">
            <span class="news-date">{{ news.date }}</span>
            <span class="news-category">{{ news.category }}</span>
          </div>
          <p>{{ news.description }}</p>
          <div class="news-detail-footer">
            <span>👁 {{ news.views }}</span>
            <span @click="toggleLike" :class="{ liked: isLikedByUser(news) }"
              >❤️ {{ news.likes }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import newsImage from '@/assets/images/to_compani.png'

export default {
  name: 'NewsDetail',
  data() {
    return {
      userId: this.getUserId(),
      news: {},
    }
  },
  methods: {
    getUserId() {
      let userId = localStorage.getItem('userId')
      if (!userId) {
        userId = 'user-' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('userId', userId)
      }
      return userId
    },
    isLikedByUser(news) {
      return news.likedBy && news.likedBy.includes(this.userId)
    },
    toggleLike() {
      if (!this.news.likedBy) {
        this.news.likedBy = []
      }
      if (this.news.likedBy.includes(this.userId)) {
        this.news.likes -= 1
        this.news.likedBy = this.news.likedBy.filter((user) => user !== this.userId)
      } else {
        this.news.likes += 1
        this.news.likedBy.push(this.userId)
      }
      this.saveNewsList()
    },
    saveNewsList() {
      const savedNews = localStorage.getItem('newsList')
      let newsList = savedNews ? JSON.parse(savedNews) : []
      const index = newsList.findIndex((item) => item.id === this.news.id)
      if (index !== -1) {
        newsList[index] = this.news
        localStorage.setItem('newsList', JSON.stringify(newsList))
      }
    },
    loadNews() {
      const newsId = parseInt(this.$route.params.id)
      const savedNews = localStorage.getItem('newsList')
      let newsList = savedNews
        ? JSON.parse(savedNews)
        : [
            {
              id: 1,
              image: newsImage,
              title: 'Компания получила крупный контракт',
              description:
                'Мы рады сообщить, что наша компания получила крупный контракт на разработку нового проекта. Это позволит нам расширить команду и улучшить условия труда для наших сотрудников.',
              date: '25 мая 2023',
              views: 245,
              likes: 18,
              likedBy: [],
              category: 'Корпоративные',
            },
            {
              id: 2,
              image: newsImage,
              title: 'Запущен новый онлайн-сервис',
              description:
                'Мы запустили новый онлайн-сервис для наших клиентов, который позволит упростить взаимодействие и сделать работу более эффективной.',
              date: '12 мая 2023',
              views: 132,
              likes: 9,
              likedBy: [],
              category: 'Мероприятия',
            },
            {
              id: 3,
              image: newsImage,
              title: 'Новый офис в Санкт-Петербурге',
              description:
                'Открытие нового офиса в Санкт-Петербурге позволит нам расширить присутствие на рынке и улучшить сервис для наших клиентов.',
              date: '10 мая 2023',
              views: 189,
              likes: 23,
              likedBy: [],
              category: 'Объявления',
            },
          ]

      this.news = newsList.find((news) => news.id === newsId)

      if (this.news) {
        this.news.views += 1
        this.saveNewsList()
      }
    },
  },
  created() {
    this.loadNews()
  },
}
</script>

<style scoped>
.news-detail {
  background: #f3f4f6;
  min-height: 100vh;
  padding: 20px 0;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.news-detail-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.news-detail-img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.news-detail-body {
  padding: 24px;
}

.news-detail-body h1 {
  font-size: 28px;
  margin: 0 0 16px;
}

.news-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #6b7280;
}

.news-detail-body p {
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 24px;
}

.news-detail-footer {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #6b7280;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.news-detail-footer span:last-child {
  cursor: pointer;
}

.news-detail-footer span.liked {
  color: #ef4444;
}
</style>
