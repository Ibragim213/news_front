<template>
  <div class="documents-view">
    <!-- Основной контент -->
    <div class="container">
      <h1>Документы</h1>

      <!-- Поиск и фильтры -->
      <div class="search-filter">
        <input
          type="text"
          placeholder="Поиск по документам..."
          class="search-input"
          v-model="searchQuery"
        />
        <select class="category-select" v-model="selectedCategory">
          <option value="">Все категории</option>
          <option value="Инструкции">Инструкции</option>
          <option value="Отчеты">Отчеты</option>
          <option value="Шаблоны">Шаблоны</option>
        </select>
      </div>

      <!-- Карточки документов -->
      <div class="documents-grid">
        <div class="document-card" v-for="doc in filteredDocuments" :key="doc.id">
          <div class="document-header">
            <div class="document-icon-wrapper" :class="getFileIconClass(doc.fileType)">
              <span class="document-icon">{{ getFileIcon(doc.fileType) }}</span>
              <span class="file-extension">{{ doc.fileType?.toUpperCase() }}</span>
            </div>
          </div>

          <div class="document-content">
            <h3>{{ doc.title }}</h3>
            <div class="document-meta">
              <span class="document-category">{{ doc.category }}</span>
              <span class="document-size">{{ doc.size }}</span>
            </div>
          </div>

          <div class="document-actions">
            <a
              class="download-btn"
              :href="`/uploads/${doc.fileName}`"
              :download="doc.fileName"
              target="_blank"
              rel="noopener noreferrer"
            >
              Скачать
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentsView',
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      documentsList: [
        {
          id: 1,
          title: 'Инструкция по использованию портала',
          category: 'Инструкции',
          fileName: 'instryjchu.docx',
          fileType: 'docx',
          size: '1024 kb',
        },
        {
          id: 2,
          title: 'Ежемесячный отчет за январь',
          category: 'Отчеты',
          fileName: 'otchet.docx',
          fileType: 'docx',
          size: '1024 kb',
        },
        {
          id: 3,
          title: 'Шаблон договора',
          category: 'Шаблоны',
          fileName: 'shablon.docx',
          fileType: 'docx',
          size: '1024 kb',
        },
        {
          id: 4,
          title: 'Favicon',
          category: 'Шаблоны',
          fileName: 'favicon.ico',
          fileType: 'ico',
          size: '15 kb',
        },
      ],
    }
  },
  computed: {
    filteredDocuments() {
      let filtered = this.documentsList
      if (this.searchQuery) {
        filtered = filtered.filter((doc) =>
          doc.title.toLowerCase().includes(this.searchQuery.toLowerCase()),
        )
      }
      if (this.selectedCategory) {
        filtered = filtered.filter((doc) => doc.category === this.selectedCategory)
      }
      return filtered
    },
  },
  methods: {
    getFileIcon(fileType) {
      const type = fileType?.toLowerCase()
      const icons = {
        pdf: '📕',
        doc: '📘',
        docx: '📘',
        xls: '📗',
        xlsx: '📗',
        ppt: '📙',
        pptx: '📙',
        txt: '📄',
        jpg: '🖼️',
        jpeg: '🖼️',
        png: '🖼️',
        gif: '🖼️',
        ico: '🖼️',
      }
      return icons[type] || '📄'
    },

    getFileIconClass(fileType) {
      const type = fileType?.toLowerCase()
      const classes = {
        pdf: 'pdf-icon',
        doc: 'doc-icon',
        docx: 'doc-icon',
        xls: 'xls-icon',
        xlsx: 'xls-icon',
        ppt: 'ppt-icon',
        pptx: 'ppt-icon',
        jpg: 'image-icon',
        jpeg: 'image-icon',
        png: 'image-icon',
        gif: 'image-icon',
        ico: 'image-icon',
      }
      return classes[type] || 'default-icon'
    },
  },
}
</script>

<style scoped>
/* Основные стили */
.documents-view {
  background: #f3f4f6;
  min-height: 100vh;
  padding: 30px 0;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

h1 {
  font-size: 32px;
  margin-bottom: 28px;
  color: #111827;
  font-weight: 600;
}

/* Поиск и фильтры */
.search-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 280px;
  padding: 14px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.category-select {
  padding: 14px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  background: white;
  min-width: 200px;
  cursor: pointer;
  color: #1f2937;
}

.category-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

/* Карточки документов */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.document-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.document-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}

.document-icon {
  font-size: 32px;
}

.file-extension {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: white;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.pdf-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.doc-icon {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}
.xls-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.ppt-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
.image-icon {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}
.default-icon {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.document-content {
  flex: 1;
}

.document-content h3 {
  font-size: 17px;
  margin: 0 0 14px;
  color: #111827;
  line-height: 1.4;
  font-weight: 600;
}

.document-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.document-category {
  font-size: 12px;
  padding: 5px 14px;
  background: #f3f4f6;
  border-radius: 20px;
  color: #4b5563;
  font-weight: 500;
}

.document-size {
  font-size: 12px;
  color: #6b7280;
  padding: 5px 0;
}

.document-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.download-btn {
  width: 100%;
  padding: 12px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
}

.download-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
}

/* Адаптивность */
@media (max-width: 1200px) {
  .documents-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .documents-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .category-select {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .documents-grid {
    grid-template-columns: 1fr;
  }

  .container {
    padding: 0 16px;
  }

  h1 {
    font-size: 28px;
  }
}
</style>
