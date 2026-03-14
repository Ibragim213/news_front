<template>
  <div class="news-view">
    <div class="container">
      <div class="page-title">
        <h1>Новости</h1>
      </div>

      <div class="search-filter">
        <input
          v-model.trim="searchQuery"
          type="text"
          placeholder="Поиск по новостям..."
          class="search-input"
        />

        <select class="category-select" v-model="selectedCategory">
          <option value="">Все категории</option>
          <option value="Корпоративные">Корпоративные</option>
          <option value="Мероприятия">Мероприятия</option>
          <option value="Объявления">Объявления</option>
        </select>

        <button v-if="canManage" class="add-news-btn" @click="openCreateModal">Добавить новость</button>
      </div>

      <div v-if="errorMessage" class="message error-message">{{ errorMessage }}</div>
      <div v-if="successMessage" class="message success-message">{{ successMessage }}</div>

      <div v-if="isLoading" class="news-grid">
        <div v-for="n in 3" :key="n" class="news-card loading-card">Загрузка новостей...</div>
      </div>
      <div v-else-if="filteredNews.length === 0" class="empty-state">Новостей пока нет</div>
      <div v-else class="news-grid">
        <article v-for="news in filteredNews" :key="news.id" class="news-card">
          <router-link :to="`/news/${news.id}`" class="news-link">
            <img :src="resolveNewsImage(news)" :alt="news.title" class="news-img" />

            <div class="news-body">
              <h3>{{ news.title }}</h3>
              <p>{{ truncateDescription(news.description) }}</p>
              <span class="news-date">{{ news.date }}</span>
            </div>
          </router-link>

          <div v-if="canManage" class="news-card-actions">
            <button
              type="button"
              class="news-manage-btn"
              :disabled="isSubmitting || deletingNewsId === news.id"
              @click.stop="openEditModal(news)"
            >
              Редактировать
            </button>
            <button
              type="button"
              class="news-manage-btn news-manage-btn--danger"
              :disabled="isSubmitting || deletingNewsId === news.id"
              @click.stop="removeNews(news.id)"
            >
              {{ deletingNewsId === news.id ? 'Удаление...' : 'Удалить' }}
            </button>
          </div>

          <div class="news-footer">
            <span>Просмотры: {{ news.views }}</span>
            <button
              type="button"
              class="news-like"
              :class="{ liked: isLikedByUser(news) }"
              @click.prevent.stop="toggleLike(news.id)"
            >
              ❤ {{ news.likes }}
            </button>
          </div>
        </article>
      </div>
    </div>

    <div v-if="showAddNewsModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>{{ modalTitle }}</h2>

        <form @submit.prevent="submitNews">
          <div class="form-group">
            <label for="news-title">Заголовок</label>
            <input id="news-title" v-model.trim="newNews.title" type="text" required />
          </div>

          <div class="form-group">
            <label for="news-text">Текст новости</label>
            <textarea id="news-text" v-model.trim="newNews.description" required></textarea>
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
            <button type="button" class="cancel-btn" @click="closeModal">Отмена</button>
            <button type="submit" class="publish-btn" :disabled="isSubmitting">
              {{ submitButtonText }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import {
  canUserManageNews,
  createNews,
  deleteNews,
  fetchNews,
  getCurrentUser,
  getCurrentUserId,
  isNewsLikedByUser,
  toggleNewsLike,
  updateNews,
} from '@/services/news'
import goneCompani from '@/assets/images/gone_compani.png'
import toCompani from '@/assets/images/to_compani.png'

export default {
  name: 'NewsView',
  data() {
    return {
      showAddNewsModal: false,
      searchQuery: '',
      selectedCategory: '',
      userId: getCurrentUserId(),
      canManage: false,
      isLoading: false,
      isSubmitting: false,
      deletingNewsId: null,
      editingNewsId: null,
      errorMessage: '',
      successMessage: '',
      newNews: {
        title: '',
        description: '',
        category: '',
        gradient: 1,
      },
      newsList: [],
    }
  },
  computed: {
    filteredNews() {
      let filtered = [...this.newsList]

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (news) =>
            news.title.toLowerCase().includes(query) || news.description.toLowerCase().includes(query),
        )
      }

      if (this.selectedCategory) {
        filtered = filtered.filter((news) => news.category === this.selectedCategory)
      }

      return filtered
    },
    modalTitle() {
      return this.editingNewsId ? 'Редактировать новость' : 'Добавить новость'
    },
    submitButtonText() {
      if (this.isSubmitting) {
        return this.editingNewsId ? 'Сохранение...' : 'Публикация...'
      }

      return this.editingNewsId ? 'Сохранить' : 'Опубликовать'
    },
  },
  mounted() {
    this.loadCurrentUser()
    this.loadNewsList()
    this.openModalFromQuery()
    window.addEventListener('user-updated', this.handleUserUpdated)
  },
  beforeUnmount() {
    window.removeEventListener('user-updated', this.handleUserUpdated)
  },
  methods: {
    handleUserUpdated() {
      this.loadCurrentUser()
      this.openModalFromQuery()
    },

    loadCurrentUser() {
      const user = getCurrentUser()
      this.userId = user?.id ?? null
      this.canManage = canUserManageNews(user)
    },

    openModalFromQuery() {
      if (this.$route.query.create === '1' && this.canManage) {
        this.openCreateModal()
      }
    },

    openCreateModal() {
      this.errorMessage = ''
      this.successMessage = ''
      this.editingNewsId = null
      this.resetForm()
      this.showAddNewsModal = true
    },

    openEditModal(news) {
      this.errorMessage = ''
      this.successMessage = ''
      this.editingNewsId = news.id
      this.newNews = {
        title: news.title,
        description: news.description,
        category: news.category,
        gradient: news.gradient || 1,
      }
      this.showAddNewsModal = true
    },

    resolveNewsImage(news) {
      if (news.imageUrl) {
        return news.imageUrl
      }

      return news.id % 2 === 0 ? toCompani : goneCompani
    },

    truncateDescription(description) {
      if (!description) {
        return ''
      }

      if (description.length > 110) {
        return `${description.substring(0, 110)}...`
      }

      return description
    },

    isLikedByUser(news) {
      return isNewsLikedByUser(news, this.userId)
    },

    async loadNewsList() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        this.newsList = await fetchNews()
      } catch (error) {
        console.error('Error loading news:', error)
        this.errorMessage = error.response?.data?.message || 'Не удалось загрузить новости'
      } finally {
        this.isLoading = false
      }
    },

    async toggleLike(id) {
      try {
        const updatedNews = await toggleNewsLike(id)
        this.newsList = this.newsList.map((news) => (news.id === id ? updatedNews : news))
      } catch (error) {
        console.error('Error toggling like:', error)
        this.errorMessage = error.response?.data?.message || 'Не удалось обновить лайк'
      }
    },

    async submitNews() {
      this.isSubmitting = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        if (this.editingNewsId) {
          const updatedNews = await updateNews(this.editingNewsId, this.newNews)
          this.newsList = this.newsList.map((news) => (news.id === updatedNews.id ? updatedNews : news))
          this.successMessage = 'Новость обновлена'
        } else {
          const createdNews = await createNews(this.newNews)
          this.newsList = [createdNews, ...this.newsList]
          this.successMessage = 'Новость опубликована'
        }

        this.closeModal()
      } catch (error) {
        console.error('Error saving news:', error)
        this.errorMessage =
          error.response?.data?.message ||
          'Создавать, редактировать и удалять новости может только администратор или редактор новостей'
      } finally {
        this.isSubmitting = false
      }
    },

    async removeNews(id) {
      const selectedNews = this.newsList.find((news) => news.id === id)
      const confirmed = window.confirm(`Удалить новость "${selectedNews?.title || 'без названия'}"?`)

      if (!confirmed) {
        return
      }

      this.deletingNewsId = id
      this.errorMessage = ''
      this.successMessage = ''

      try {
        await deleteNews(id)
        this.newsList = this.newsList.filter((news) => news.id !== id)
        this.successMessage = 'Новость удалена'

        if (this.editingNewsId === id) {
          this.closeModal()
        }
      } catch (error) {
        console.error('Error deleting news:', error)
        this.errorMessage =
          error.response?.data?.message ||
          'Удалять новости может только администратор или редактор новостей'
      } finally {
        this.deletingNewsId = null
      }
    },

    resetForm() {
      this.newNews = {
        title: '',
        description: '',
        category: '',
        gradient: 1,
      }
    },

    closeModal() {
      this.showAddNewsModal = false
      this.editingNewsId = null
      this.resetForm()

      if (this.$route.query.create === '1') {
        this.$router.replace({ path: this.$route.path })
      }
    },
  },
}
</script>

