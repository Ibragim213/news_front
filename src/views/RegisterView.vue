<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">Регистрация сотрудника</h1>
        <p class="auth-subtitle">Создайте новый аккаунт для сотрудника</p>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="username">Имя пользователя *</label>
            <input
              type="text"
              id="username"
              name="username"
              v-model="username"
              autocomplete="username"
              placeholder="Введите имя пользователя"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              v-model="email"
              autocomplete="email"
              placeholder="Введите ваш email"
              required
            />
          </div>

          <div class="form-group">
            <label for="fullName">ФИО</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              v-model="fullName"
              autocomplete="name"
              placeholder="Введите ФИО сотрудника"
            />
          </div>

          <div class="form-group">
            <label for="position">Должность</label>
            <input
              type="text"
              id="position"
              name="position"
              v-model="position"
              autocomplete="organization-title"
              placeholder="Введите должность"
            />
          </div>

          <div class="form-group">
            <label for="password">Пароль *</label>
            <div class="password-input">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                v-model="password"
                autocomplete="new-password"
                placeholder="Введите пароль (минимум 6 символов)"
                required
              />
              <button type="button" class="password-toggle" @click="togglePasswordVisibility">
                <span v-if="showPassword">👁️</span>
                <span v-else>🔒</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Подтвердите пароль *</label>
            <div class="password-input">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                name="confirmPassword"
                v-model="confirmPassword"
                autocomplete="new-password"
                placeholder="Подтвердите пароль"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="toggleConfirmPasswordVisibility"
              >
                <span v-if="showConfirmPassword">👁️</span>
                <span v-else>🔒</span>
              </button>
            </div>
          </div>

          <div class="form-group" v-if="isAdmin">
            <label for="role">Роль</label>
            <select id="role" v-model="role">
              <option value="USER">Сотрудник</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading">Регистрация...</span>
            <span v-else>Зарегистрировать</span>
          </button>
        </form>

        <div class="back-link">
          <router-link to="/employees">← Вернуться к списку сотрудников</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'RegisterView',
  data() {
    return {
      username: '',
      email: '',
      fullName: '',
      position: '',
      password: '',
      confirmPassword: '',
      role: 'USER',
      showPassword: false,
      showConfirmPassword: false,
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      isAdmin: false,
    }
  },
  mounted() {
    this.checkAdmin()
  },
  methods: {
    checkAdmin() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        this.isAdmin = user.role === 'ADMIN'
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword
    },
    async handleRegister() {
      // Валидация
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Пароли не совпадают'
        return
      }

      if (this.password.length < 6) {
        this.errorMessage = 'Пароль должен быть минимум 6 символов'
        return
      }

      this.isLoading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const response = await api.post('/auth/register', {
          username: this.username,
          email: this.email,
          password: this.password,
          fullName: this.fullName,
          position: this.position,
          role: this.role,
        })

        this.successMessage = response.data.message || 'Сотрудник успешно зарегистрирован!'

        // Очищаем форму
        this.username = ''
        this.email = ''
        this.fullName = ''
        this.position = ''
        this.password = ''
        this.confirmPassword = ''
        this.role = 'USER'

        // Перенаправляем на страницу сотрудников через 2 секунды
        setTimeout(() => {
          this.$router.push('/employees')
        }, 2000)
      } catch (error) {
        console.error('Registration error:', error)
        if (error.response) {
          this.errorMessage = error.response.data.message || 'Ошибка регистрации'
        } else {
          this.errorMessage = 'Ошибка подключения к серверу'
        }
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>

<style scoped>
.auth-page {
  background: #f3f4f6;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 500px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
  text-align: center;
}

.auth-subtitle {
  font-size: 16px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 32px;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.success-message {
  background: #d1fae5;
  color: #059669;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.password-input {
  position: relative;
  width: 100%;
}

.password-input input {
  width: 100%;
  padding-right: 48px;
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
}

.submit-btn {
  padding: 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover {
  background: #1d4ed8;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.back-link {
  text-align: center;
  margin-top: 24px;
}

.back-link a {
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
}

.back-link a:hover {
  color: #2563eb;
  text-decoration: underline;
}

@media (max-width: 640px) {
  .auth-page {
    align-items: flex-start;
    padding: 16px;
    overflow-y: auto;
  }

  .auth-card {
    padding: 28px 20px;
  }

  .auth-title {
    font-size: 24px;
  }

  .auth-subtitle {
    margin-bottom: 24px;
    font-size: 15px;
  }

  .auth-form {
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .auth-page {
    padding: 12px;
  }

  .auth-card {
    padding: 22px 16px;
    border-radius: 14px;
  }

  .auth-title {
    font-size: 22px;
  }

  .form-group input,
  .form-group select {
    padding: 11px 14px;
    font-size: 15px;
  }

  .submit-btn {
    font-size: 15px;
  }

  .back-link {
    margin-top: 20px;
  }
}

@media (max-width: 360px) {
  .auth-page {
    padding: 8px;
  }

  .auth-card {
    padding: 18px 12px;
  }

  .auth-title {
    font-size: 20px;
  }

  .auth-subtitle,
  .back-link a {
    font-size: 12px;
  }

  .form-group label {
    font-size: 13px;
  }

  .submit-btn {
    padding: 12px;
    font-size: 14px;
  }
}
</style>
