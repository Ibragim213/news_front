<template>
  <div class="news-view">
    <!-- Основной контент -->
    <div class="container">
      <h1>Новости</h1>

      <!-- Поиск и фильтры -->
      <div class="search-filter">
        <input
          type="text"
          placeholder="Поиск по новостям..."
          class="search-input"
          v-model="searchQuery"
        />
        <select class="category-select" v-model="selectedCategory">
          <option value="">Все категории</option>
          <option value="Корпоративные">Корпоративные</option>
          <option value="Мероприятия">Мероприятия</option>
          <option value="Объявления">Объявления</option>
        </select>
        <button class="add-news-btn" @click="showAddNewsModal = true">Добавить новость</button>
      </div>

      <!-- Карточки новостей -->
      <div class="news-grid">
        <div class="news-card" v-for="(news, index) in filteredNews" :key="index">
          <router-link :to="`/news/${news.id}`">
            <img :src="news.image" alt="News Image" class="news-img" />
            <div class="news-body">
              <h3>{{ news.title }}</h3>
              <p>{{ truncateDescription(news.description) }}</p>
              <span class="news-date">{{ news.date }}</span>
            </div>
            <div class="news-footer">
              <span>👁 {{ news.views }}</span>
              <span
                @click.prevent.stop="toggleLike(news.id)"
                :class="{ liked: isLikedByUser(news) }"
                >❤️ {{ news.likes }}</span
              >
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Модальное окно для добавления новости -->
    <div v-if="showAddNewsModal" class="modal-overlay">
      <div class="modal">
        <h2>Добавить новость</h2>
        <form @submit.prevent="addNews">
          <div class="form-group">
            <label for="news-title">Заголовок</label>
            <input type="text" id="news-title" v-model="newNews.title" required />
          </div>
          <div class="form-group">
            <label for="news-text">Текст новости</label>
            <textarea id="news-text" v-model="newNews.description" required></textarea>
          </div>
          <div class="form-group">
            <label for="news-category">Выбрать категорию</label>
            <select id="news-category" v-model="newNews.category" required>
              <option value="">Выберите категорию</option>
              <option value="Корпоративные">Корпоративные</option>
              <option value="Мероприятия">Мероприятия</option>
              <option value="Объявления">Объявления</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="showAddNewsModal = false">
              Отмена
            </button>
            <button type="submit" class="publish-btn">Опубликовать</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import newsImage from '@/assets/images/to_compani.png'

export default {
  name: 'NewsView',
  data() {
    return {
      showAddNewsModal: false,
      searchQuery: '',
      selectedCategory: '',
      userId: this.getUserId(),
      newNews: {
        title: '',
        description: '',
        category: '',
      },
      newsList: [],
    }
  },
  computed: {
    filteredNews() {
      let filtered = this.newsList

      if (this.searchQuery) {
        filtered = filtered.filter(
          (news) =>
            news.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            news.description.toLowerCase().includes(this.searchQuery.toLowerCase()),
        )
      }

      if (this.selectedCategory) {
        filtered = filtered.filter((news) => news.category === this.selectedCategory)
      }

      return filtered
    },
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
    truncateDescription(description) {
      if (description.length > 100) {
        return description.substring(0, 100) + '...'
      }
      return description
    },
    isLikedByUser(news) {
      return news.likedBy && news.likedBy.includes(this.userId)
    },
    toggleLike(id) {
      const news = this.newsList.find((news) => news.id === id)
      if (news) {
        if (!news.likedBy) {
          news.likedBy = []
        }
        if (news.likedBy.includes(this.userId)) {
          news.likes -= 1
          news.likedBy = news.likedBy.filter((user) => user !== this.userId)
        } else {
          news.likes += 1
          news.likedBy.push(this.userId)
        }
        this.saveNewsList()
      }
    },
    addNews() {
      const newId =
        this.newsList.length > 0 ? Math.max(...this.newsList.map((news) => news.id)) + 1 : 1
      const newNewsItem = {
        id: newId,
        image: newsImage,
        title: this.newNews.title,
        description: this.newNews.description,
        date: new Date().toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        views: 0,
        likes: 0,
        likedBy: [],
        category: this.newNews.category,
      }
      this.newsList.push(newNewsItem)
      this.saveNewsList()
      this.showAddNewsModal = false
      this.newNews = {
        title: '',
        description: '',
        category: '',
      }
    },
    saveNewsList() {
      localStorage.setItem('newsList', JSON.stringify(this.newsList))
    },
    loadNewsList() {
      const savedNews = localStorage.getItem('newsList')
      if (savedNews) {
        this.newsList = JSON.parse(savedNews).map((news) => {
          if (!news.likedBy) {
            news.likedBy = []
          }
          return news
        })
      } else {
        this.newsList = [
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
      }
    },
  },
  mounted() {
    this.loadNewsList()
  },
}
</script>

<style scoped>
/* Стили остаются такими же, как в предыдущем примере */
.news-view {
  background: #f3f4f6;
  min-height: 100vh;
  padding: 20px 0;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

h1 {
  font-size: 28px;
  margin-bottom: 24px;
}

.search-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.category-select {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.add-news-btn {
  padding: 12px 24px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.news-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.news-card a {
  text-decoration: none;
  color: inherit;
}

.news-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.news-body {
  padding: 16px;
}

.news-body h3 {
  font-size: 18px;
  margin: 0 0 8px;
}

.news-body p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px;
}

.news-date {
  font-size: 12px;
  color: #9ca3af;
}

.news-footer {
  padding: 12px 16px;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

.news-footer span:last-child {
  cursor: pointer;
}

.news-footer span.liked {
  color: #ef4444;
}

/* Модальное окно */
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
  width: 500px;
  max-width: 90%;
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 10px 20px;
  background: #e5e7eb;
  color: #111827;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.publish-btn {
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>