<style scoped>
.news-view {
  background: #f3f4f6;
  min-height: calc(100vh - 72px);
  padding: 20px 0 32px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.page-title {
  background: #2563eb;
  color: white;
  border-radius: 20px;
  padding: 30px 20px;
  margin-bottom: 16px;
}

.page-title h1 {
  font-size: 38px;
  margin: 0;
}

.search-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}

.search-input,
.category-select,
.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
}

.category-select {
  width: 320px;
}

.add-news-btn,
.publish-btn {
  padding: 12px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.add-news-btn:hover,
.publish-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.publish-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.message,
.empty-state {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
}

.error-message {
  background: #fee2e2;
  color: #b91c1c;
}

.success-message {
  background: #dcfce7;
  color: #166534;
}

.empty-state {
  background: white;
  color: #6b7280;
  text-align: center;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.news-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.loading-card {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.news-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.news-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.news-body {
  padding: 16px 16px 12px;
}

.news-body h3 {
  font-size: 18px;
  margin: 0 0 8px;
  color: #111827;
}

.news-body p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px;
  line-height: 1.5;
  min-height: 64px;
}

.news-date {
  font-size: 12px;
  color: #9ca3af;
}

.news-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 16px 16px;
  min-height: 52px;
  align-items: center;
}

.news-manage-btn {
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #334155, #1f2937);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.16);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
}

.news-manage-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.22);
  filter: brightness(1.04);
}

