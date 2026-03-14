<template>
  <div class="news-detail-page">
    <div class="container">
      <div class="detail-topbar">
        <button class="back-btn" @click="$router.back()">Назад к новостям</button>
      </div>

      <div v-if="successMessage" class="state-banner state-banner-success">{{ successMessage }}</div>
      <div v-if="error" class="state-banner state-banner-error">{{ error }}</div>

      <div v-if="loading" class="state-card">Загружаем новость...</div>
      <article v-else-if="news" class="detail-card">
        <div class="detail-hero" :class="gradientClass">
          <div class="detail-hero-top">
            <div class="detail-meta">
              <span class="detail-tag">{{ news.category }}</span>
              <span>{{ news.date }}</span>
            </div>
            <div v-if="canManage" class="hero-manage-pills">
              <button class="hero-pill hero-pill-edit" :disabled="isSubmitting" @click="openEditModal">
                Редактировать
              </button>
              <button class="hero-pill hero-pill-delete" :disabled="isSubmitting" @click="removeNews">
                Удалить
              </button>
            </div>
          </div>

          <h1>{{ news.title }}</h1>
          <p>{{ news.description }}</p>
        </div>

        <div class="detail-body">
          <p>{{ news.description }}</p>

          <div class="detail-actions">
            <button class="action-pill" :class="{ liked: isLiked }" @click="toggleLike">
              ❤ {{ news.likes }}
            </button>
            <span class="action-pill action-pill-static">Просмотры: {{ news.views }}</span>
          </div>
        </div>
      </article>
      <div v-else class="state-card">Новость не найдена</div>
    </div>

    <div v-if="showEditModal && news" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <span class="modal-kicker">Управление новостью</span>
            <h2>Редактировать новость</h2>
          </div>
          <button class="modal-close" type="button" @click="closeEditModal">×</button>
        </div>

        <form class="modal-form" @submit.prevent="submitEdit">
          <div class="form-group">
            <label for="news-title">Заголовок</label>
            <input id="news-title" v-model.trim="editForm.title" type="text" required />
          </div>

          <div class="form-group">
            <label for="news-text">Текст новости</label>
            <textarea id="news-text" v-model.trim="editForm.description" required></textarea>
          </div>

          <div class="form-group">
            <label for="news-category">Категория</label>
            <select id="news-category" v-model="editForm.category" required>
              <option value="">Выберите категорию</option>
              <option value="Корпоративные">Корпоративные</option>
              <option value="Мероприятия">Мероприятия</option>
              <option value="Объявления">Объявления</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="modal-btn modal-btn-secondary" @click="closeEditModal">
              Отмена
            </button>
            <button type="submit" class="modal-btn modal-btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Сохранение...' : 'Сохранить изменения' }}
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
  deleteNews,
  fetchNewsById,
  getCurrentUser,
  getCurrentUserId,
  isNewsLikedByUser,
  registerNewsView,
  toggleNewsLike,
  updateNews,
} from '@/services/news'

export default {
  name: 'NewsDetailView',
  data() {
    return {
      news: null,
      loading: true,
      error: '',
      successMessage: '',
      userId: getCurrentUserId(),
      canManage: false,
      showEditModal: false,
      isSubmitting: false,
      isDeleting: false,
      editForm: {
        title: '',
        description: '',
        category: '',
        gradient: 1,
      },
    }
  },
  computed: {
    isLiked() {
      return isNewsLikedByUser(this.news, this.userId)
    },
    gradientClass() {
      return `gradient-${this.news?.gradient || 1}`
    },
  },
  mounted() {
    this.loadCurrentUser()
    this.loadNews()
    window.addEventListener('user-updated', this.handleUserUpdated)
  },
  beforeUnmount() {
    window.removeEventListener('user-updated', this.handleUserUpdated)
  },
  methods: {
    handleUserUpdated() {
      this.loadCurrentUser()
    },

    loadCurrentUser() {
      const user = getCurrentUser()
      this.userId = user?.id ?? null
      this.canManage = canUserManageNews(user)
    },

    async loadNews() {
      this.loading = true
      this.error = ''

      try {
        const news = await fetchNewsById(this.$route.params.id)
        this.news = news
        this.syncEditForm()
        this.registerViewInBackground()
      } catch (error) {
        console.error('Error loading news:', error)
        this.error = error.response?.data?.message || 'Не удалось открыть новость'
      } finally {
        this.loading = false
      }
    },

    syncEditForm() {
      if (!this.news) {
        return
      }

      this.editForm = {
        title: this.news.title,
        description: this.news.description,
        category: this.news.category,
        gradient: this.news.gradient || 1,
      }
    },

    async registerViewInBackground() {
      if (!this.news) {
        return
      }

      try {
        const updatedNews = await registerNewsView(this.news.id)
        this.news = updatedNews
      } catch (error) {
        console.error('Error registering view:', error)
      }
    },

    async toggleLike() {
      if (!this.news) {
        return
      }

      try {
        this.news = await toggleNewsLike(this.news.id)
      } catch (error) {
        console.error('Error toggling like:', error)
        this.error = error.response?.data?.message || 'Не удалось обновить лайк'
      }
    },

    openEditModal() {
      this.error = ''
      this.successMessage = ''
      this.syncEditForm()
      this.showEditModal = true
    },

    closeEditModal() {
      this.showEditModal = false
      this.syncEditForm()
    },

    async submitEdit() {
      if (!this.news) {
        return
      }

      this.isSubmitting = true
      this.error = ''
      this.successMessage = ''

      try {
        this.news = await updateNews(this.news.id, this.editForm)
        this.successMessage = 'Новость обновлена'
        this.showEditModal = false
      } catch (error) {
        console.error('Error updating news:', error)
        this.error =
          error.response?.data?.message ||
          'Редактировать новости может только администратор или редактор новостей'
      } finally {
        this.isSubmitting = false
      }
    },

    async removeNews() {
      if (!this.news || this.isDeleting) {
        return
      }

      const confirmed = window.confirm(`Удалить новость "${this.news.title}"?`)
      if (!confirmed) {
        return
      }

      this.isDeleting = true
      this.error = ''
      this.successMessage = ''

      try {
        await deleteNews(this.news.id)
        this.$router.push('/news')
      } catch (error) {
        console.error('Error deleting news:', error)
        this.error =
          error.response?.data?.message ||
          'Удалять новости может только администратор или редактор новостей'
      } finally {
        this.isDeleting = false
      }
    },
  },
}
</script>

