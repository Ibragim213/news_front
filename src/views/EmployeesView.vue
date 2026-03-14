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

      <div v-if="successMessage" class="success-state">
        {{ successMessage }}
      </div>

      <!-- Индикатор загрузки -->
      <div v-if="loading" class="loading-state">Загрузка сотрудников...</div>

      <!-- Список сотрудников -->
      <div v-else-if="employees.length > 0" class="employees-grid">
        <div v-for="employee in employees" :key="employee.id" class="employee-card">
          <div class="employee-card__content">
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

          <button
            v-if="isAdmin"
            type="button"
            class="edit-employee-btn"
            @click="openEditModal(employee)"
          >
            Редактировать
          </button>
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

    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal">
        <h2>Редактировать сотрудника</h2>
        <form @submit.prevent="updateEmployee">
          <div class="form-group">
            <label>Имя пользователя</label>
            <input type="text" :value="editForm.username" disabled />
          </div>
          <div class="form-group">
            <label>ФИО</label>
            <input type="text" v-model.trim="editForm.fullName" placeholder="Введите ФИО" />
          </div>
          <div class="form-group">
            <label>Должность</label>
            <input type="text" v-model.trim="editForm.position" placeholder="Введите должность" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model.trim="editForm.email" required placeholder="Введите email" />
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" :disabled="isSaving" @click="closeEditModal">
              Отмена
            </button>
            <button type="submit" class="save-btn" :disabled="isSaving">
              {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
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
      successMessage: '',
      showEditModal: false,
      isSaving: false,
      editForm: {
        id: null,
        username: '',
        fullName: '',
        position: '',
        email: '',
      },
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
      this.successMessage = ''

      try {
        const token = localStorage.getItem('token')

        if (!token) {
          this.error = 'Необходимо авторизоваться'
          this.loading = false
          return
        }

        const response = await api.get('/employees')
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

    openEditModal(employee) {
      this.editForm = {
        id: employee.id,
        username: employee.username || '',
        fullName: employee.fullName || '',
        position: employee.position || '',
        email: employee.email || '',
      }
      this.showEditModal = true
      this.error = null
    },

    closeEditModal() {
      if (this.isSaving) {
        return
      }

      this.showEditModal = false
      this.editForm = {
        id: null,
        username: '',
        fullName: '',
        position: '',
        email: '',
      }
    },

    async updateEmployee() {
      if (!this.editForm.id) {
        return
      }

      this.isSaving = true
      this.error = null
      this.successMessage = ''

      try {
        const response = await api.put(`/employees/${this.editForm.id}`, {
          fullName: this.editForm.fullName,
          position: this.editForm.position,
          email: this.editForm.email,
        })

        const updatedEmployee = response.data
        this.employees = this.employees.map((employee) =>
          employee.id === updatedEmployee.id ? updatedEmployee : employee,
        )

        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            const currentUser = JSON.parse(userStr)
            if (currentUser.id === updatedEmployee.id) {
              const updatedCurrentUser = {
                ...currentUser,
                fullName: updatedEmployee.fullName,
                position: updatedEmployee.position,
                email: updatedEmployee.email,
              }
              localStorage.setItem('user', JSON.stringify(updatedCurrentUser))
              window.dispatchEvent(new Event('user-updated'))
            }
          } catch (storageError) {
            console.error('Error syncing local user data:', storageError)
          }
        }

        this.successMessage = 'Данные сотрудника обновлены'
        this.closeEditModal()
      } catch (error) {
        console.error('Error updating employee:', error)
        this.error = error.response?.data?.message || 'Не удалось обновить данные сотрудника'
      } finally {
        this.isSaving = false
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

.success-state {
  margin-bottom: 20px;
  padding: 14px 16px;
  background: #dcfce7;
  border-radius: 12px;
  color: #166534;
  font-weight: 600;
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
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.employee-card__content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
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

.edit-employee-btn {
  align-self: flex-end;
  margin-top: auto;
  padding: 10px 16px;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-employee-btn:hover {
  background: #dbeafe;
  transform: translateY(-1px);
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  width: min(100%, 520px);
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
}

.modal h2 {
  margin: 0 0 24px;
  font-size: 24px;
  color: #111827;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 15px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.form-group input:disabled {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
}

.cancel-btn,
.save-btn {
  min-height: 44px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #e5e7eb;
  color: #111827;
}

.cancel-btn:hover:not(:disabled) {
  background: #d1d5db;
}

.save-btn {
  background: #2563eb;
  color: #ffffff;
}

.save-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.cancel-btn:disabled,
.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .container {
    padding: 0 16px;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .actions-bar {
    margin-bottom: 20px;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
  }

  .employees-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .employee-card {
    padding: 18px;
  }

  .employee-card__content {
    gap: 12px;
  }

  .edit-employee-btn {
    width: 100%;
    align-self: stretch;
  }

  .modal-overlay {
    align-items: flex-start;
    overflow-y: auto;
    padding: 12px;
  }

  .modal {
    padding: 22px 18px;
    margin: 24px 0;
  }

  .modal-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }

  .employee-card {
    border-radius: 14px;
    padding: 16px;
  }

  .employee-card__content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .employee-avatar img {
    width: 56px;
    height: 56px;
  }

  .employee-info h3 {
    font-size: 17px;
  }

  .modal {
    padding: 20px 14px;
    border-radius: 18px;
  }

  .modal h2 {
    font-size: 22px;
    margin-bottom: 20px;
  }
}

@media (max-width: 360px) {
  .container {
    padding: 0 10px;
  }

  h1 {
    font-size: 22px;
  }

  .add-btn,
  .edit-employee-btn,
  .cancel-btn,
  .save-btn {
    font-size: 13px;
  }
}
</style>