.news-manage-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.news-manage-btn--danger {
  background: linear-gradient(135deg, #b91c1c, #7f1d1d);
}

.news-footer {
  margin-top: auto;
  padding: 12px 16px;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
}

.news-like {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #6b7280;
}

.news-like.liked {
  color: #ef4444;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 500px;
  max-width: 100%;
  box-sizing: border-box;
}

.modal h2 {
  margin: 0 0 20px;
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

.cancel-btn:hover {
  background: #d1d5db;
}

@media (max-width: 980px) {
  .news-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }

  .category-select {
    width: 100%;
  }

  .news-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }

  .page-title {
    padding: 24px 16px;
  }

  .page-title h1 {
    font-size: 30px;
  }

  .news-card-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .news-manage-btn {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .add-news-btn,
  .search-input,
  .category-select {
    width: 100%;
  }

  .modal-overlay {
    align-items: flex-start;
    overflow-y: auto;
    padding: 12px;
  }

  .modal {
    width: min(100%, 420px);
    margin: 24px 0;
  }

  .modal-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .publish-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .search-filter {
    gap: 12px;
  }

  .news-card {
    min-height: 0;
  }

  .news-img {
    height: 170px;
  }

  .news-body {
    padding: 14px 14px 12px;
  }

  .news-body h3 {
    font-size: 17px;
  }

  .news-card-actions {
    padding: 0 14px 14px;
  }

  .news-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .modal {
    padding: 20px 16px;
    border-radius: 16px;
  }
}

@media (max-width: 360px) {
  .container {
    padding: 0 10px;
  }

  .page-title {
    padding: 20px 14px;
  }

  .page-title h1 {
    font-size: 26px;
  }

  .news-body p,
  .news-footer,
  .message,
  .empty-state {
    font-size: 13px;
  }
}
</style>
