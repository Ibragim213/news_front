<template>
  <div class="employees-view">
    <div class="container">
      <h1>Сотрудники</h1>

      <!-- Кнопка добавления только для админа -->
      <div class="actions-bar" v-if="isAdmin">
        <router-link to="/register" class="add-btn">
          <span>➕</span> Зарегистрировать нового сотрудника
        </router-link>
      </div>

      <!-- Индикатор загрузки -->
      <div v-if="loading" class="loading-state">Загрузка сотрудников...</div>

      <!-- Список сотрудников -->
      <div v-else-if="employees.length > 0" class="employees-grid">
        <div v-for="employee in employees" :key="employee.id" class="employee-card">
          <div class="employee-avatar">
            <img src="@/assets/images/imagesss.png" alt="Avatar" />
            <span v-if="employee.role === 'ADMIN'" class="admin-badge">👑</span>
          </div>
          <div class="employee-info">
            <h3>{{ employee.fullName || employee.username }}</h3>
            <p class="position">{{ employee.position || 'Должность не указана' }}</p>
            <p class="email">{{ employee.email }}</p>
            <p class="role" :class="{ 'admin-role': employee.role === 'ADMIN' }">
              {{ employee.role === 'ADMIN' ? 'Администратор' : 'Сотрудник' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Сообщение если нет сотрудников -->
      <div v-else class="empty-state">
        <p>Нет сотрудников</p>
      </div>

      <!-- Сообщение об ошибке -->
      <div v-if="error" class="error-state">
        <p>Ошибка загрузки: {{ error }}</p>
        <button @click="fetchEmployees" class="retry-btn">Повторить</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'EmployeesView',
  data() {
    return {
      employees: [],
      isAdmin: false,
      loading: false,
      error: null,
    }
  },
  mounted() {
    this.checkAdmin()
    this.fetchEmployees()
    window.addEventListener('user-updated', this.handleUserUpdate)
  },
  beforeUnmount() {
    window.removeEventListener('user-updated', this.handleUserUpdate)
  },
  methods: {
    handleUserUpdate() {
      this.checkAdmin()
    },

    checkAdmin() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          this.isAdmin = user.role === 'ADMIN'
        } catch (e) {
          console.error('Error parsing user', e)
        }
      }
    },

    async fetchEmployees() {
      this.loading = true
      this.error = null

      try {
        console.log('Fetching employees...')
        const token = localStorage.getItem('token')

        if (!token) {
          this.error = 'Необходимо авторизоваться'
          this.loading = false
          return
        }

        const response = await api.get('/employees')
        console.log('Employees response:', response.data)
        this.employees = response.data || []
      } catch (error) {
        console.error('Error fetching employees:', error)

        if (error.response) {
          // Сервер вернул ошибку
          this.error = `Ошибка ${error.response.status}: ${error.response.data?.message || 'Неизвестная ошибка'}`
        } else if (error.request) {
          // Запрос был отправлен, но нет ответа
          this.error = 'Сервер не отвечает. Проверьте подключение.'
        } else {
          // Ошибка при настройке запроса
          this.error = error.message || 'Произошла ошибка'
        }
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.employees-view {
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

.actions-bar {
  margin-bottom: 24px;
}

.add-btn {
  padding: 12px 24px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.add-btn:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.loading-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 16px;
  color: #6b7280;
}

.employees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.employee-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.employee-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.employee-avatar {
  position: relative;
}

.employee-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.admin-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  background: #fbbf24;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.employee-info {
  flex: 1;
}

.employee-info h3 {
  font-size: 18px;
  margin: 0 0 4px;
  color: #111827;
}

.employee-info .position {
  font-size: 14px;
  color: #2563eb;
  font-weight: 500;
  margin: 0 0 4px;
}

.employee-info .email {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px;
}

.employee-info .role {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 20px;
  display: inline-block;
}

.employee-info .role.admin-role {
  background: #fee2e2;
  color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 16px;
  color: #6b7280;
}

.error-state {
  text-align: center;
  padding: 40px;
  background: #fee2e2;
  border-radius: 16px;
  color: #dc2626;
  margin-top: 20px;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #b91c1c;
}
</style>