<style scoped>
.news-detail-page {
  min-height: calc(100vh - 72px);
  padding: 32px 0 56px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 30%),
    linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
}

.container {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

.detail-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.back-btn {
  padding: 12px 18px;
  border: none;
  border-radius: 999px;
  background: white;
  color: #1e3a8a;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(30, 64, 175, 0.1);
}

.hero-pill {
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.hero-pill:hover:not(:disabled) {
  transform: translateY(-1px);
}

.hero-pill:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.hero-pill {
  background: rgba(15, 23, 42, 0.16);
  color: white;
  backdrop-filter: blur(14px);
  border-color: rgba(255, 255, 255, 0.22);
}

.state-banner {
  margin-bottom: 16px;
  padding: 14px 18px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 600;
}

.state-banner-success {
  background: #dcfce7;
  color: #166534;
}

.state-banner-error {
  background: #fee2e2;
  color: #b91c1c;
}

.detail-card,
.state-card {
  border-radius: 28px;
  background: white;
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.1);
  overflow: hidden;
}

.state-card {
  padding: 32px;
  text-align: center;
  color: #475569;
}

.detail-hero {
  padding: 40px;
  color: white;
}

.detail-hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 14px;
}

.detail-tag {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-weight: 700;
}

.hero-manage-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.hero-pill {
  background: rgba(15, 23, 42, 0.16);
  color: white;
  backdrop-filter: blur(14px);
  border-color: rgba(255, 255, 255, 0.22);
}

.hero-pill-edit {
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.16);
}

.hero-pill-delete {
  background: rgba(127, 29, 29, 0.22);
}

.detail-hero h1 {
  margin: 0 0 16px;
  font-size: clamp(32px, 5vw, 54px);
  line-height: 1.06;
}

.detail-hero p {
  max-width: 720px;
  margin: 0;
  font-size: 18px;
  line-height: 1.7;
}

.detail-body {
  padding: 32px 40px 40px;
}

.detail-body p {
  margin: 0;
  font-size: 18px;
  line-height: 1.8;
  color: #334155;
  white-space: pre-wrap;
}

.detail-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.action-pill {
  padding: 12px 16px;
  border: none;
  border-radius: 999px;
  background: #eef2ff;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.action-pill.liked {
  background: #ffe4e6;
  color: #be123c;
}

.action-pill-static {
  cursor: default;
  background: #f8fafc;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1200;
}

.modal-card {
  width: min(640px, 100%);
  border-radius: 28px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.2);
  padding: 28px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 22px;
}

.modal-kicker {
  display: inline-block;
  margin-bottom: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.modal-header h2 {
  margin: 0;
  font-size: 28px;
  color: #0f172a;
}

.modal-close {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: #e2e8f0;
  color: #334155;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  border: 1px solid #dbe3f0;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 15px;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.92);
  box-sizing: border-box;
}

.form-group textarea {
  min-height: 150px;
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.18);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 4px;
}

.modal-btn {
  border: none;
  border-radius: 999px;
  padding: 13px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.modal-btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.24);
}

.modal-btn-secondary {
  background: #e2e8f0;
  color: #334155;
}

.gradient-1 {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.gradient-2 {
  background: linear-gradient(135deg, #ec4899, #ef4444);
}

.gradient-3 {
  background: linear-gradient(135deg, #0ea5e9, #14b8a6);
}

.gradient-4 {
  background: linear-gradient(135deg, #22c55e, #06b6d4);
}

.gradient-5 {
  background: linear-gradient(135deg, #f97316, #facc15);
}

.gradient-6 {
  background: linear-gradient(135deg, #06b6d4, #1d4ed8);
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .detail-topbar,
  .detail-hero-top,
  .modal-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .detail-hero,
  .detail-body,
  .modal-card {
    padding: 24px;
  }

  .hero-manage-pills {
    justify-content: stretch;
  }

  .hero-pill,
  .modal-btn {
    width: 100%;
  }

  .detail-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }

  .detail-topbar {
    gap: 10px;
  }

  .back-btn {
    width: 100%;
    justify-content: center;
  }

  .detail-hero,
  .detail-body,
  .modal-card {
    padding: 20px 16px;
  }

  .detail-hero h1 {
    font-size: clamp(28px, 9vw, 38px);
  }

  .detail-hero p {
    font-size: 15px;
  }

  .detail-actions {
    gap: 10px;
  }

  .action-pill {
    width: 100%;
    justify-content: center;
  }

  .modal-overlay {
    align-items: flex-start;
    overflow-y: auto;
    padding: 12px;
  }

  .modal-card {
    margin: 24px 0;
    border-radius: 20px;
  }

  .modal-header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 360px) {
  .container {
    padding: 0 10px;
  }

  .detail-hero,
  .detail-body,
  .modal-card {
    padding: 18px 12px;
  }

  .detail-tag,
  .hero-pill,
  .action-pill,
  .modal-btn,
  .back-btn {
    font-size: 13px;
  }

  .detail-body p,
  .detail-hero p {
    font-size: 14px;
  }
}
</style>
