<template>
  <div class="home">
    <!-- Панель отладки -->
    <div
      class="debug-panel"
      style="
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        border: 2px solid red;
        padding: 20px;
        border-radius: 8px;
        z-index: 9999;
        max-width: 400px;
      "
    >
      <h3 style="color: red; margin: 0 0 10px 0">🔍 ОТЛАДКА</h3>

      <div style="margin-bottom: 15px">
        <p><strong>Статус:</strong> {{ debugStatus }}</p>
        <p><strong>Токен:</strong> {{ hasToken ? '✅ Есть' : '❌ Нет' }}</p>
        <p><strong>User:</strong> {{ hasUser ? '✅ Есть' : '❌ Нет' }}</p>
        <p v-if="hasUser"><strong>Username:</strong> {{ userData?.username }}</p>
        <p v-if="hasUser"><strong>Роль:</strong> {{ userData?.role }}</p>
      </div>

      <div
        v-if="error"
        style="
          background: #fee2e2;
          color: #dc2626;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
        "
      >
        <strong>Ошибка:</strong> {{ error }}
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <button
          @click="forceLogin"
          style="
            background: #10b981;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          🔓 Принудительный вход
        </button>
        <button
          @click="clearAndLogout"
          style="
            background: #ef4444;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          🚪 Очистить и выйти
        </button>
        <button
          @click="forceReload"
          style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          🔄 Перезагрузить
        </button>
        <button
          @click="showStorage"
          style="
            background: #8b5cf6;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          📦 Показать Storage
        </button>
      </div>

      <div
        v-if="storageContent"
        style="
          margin-top: 15px;
          background: #f3f4f6;
          padding: 10px;
          border-radius: 4px;
          max-height: 200px;
          overflow: auto;
        "
      >
        <pre style="font-size: 11px">{{ storageContent }}</pre>
      </div>
    </div>

    <!-- Основной контент -->
    <div v-if="isAuthenticated" class="home-content">
      <h1>Главная страница</h1>
      <p>Добро пожаловать, {{ userFullName || userUsername }}!</p>

      <!-- Здесь будет ваш основной контент -->
      <div class="stats">
        <p>Новостей: {{ stats.news }}</p>
        <p>Документов: {{ stats.documents }}</p>
        <p>Сотрудников: {{ stats.employees }}</p>
      </div>
    </div>

    <!-- Экран загрузки -->
    <div v-else class="loading-screen">
      <h2>Проверка авторизации...</h2>
      <p>{{ debugMessage }}</p>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'HomeView',
  data() {
    return {
      isAuthenticated: false,
      userUsername: '',
      userFullName: '',
      userRole: '',
      userData: null,
      hasToken: false,
      hasUser: false,
      error: null,
      debugMessage: 'Проверка...',
      debugStatus: '⏳ Загрузка...',
      storageContent: null,
      stats: {
        news: 0,
        documents: 0,
        employees: 0,
      },
    }
  },
  mounted() {
    console.log('🔍 HomeView mounted')
    this.debugMessage = 'Компонент загружен'
    this.checkAuth()

    // Добавляем обработчик ошибок
    window.addEventListener('error', this.handleGlobalError)
  },
  beforeUnmount() {
    window.removeEventListener('error', this.handleGlobalError)
  },
  methods: {
    handleGlobalError(event) {
      console.error('❌ Глобальная ошибка:', event.error)
      this.error = event.error?.message || 'Неизвестная ошибка'
      this.debugStatus = '❌ Ошибка!'
    },

    checkAuth() {
      try {
        console.log('🔍 Проверка авторизации...')

        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')

        this.hasToken = !!token
        this.hasUser = !!userStr

        console.log('📦 Token:', token ? token.substring(0, 20) + '...' : 'null')
        console.log('📦 User:', userStr || 'null')

        this.debugStatus = this.hasToken && this.hasUser ? '✅ Авторизован' : '❌ Не авторизован'

        if (!token || !userStr) {
          this.debugMessage = 'Нет данных авторизации'
          // НЕ РЕДИРЕКТИМ!
          return
        }

        try {
          this.userData = JSON.parse(userStr)
          this.userUsername = this.userData.username
          this.userFullName = this.userData.fullName
          this.userRole = this.userData.role
          this.isAuthenticated = true

          this.debugMessage = 'Данные пользователя загружены'
          this.loadStats()
        } catch (e) {
          console.error('❌ Ошибка парсинга user:', e)
          this.error = 'Ошибка парсинга данных пользователя'
          this.debugStatus = '❌ Ошибка данных'
        }
      } catch (e) {
        console.error('❌ Критическая ошибка:', e)
        this.error = e.message
        this.debugStatus = '❌ Критическая ошибка'
      }
    },

    async loadStats() {
      try {
        console.log('📊 Загрузка статистики...')

        const [newsRes, docsRes, employeesRes] = await Promise.all([
          api.get('/news').catch(() => ({ data: [] })),
          api.get('/documents').catch(() => ({ data: [] })),
          api.get('/employees').catch(() => ({ data: [] })),
        ])

        this.stats = {
          news: newsRes.data?.length || 0,
          documents: docsRes.data?.length || 0,
          employees: employeesRes.data?.length || 0,
        }

        console.log('📊 Статистика:', this.stats)
        this.debugStatus = '✅ Данные загружены'
      } catch (error) {
        console.error('❌ Ошибка загрузки статистики:', error)
        this.error = error.message
        this.debugStatus = '❌ Ошибка загрузки'
      }
    },

    forceLogin() {
      console.log('🔐 Принудительный вход')
      const testUser = {
        id: 1,
        username: 'admin',
        fullName: 'Тестовый Администратор',
        role: 'ADMIN',
        email: 'admin@example.com',
        position: 'Администратор',
      }
      localStorage.setItem('user', JSON.stringify(testUser))
      localStorage.setItem('token', 'test-token-12345')
      this.checkAuth()
    },

    clearAndLogout() {
      console.log('🧹 Очистка localStorage')
      localStorage.clear()
      this.checkAuth()
    },

    forceReload() {
      window.location.reload()
    },

    showStorage() {
      const storage = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        try {
          storage[key] = JSON.parse(localStorage.getItem(key))
        } catch {
          storage[key] = localStorage.getItem(key)
        }
      }
      this.storageContent = JSON.stringify(storage, null, 2)
    },
  },
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f3f4f6;
}

.home-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px;
}

.loading-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f3f4f6;
}

.stats {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}
</style>
