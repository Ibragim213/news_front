<template>
  <div class="documents-view">
    <div class="container">
      <section class="page-title">
        <div class="page-title__copy">
          <h1>Документы</h1>
          <p>Инструкции, регламенты и полезные материалы для сотрудников в одном стиле.</p>
        </div>

        <div class="page-title__badge">
          <strong>{{ documentsList.length }}</strong>
          <span>документов</span>
        </div>
      </section>

      <section class="toolbar-card">
        <input
          v-model.trim="searchQuery"
          class="search-input"
          type="text"
          placeholder="Поиск по документам..."
        />

        <select v-model="selectedCategory" class="category-select">
          <option value="">Все категории</option>
          <option v-for="category in categoryOptions" :key="category" :value="category">
            {{ category }}
          </option>
        </select>

        <button
          v-if="canManageDocuments"
          class="add-document-btn"
          type="button"
          @click="openUploadModal"
        >
          Добавить документ
        </button>
      </section>

      <div v-if="statusMessage" class="message" :class="messageClass">
        {{ statusMessage }}
      </div>

      <div v-if="loading" class="documents-grid">
        <div v-for="placeholder in 4" :key="placeholder" class="document-card loading-card">
          <div class="document-card__icon-shell">
            <div class="document-icon document-icon--default">
              <span class="document-icon__sheet"></span>
              <span class="document-icon__line document-icon__line--one"></span>
              <span class="document-icon__line document-icon__line--two"></span>
              <span class="document-icon__line document-icon__line--three"></span>
            </div>
          </div>
          <div class="loading-line loading-line--title"></div>
          <div class="loading-line loading-line--text"></div>
          <div class="loading-line loading-line--text loading-line--short"></div>
        </div>
      </div>

      <div v-else-if="filteredDocuments.length" class="documents-grid">
        <article v-for="doc in filteredDocuments" :key="doc.id" class="document-card">
          <div class="document-card__head">
            <button
              v-if="canManageDocuments"
              class="card-delete-btn"
              type="button"
              :disabled="deletingId === doc.id"
              @click="confirmDelete(doc)"
            >
              {{ deletingId === doc.id ? '...' : 'Удалить' }}
            </button>
          </div>

          <div class="document-card__icon-shell">
            <div class="document-icon" :class="badgeClass(doc.fileType)">
              <span class="document-icon__sheet"></span>
              <span class="document-icon__line document-icon__line--one"></span>
              <span class="document-icon__line document-icon__line--two"></span>
              <span class="document-icon__line document-icon__line--three"></span>
              <span class="document-icon__type">{{ fileLabel(doc.fileType) }}</span>
            </div>
          </div>

          <div class="document-card__body">
            <h3>{{ doc.title }}</h3>
            <p class="document-description">{{ documentPreview(doc) }}</p>
            <span class="document-date">{{ formatDate(doc.uploadDate) }}</span>
          </div>

          <div class="document-card__footer">
            <div class="document-card__meta">
              <span>{{ doc.category || 'Инструкции' }}</span>
              <span>{{ formatFileSize(doc.fileSize) }}</span>
            </div>

            <div class="document-card__divider"></div>

            <div class="document-card__actions">
              <button
                class="download-btn"
                type="button"
                :disabled="downloadingId === doc.id"
                @click="handleDownload(doc)"
              >
                {{ downloadingId === doc.id ? 'Скачиваем...' : 'Скачать' }}
              </button>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <h2>{{ emptyStateTitle }}</h2>
        <p>{{ emptyStateText }}</p>
      </div>
    </div>

    <div v-if="isUploadModalOpen" class="modal-overlay" @click.self="closeUploadModal">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h2>Добавить документ</h2>
            <p>Загрузите Word- или PDF-файл, чтобы он появился у сотрудников в общем списке.</p>
          </div>

          <button class="icon-btn" type="button" aria-label="Закрыть окно" @click="closeUploadModal">
            ×
          </button>
        </div>

        <form class="upload-form" @submit.prevent="submitDocument">
          <label for="document-title">
            <span>Название документа</span>
            <input
              id="document-title"
              v-model.trim="uploadForm.title"
              type="text"
              maxlength="180"
              placeholder="Например, Инструкция по работе в 1С"
            />
          </label>

          <label for="document-category">
            <span>Категория</span>
            <select id="document-category" v-model="uploadForm.category">
              <option v-for="category in uploadCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </label>

          <label for="document-description">
            <span>Описание</span>
            <textarea
              id="document-description"
              v-model.trim="uploadForm.description"
              rows="4"
              maxlength="500"
              placeholder="Кратко опишите, о чем документ и кому он нужен"
            />
          </label>

          <label class="file-field" for="document-file">
            <span>Файл</span>
            <input
              id="document-file"
              :key="uploadInputKey"
              type="file"
              accept=".pdf,.doc,.docx"
              @change="onFileSelected"
            />
            <small v-if="selectedFileName">{{ selectedFileName }}</small>
            <small v-else>Поддерживаются PDF, DOC и DOCX до 10 МБ.</small>
          </label>

          <p v-if="uploadError" class="form-error">{{ uploadError }}</p>

          <div class="modal-actions">
            <button class="ghost-btn" type="button" :disabled="isUploading" @click="closeUploadModal">
              Отмена
            </button>
            <button class="submit-btn" type="submit" :disabled="isUploading">
              {{ isUploading ? 'Загружаем...' : 'Добавить документ' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="documentToDelete" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal-card modal-card--small">
        <div class="modal-header">
          <div>
            <h2>Удалить документ?</h2>
            <p>После удаления файл исчезнет из общего списка сотрудников.</p>
          </div>

          <button class="icon-btn" type="button" aria-label="Закрыть окно" @click="cancelDelete">
            ×
          </button>
        </div>

        <div class="delete-summary">
          <strong>{{ documentToDelete.title }}</strong>
          <span>{{ documentToDelete.fileName }}</span>
        </div>

        <div class="modal-actions">
          <button
            class="ghost-btn"
            type="button"
            :disabled="deletingId === documentToDelete.id"
            @click="cancelDelete"
          >
            Отмена
          </button>
          <button
            class="delete-btn delete-btn--modal"
            type="button"
            :disabled="deletingId === documentToDelete.id"
            @click="removeDocument"
          >
            {{ deletingId === documentToDelete.id ? 'Удаляем...' : 'Удалить документ' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  deleteDocument as deleteDocumentRequest,
  downloadDocumentFile,
  fetchDocuments,
  uploadDocument as uploadDocumentRequest,
} from '@/services/documents'
import { canUserManageNews, getCurrentUser } from '@/services/news'

const DEFAULT_UPLOAD_CATEGORIES = ['Инструкции', 'Регламенты', 'Справка', 'Шаблоны']

export default {
  name: 'DocumentsView',
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      documentsList: [],
      loading: true,
      statusMessage: '',
      statusType: 'info',
      currentUser: getCurrentUser(),
      isUploadModalOpen: false,
      isUploading: false,
      uploadInputKey: 0,
      uploadError: '',
      uploadForm: {
        title: '',
        category: DEFAULT_UPLOAD_CATEGORIES[0],
        description: '',
        file: null,
      },
      uploadCategories: DEFAULT_UPLOAD_CATEGORIES,
      downloadingId: null,
      deletingId: null,
      documentToDelete: null,
    }
  },
  computed: {
    canManageDocuments() {
      return canUserManageNews(this.currentUser)
    },
    filteredDocuments() {
      const query = this.searchQuery.toLowerCase()

      return this.documentsList.filter((doc) => {
        const matchesQuery =
          !query ||
          [doc.title, doc.description, doc.category, doc.fileName]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query))

        const matchesCategory = !this.selectedCategory || doc.category === this.selectedCategory

        return matchesQuery && matchesCategory
      })
    },
    categoryOptions() {
      return [...new Set(this.documentsList.map((doc) => doc.category).filter(Boolean))]
    },
    selectedFileName() {
      return this.uploadForm.file?.name || ''
    },
    emptyStateTitle() {
      return this.documentsList.length ? 'Ничего не найдено' : 'Документов пока нет'
    },
    emptyStateText() {
      return this.documentsList.length
        ? 'Попробуйте изменить запрос или выбрать другую категорию.'
        : 'После перезапуска сервера здесь появятся стартовые инструкции и регламенты.'
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
    this.loadDocuments()
    window.addEventListener('user-updated', this.syncCurrentUser)
  },
  beforeUnmount() {
    window.removeEventListener('user-updated', this.syncCurrentUser)
  },
  methods: {
    syncCurrentUser() {
      this.currentUser = getCurrentUser()
    },
    async loadDocuments() {
      this.loading = true

      try {
        this.documentsList = await fetchDocuments()
      } catch (error) {
        this.documentsList = []
        this.showStatus(this.resolveErrorMessage(error, 'Не удалось загрузить документы.'), 'error')
      } finally {
        this.loading = false
      }
    },
    openUploadModal() {
      this.resetUploadForm()
      this.isUploadModalOpen = true
    },
    closeUploadModal() {
      if (this.isUploading) {
        return
      }

      this.isUploadModalOpen = false
      this.resetUploadForm()
    },
    resetUploadForm() {
      this.uploadForm = {
        title: '',
        category: DEFAULT_UPLOAD_CATEGORIES[0],
        description: '',
        file: null,
      }
      this.uploadError = ''
      this.uploadInputKey += 1
    },
    onFileSelected(event) {
      const [file] = event.target.files || []
      this.uploadForm.file = file || null
    },
    async submitDocument() {
      if (!this.uploadForm.title) {
        this.uploadError = 'Укажите название документа.'
        return
      }

      if (!this.uploadForm.file) {
        this.uploadError = 'Выберите файл для загрузки.'
        return
      }

      this.isUploading = true
      this.uploadError = ''

      try {
        await uploadDocumentRequest({
          title: this.uploadForm.title,
          description: this.uploadForm.description,
          category: this.uploadForm.category,
          file: this.uploadForm.file,
        })

        this.isUploadModalOpen = false
        this.resetUploadForm()
        await this.loadDocuments()
        this.showStatus('Документ успешно добавлен.', 'success')
      } catch (error) {
        this.uploadError = this.resolveErrorMessage(error, 'Не удалось загрузить документ.')
      } finally {
        this.isUploading = false
      }
    },
    confirmDelete(document) {
      this.documentToDelete = document
    },
    cancelDelete() {
      if (this.deletingId) {
        return
      }

      this.documentToDelete = null
    },
    async removeDocument() {
      if (!this.documentToDelete) {
        return
      }

      const documentId = this.documentToDelete.id
      this.deletingId = documentId

      try {
        await deleteDocumentRequest(documentId)
        this.documentToDelete = null
        await this.loadDocuments()
        this.showStatus('Документ удален.', 'success')
      } catch (error) {
        this.showStatus(this.resolveErrorMessage(error, 'Не удалось удалить документ.'), 'error')
      } finally {
        this.deletingId = null
      }
    },
    async handleDownload(document) {
      this.downloadingId = document.id

      try {
        await downloadDocumentFile(document.id, document.fileName)
      } catch (error) {
        this.showStatus(this.resolveErrorMessage(error, 'Не удалось скачать документ.'), 'error')
      } finally {
        this.downloadingId = null
      }
    },
    showStatus(message, type = 'info') {
      this.statusMessage = message
      this.statusType = type
    },
    resolveErrorMessage(error, fallbackMessage) {
      return error?.response?.data?.message || fallbackMessage
    },
    formatFileSize(bytes) {
      if (!bytes) {
        return '0 Б'
      }

      if (bytes < 1024) {
        return `${bytes} Б`
      }

      if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} кБ`
      }

      return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
    },
    formatDate(dateString) {
      if (!dateString) {
        return 'Без даты'
      }

      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    },
    documentPreview(doc) {
      if (doc.description && doc.description.trim()) {
        const description = doc.description.trim()
        return description.length > 92 ? `${description.slice(0, 92)}...` : description
      }

      return 'Файл доступен для скачивания сотрудникам компании.'
    },
    fileLabel(fileType) {
      const value = String(fileType || 'file').trim().toUpperCase()
      return value.length > 4 ? value.slice(0, 4) : value
    },
    badgeClass(fileType) {
      const type = String(fileType || '').toLowerCase()

      if (type === 'pdf') {
        return 'document-icon--pdf'
      }

      if (type === 'doc' || type === 'docx') {
        return 'document-icon--doc'
      }

      return 'document-icon--default'
    },
  },
}
</script>

<style scoped>
.documents-view {
  min-height: calc(100vh - 72px);
  padding: 20px 0 36px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 24%),
    linear-gradient(180deg, #eef3fb 0%, #f5f7fb 38%, #edf2f8 100%);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.page-title {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 24px;
  margin-bottom: 18px;
  padding: 28px 24px;
  border-radius: 22px;
  background: linear-gradient(135deg, #2f80d9 0%, #3867e8 56%, #3f66dd 100%);
  color: #ffffff;
  box-shadow: 0 20px 38px rgba(49, 102, 220, 0.2);
}

.page-title__copy {
  max-width: 620px;
}

.page-title h1 {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
  line-height: 1.05;
}

.page-title p {
  margin: 12px 0 0;
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.95;
}

.page-title__badge {
  align-self: center;
  display: grid;
  min-width: 128px;
  gap: 4px;
  padding: 16px 18px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.16);
  text-align: center;
  backdrop-filter: blur(6px);
}

.page-title__badge strong {
  font-size: 36px;
  line-height: 1;
  font-weight: 800;
}

.page-title__badge span {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.9;
}

.toolbar-card {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 14px;
  border: 1px solid rgba(191, 200, 214, 0.65);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 14px 30px rgba(148, 163, 184, 0.12);
}

.search-input,
.category-select,
.upload-form input,
.upload-form select,
.upload-form textarea {
  min-height: 48px;
  border: 1px solid #d7e0ec;
  border-radius: 14px;
  background: #ffffff;
  color: #12233d;
  font-size: 14px;
  padding: 0 16px;
  box-sizing: border-box;
}

.search-input {
  flex: 1 1 420px;
}

.category-select {
  flex: 0 0 260px;
  cursor: pointer;
}

.search-input:focus,
.category-select:focus,
.upload-form input:focus,
.upload-form select:focus,
.upload-form textarea:focus {
  outline: none;
  border-color: #3c6be0;
  box-shadow: 0 0 0 3px rgba(60, 107, 224, 0.12);
}

.add-document-btn,
.submit-btn {
  min-height: 48px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #2f6ce5 0%, #315fdd 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  padding: 0 20px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.add-document-btn:hover,
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(49, 95, 221, 0.22);
  filter: brightness(1.02);
}

.message {
  margin-bottom: 20px;
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

.documents-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.document-card,
.empty-state,
.modal-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid rgba(220, 227, 237, 0.9);
  box-shadow: 0 12px 28px rgba(148, 163, 184, 0.12);
}

.document-card {
  display: flex;
  min-height: 320px;
  flex-direction: column;
  padding: 18px 18px 20px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.document-card:hover {
  transform: translateY(-3px);
  border-color: rgba(165, 184, 215, 0.95);
  box-shadow: 0 18px 34px rgba(148, 163, 184, 0.16);
}

.document-card__head {
  display: flex;
  justify-content: flex-end;
  min-height: 30px;
}

.card-delete-btn {
  min-height: 30px;
  padding: 0 12px;
  border: 1px solid #f5c2c7;
  border-radius: 999px;
  background: #fff7f7;
  color: #c2414c;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

.card-delete-btn:hover:not(:disabled) {
  background: #feecec;
  border-color: #f2aeb7;
  transform: translateY(-1px);
}

.document-card__icon-shell {
  display: flex;
  justify-content: center;
  margin: 6px 0 18px;
}

.document-icon {
  position: relative;
  width: 72px;
  height: 88px;
  color: #64748b;
}

.document-icon__sheet {
  position: absolute;
  inset: 0;
  border: 1.6px solid currentColor;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 248, 252, 0.98) 100%);
  box-shadow: 0 14px 24px rgba(148, 163, 184, 0.18);
}

.document-icon__sheet::after {
  content: '';
  position: absolute;
  top: 11px;
  right: 11px;
  width: 14px;
  height: 14px;
  border-top: 1.6px solid currentColor;
  border-right: 1.6px solid currentColor;
  border-radius: 0 10px 0 0;
  opacity: 0.6;
}

.document-icon__line {
  position: absolute;
  left: 18px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.75;
}

.document-icon__line--one {
  top: 24px;
  width: 28px;
}

.document-icon__line--two {
  top: 36px;
  width: 28px;
}

.document-icon__line--three {
  top: 48px;
  width: 20px;
}

.document-icon__type {
  position: absolute;
  right: -10px;
  bottom: -8px;
  display: inline-flex;
  min-width: 42px;
  justify-content: center;
  padding: 5px 8px;
  border: 1px solid currentColor;
  border-radius: 999px;
  background: #ffffff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.document-icon--pdf {
  color: #d14343;
}

.document-icon--doc {
  color: #3468df;
}

.document-icon--default {
  color: #7c8ca4;
}

.document-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.document-card__body h3 {
  margin: 0;
  color: #101828;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.document-description {
  margin: 12px 0 0;
  color: #667085;
  font-size: 14px;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.document-date {
  margin-top: 12px;
  color: #9aa6b7;
  font-size: 12px;
  font-weight: 600;
}

.document-card__footer {
  margin-top: 20px;
}

.document-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #93a0b4;
  font-size: 13px;
  font-weight: 700;
}

.document-card__divider {
  height: 1px;
  margin: 12px 0 14px;
  background: #d9e0ea;
}

.document-card__actions {
  display: flex;
  justify-content: center;
}

.download-btn,
.delete-btn,
.ghost-btn,
.icon-btn {
  border: none;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.download-btn,
.delete-btn,
.ghost-btn {
  min-height: 40px;
  font-size: 14px;
  font-weight: 700;
  padding: 0 18px;
  border-radius: 12px;
}

.download-btn {
  min-width: 126px;
  background: #eff2f6;
  color: #101828;
}

.download-btn:hover:not(:disabled) {
  background: #e3e8ef;
  transform: translateY(-1px);
}

.delete-btn {
  background: #fff5f5;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.delete-btn:hover:not(:disabled) {
  background: #fee2e2;
}

.delete-btn--modal {
  min-width: 154px;
}

.ghost-btn {
  background: #eef2f6;
  color: #374151;
}

.ghost-btn:hover:not(:disabled) {
  background: #e3e8ef;
}

.download-btn:disabled,
.delete-btn:disabled,
.ghost-btn:disabled,
.submit-btn:disabled,
.add-document-btn:disabled,
.card-delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-card {
  justify-content: flex-start;
  pointer-events: none;
}

.loading-line {
  border-radius: 999px;
  background: linear-gradient(90deg, #eef2f7 0%, #f6f8fb 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: loadingPulse 1.4s ease-in-out infinite;
}

.loading-line--title {
  width: 78%;
  height: 16px;
  margin: 0 auto 12px;
}

.loading-line--text {
  width: 88%;
  height: 10px;
  margin: 0 auto 10px;
}

.loading-line--short {
  width: 62%;
}

.empty-state {
  padding: 46px 28px;
  text-align: center;
}

.empty-state h2 {
  margin: 0 0 12px;
  color: #101828;
  font-size: 34px;
  font-weight: 800;
}

.empty-state p {
  max-width: 560px;
  margin: 0 auto;
  color: #667085;
  font-size: 15px;
  line-height: 1.6;
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

.modal-card {
  width: min(100%, 620px);
  padding: 24px;
}

.modal-card--small {
  width: min(100%, 460px);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
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

.upload-form {
  display: grid;
  gap: 16px;
}

.upload-form label {
  display: grid;
  gap: 8px;
}

.upload-form span {
  color: #344054;
  font-size: 14px;
  font-weight: 700;
}

.upload-form input,
.upload-form select,
.upload-form textarea {
  width: 100%;
}

.upload-form textarea {
  min-height: 120px;
  padding: 14px 16px;
  resize: vertical;
}

.file-field small,
.form-error {
  font-size: 13px;
}

.file-field small {
  color: #667085;
}

.form-error {
  margin: 0;
  color: #dc2626;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.delete-summary {
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  margin-bottom: 18px;
  border-radius: 14px;
  background: #f8fafc;
}

.delete-summary strong {
  color: #101828;
  font-size: 16px;
}

.delete-summary span {
  color: #667085;
  font-size: 13px;
}

@keyframes loadingPulse {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}

@media (max-width: 1100px) {
  .documents-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 940px) {
  .page-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title__badge {
    min-width: 112px;
  }

  .toolbar-card {
    flex-wrap: wrap;
  }

  .category-select {
    flex: 1 1 260px;
  }

  .add-document-btn {
    flex: 1 1 100%;
  }

  .documents-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .page-title {
    padding: 24px 20px;
  }

  .page-title h1 {
    font-size: 34px;
  }

  .page-title p {
    font-size: 15px;
  }
}

@media (max-width: 640px) {
  .toolbar-card {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .category-select,
  .add-document-btn {
    width: 100%;
    flex: 1 1 auto;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .download-btn,
  .delete-btn,
  .ghost-btn,
  .submit-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }

  .page-title {
    padding: 20px 16px;
    gap: 16px;
  }

  .page-title h1 {
    font-size: 28px;
  }

  .page-title p {
    font-size: 14px;
  }

  .page-title__badge {
    width: 100%;
    min-width: 0;
    justify-content: center;
  }

  .toolbar-card,
  .empty-state {
    padding: 18px 16px;
  }

  .document-card {
    min-height: 0;
    padding: 16px;
  }

  .document-card__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .document-card__actions {
    width: 100%;
  }

  .download-btn {
    width: 100%;
  }

  .modal-overlay {
    align-items: flex-start;
    overflow-y: auto;
    padding: 12px;
  }

  .modal-card {
    padding: 22px 16px;
    margin: 24px 0;
    border-radius: 20px;
  }

  .modal-header {
    flex-direction: column;
    align-items: stretch;
  }

  .delete-summary {
    padding: 14px;
    word-break: break-word;
  }
}

@media (max-width: 360px) {
  .container {
    padding: 0 10px;
  }

  .page-title,
  .toolbar-card,
  .empty-state,
  .modal-card {
    padding-left: 14px;
    padding-right: 14px;
  }

  .page-title h1,
  .empty-state h2 {
    font-size: 24px;
  }

  .page-title p,
  .empty-state p,
  .document-card__body h3,
  .download-btn,
  .ghost-btn,
  .submit-btn,
  .delete-btn {
    font-size: 13px;
  }
}
</style>
