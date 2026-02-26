<template>
  <div class="profile-view">
    <div class="container">
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            <img src="@/assets/images/imagesss.png" alt="Avatar" />
            <span class="profile-status"></span>
            <!-- Бейдж администратора -->
            <div v-if="profile.role === 'ADMIN'" class="admin-badge">
              <span>👑</span>
            </div>
          </div>
          <h1>{{ profile.fullName || profile.username }}</h1>
          <p class="profile-position">{{ profile.position || 'Должность не указана' }}</p>
          <span class="profile-role" :class="{ 'admin-role': profile.role === 'ADMIN' }">
            {{ profile.role === 'ADMIN' ? 'Администратор' : 'Сотрудник' }}
          </span>
        </div>

        <div class="profile-info">
          <div class="info-section">
            <h3>Личная информация</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Имя пользователя</span>
                <span class="value">{{ profile.username }}</span>
              </div>
              <div class="info-item">
                <span class="label">Email</span>
                <span class="value">{{ profile.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">ФИО</span>
                <span class="value">{{ profile.fullName || 'Не указано' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Должность</span>
                <span class="value">{{ profile.position || 'Не указана' }}</span>
              </div>
            </div>
          </div>

          <!-- Панель действий для администратора -->
          <div v-if="isAdmin" class="admin-actions-section">
            <h3>Панель администратора</h3>
            <div class="admin-actions-grid">
              <router-link to="/register" class="admin-action-card">
                <div class="action-icon">➕</div>
                <div class="action-content">
                  <span class="action-title">Добавить сотрудника</span>
                  <span class="action-desc">Создать новый аккаунт</span>
                </div>
                <div class="action-arrow">→</div>
              </router-link>

              <router-link to="/employees" class="admin-action-card">
                <div class="action-icon">👥</div>
                <div class="action-content">
                  <span class="action-title">Управление сотрудниками</span>
                  <span class="action-desc">Просмотр и редактирование</span>
                </div>
                <div class="action-arrow">→</div>
              </router-link>

              <div class="admin-action-card stats-card">
                <div class="action-icon">📊</div>
                <div class="action-content">
                  <span class="action-title">Статистика</span>
                  <span class="action-desc">Всего сотрудников: {{ totalEmployees }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Основные действия -->
          <div class="actions-section">
            <button class="edit-btn" @click="showEditModal = true" :disabled="isLoading">
              <span>✏️</span> Редактировать профиль
            </button>
            <button class="password-btn" @click="showPasswordModal = true" :disabled="isLoading">
              <span>🔒</span> Сменить пароль
            </button>
            <button class="logout-btn" @click="logout"><span>🚪</span> Выйти</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <h2>Редактировать профиль</h2>
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label>ФИО</label>
            <input type="text" v-model="editForm.fullName" placeholder="Введите ФИО" />
          </div>
          <div class="form-group">
            <label>Должность</label>
            <input type="text" v-model="editForm.position" placeholder="Введите должность" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="editForm.email" required placeholder="Введите email" />
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="showEditModal = false">Отмена</button>
            <button type="submit" class="submit-btn" :disabled="isLoading">
              {{ isLoading ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно смены пароля -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
      <div class="modal">
        <h2>Сменить пароль</h2>
        <form @submit.prevent="changePassword">
          <div class="form-group">
            <label>Текущий пароль</label>
            <div class="password-input">
              <input
                :type="showOldPassword ? 'text' : 'password'"
                v-model="passwordForm.oldPassword"
                required
                placeholder="Введите текущий пароль"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showOldPassword = !showOldPassword"
              >
                <span v-if="showOldPassword">👁️</span><span v-else>🔒</span>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>Новый пароль</label>
            <div class="password-input">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                v-model="passwordForm.newPassword"
                required
                minlength="6"
                placeholder="Минимум 6 символов"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showNewPassword = !showNewPassword"
              >
                <span v-if="showNewPassword">👁️</span><span v-else>🔒</span>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>Подтвердите новый пароль</label>
            <div class="password-input">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="passwordForm.confirmPassword"
                required
                placeholder="Повторите новый пароль"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <span v-if="showConfirmPassword">👁️</span><span v-else>🔒</span>
              </button>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="showPasswordModal = false">
              Отмена
            </button>
            <button type="submit" class="submit-btn" :disabled="passwordLoading">
              {{ passwordLoading ? 'Смена...' : 'Сменить пароль' }}
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
  name: 'ProfileView',
  data() {
    return {
      profile: {},
      showEditModal: false,
      showPasswordModal: false,
      isAdmin: false,
      totalEmployees: 0,
      isLoading: false,
      passwordLoading: false,
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      editForm: {
        fullName: '',
        position: '',
        email: '',
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    }
  },
  mounted() {
    this.loadProfile()
    this.loadTotalEmployees()
    window.addEventListener('user-updated', this.loadProfile)
  },
  beforeUnmount() {
    window.removeEventListener('user-updated', this.loadProfile)
  },
  methods: {
    loadProfile() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          this.profile = JSON.parse(userStr)
          this.isAdmin = this.profile.role === 'ADMIN'
          this.editForm = {
            fullName: this.profile.fullName || '',
            position: this.profile.position || '',
            email: this.profile.email || '',
          }
        } catch (e) {
          console.error('Error parsing user:', e)
          this.$router.push('/login')
        }
      } else {
        this.$router.push('/login')
      }
    },

    async loadTotalEmployees() {
      if (this.isAdmin) {
        try {
          const response = await api.get('/employees')
          this.totalEmployees = response.data.length
        } catch (error) {
          console.error('Error loading employees count:', error)
        }
      }
    },

    async updateProfile() {
      this.isLoading = true
      try {
        const response = await api.put('/profile/update', {
          fullName: this.editForm.fullName,
          position: this.editForm.position,
          email: this.editForm.email,
        })

        // Обновляем данные в localStorage
        const updatedProfile = {
          ...this.profile,
          fullName: response.data.fullName,
          position: response.data.position,
          email: response.data.email,
        }

        localStorage.setItem('user', JSON.stringify(updatedProfile))
        this.profile = updatedProfile
        this.showEditModal = false

        // Уведомляем другие компоненты
        window.dispatchEvent(new Event('user-updated'))

        alert('Профиль успешно обновлен!')
      } catch (error) {
        console.error('Error updating profile:', error)
        alert(error.response?.data?.message || 'Ошибка при обновлении профиля')
      } finally {
        this.isLoading = false
      }
    },
    async changePassword() {
      // Валидация
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        alert('Новые пароли не совпадают')
        return
      }

      if (this.passwordForm.newPassword.length < 6) {
        alert('Новый пароль должен быть минимум 6 символов')
        return
      }

      this.passwordLoading = true
      try {
        const response = await api.put('/profile/change-password', {
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword,
        })

        alert('Пароль успешно изменен!') // УСПЕХ
        this.showPasswordModal = false
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        }
      } catch (error) {
        console.error('Error changing password:', error)
        // 👇 ПОКАЖЕТ ДЕТАЛИ ОШИБКИ
        alert('Ошибка: ' + (error.response?.data?.message || error.message))
      } finally {
        this.passwordLoading = false
      }
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('user-updated'))
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped>
.profile-view {
  background: #f3f4f6;
  min-height: 100vh;
  padding: 40px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.profile-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.profile-header {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  padding: 40px;
  text-align: center;
  color: white;
  position: relative;
}

.profile-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
}

.profile-status {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 16px;
  height: 16px;
  background: #10b981;
  border: 3px solid white;
  border-radius: 50%;
}

.admin-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: #fbbf24;
  border: 3px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.profile-header h1 {
  font-size: 28px;
  margin: 0 0 8px;
}

.profile-position {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 12px;
}

.profile-role {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.profile-role.admin-role {
  background: rgba(239, 68, 68, 0.2);
}

.profile-info {
  padding: 40px;
}

.info-section {
  margin-bottom: 32px;
}

.info-section h3 {
  font-size: 18px;
  color: #111827;
  margin: 0 0 16px;
  position: relative;
  display: inline-block;
}

.info-section h3::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  border-radius: 2px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.info-item .label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  font-size: 16px;
  color: #111827;
  font-weight: 600;
}

/* Стили для панели администратора */
.admin-actions-section {
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 20px;
  border: 2px solid #fbbf24;
  animation: glow 2s infinite;
}

@keyframes glow {
  0% {
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
  }
  50% {
    box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
  }
  100% {
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
  }
}

.admin-actions-section h3 {
  font-size: 20px;
  color: #92400e;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-actions-section h3::before {
  content: '⚡';
  font-size: 24px;
}

.admin-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.admin-action-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.admin-action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.admin-action-card:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: #fbbf24;
  box-shadow: 0 10px 25px rgba(251, 191, 36, 0.3);
}

.admin-action-card:hover::before {
  left: 100%;
}

.admin-action-card:active {
  transform: translateY(-2px) scale(1.01);
}

.stats-card {
  cursor: default;
  background: linear-gradient(135deg, #ffffff, #f3f4f6);
}

.stats-card:hover {
  transform: translateY(-4px);
  border-color: #10b981;
}

.action-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  transition: all 0.3s ease;
}

.admin-action-card:hover .action-icon {
  transform: rotate(360deg) scale(1.1);
}

.stats-card .action-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.action-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 12px;
  color: #6b7280;
}

.action-arrow {
  font-size: 20px;
  color: #fbbf24;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(-10px);
}

.admin-action-card:hover .action-arrow {
  opacity: 1;
  transform: translateX(0);
}

.actions-section {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  border-top: 1px solid #e5e7eb;
  padding-top: 32px;
  flex-wrap: wrap;
}

.edit-btn,
.password-btn,
.logout-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.edit-btn::before,
.password-btn::before,
.logout-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition:
    width 0.6s,
    height 0.6s;
}

.edit-btn:hover::before,
.password-btn:hover::before,
.logout-btn:hover::before {
  width: 300px;
  height: 300px;
}

.edit-btn {
  background: #2563eb;
  color: white;
}

.edit-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.password-btn {
  background: #f59e0b;
  color: white;
}

.password-btn:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.logout-btn {
  background: #fee2e2;
  color: #dc2626;
}

.logout-btn:hover {
  background: #fecaca;
  transform: translateY(-2px);
}

.edit-btn:disabled,
.password-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

.modal {
  background: white;
  padding: 32px;
  border-radius: 24px;
  width: 500px;
  max-width: 90%;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 24px;
  color: #111827;
  position: relative;
  display: inline-block;
}

.modal h2::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  border-radius: 2px;
}

.form-group {
  margin-bottom: 20px;
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
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.cancel-btn {
  padding: 12px 24px;
  background: #e5e7eb;
  color: #111827;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #d1d5db;
  transform: translateY(-2px);
}

.submit-btn {
  padding: 12px 24px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .admin-actions-grid {
    grid-template-columns: 1fr;
  }

  .actions-section {
    flex-direction: column;
  }

  .edit-btn,
  .password-btn,
  .logout-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
