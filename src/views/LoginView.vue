<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">Вход</h1>
        <p class="auth-subtitle">Войдите в свой аккаунт</p>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">Имя пользователя</label>
            <input
              id="username"
              name="username"
              v-model.trim="username"
              type="text"
              autocomplete="username"
              placeholder="Введите ваше имя пользователя"
              @input="clearErrorMessage"
            />
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <div class="password-input">
              <input
                id="password"
                name="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Введите ваш пароль"
                @input="clearErrorMessage"
              />
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                {{ showPassword ? 'Скрыть' : 'Показать' }}
              </button>
            </div>
          </div>

          <div class="form-options">
            <div class="remember-me">
              <input
                id="remember"
                name="rememberMe"
                v-model="rememberMe"
                type="checkbox"
                autocomplete="off"
              />
              <label for="remember">Запомнить меня</label>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading">Вход...</span>
            <span v-else>Войти</span>
          </button>
        </form>

        <div class="auth-divider">
          <span>или</span>
        </div>

        <div class="auth-note">Новый аккаунт может создать только администратор.</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const LOGIN_URL = 'http://localhost:8080/api/auth/login'

export default {
  name: 'LoginView',
  data() {
    return {
      username: 'admin',
      password: '',
      rememberMe: false,
      showPassword: false,
      isLoading: false,
      errorMessage: '',
    }
  },
  mounted() {
    const authMessage = sessionStorage.getItem('authMessage')

    if (authMessage) {
      this.errorMessage = authMessage
      sessionStorage.removeItem('authMessage')
    }
  },
  methods: {
    clearErrorMessage() {
      if (this.errorMessage) {
        this.errorMessage = ''
      }
    },
    async handleLogin() {
      if (!this.username || !this.password) {
        this.errorMessage = 'Пожалуйста, заполните все поля'
        return
      }

      this.isLoading = true
      this.errorMessage = ''
      sessionStorage.removeItem('authMessage')

      try {
        const response = await axios.post(LOGIN_URL, {
          username: this.username,
          password: this.password,
        })

        localStorage.setItem('token', response.data.token)

        const userData = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email || '',
          fullName: response.data.fullName || '',
          position: response.data.position || '',
          role: response.data.role || 'USER',
        }

        localStorage.setItem('user', JSON.stringify(userData))
        window.dispatchEvent(new Event('user-updated'))
        this.$router.push('/')
      } catch (error) {
        console.error('Login error:', error)

        if (error.response) {
          this.errorMessage =
            error.response.data.message || 'Неверное имя пользователя или пароль'
        } else if (error.request) {
          this.errorMessage =
            'Сервер недоступен или запрос заблокирован CORS. Проверьте, что backend запущен.'
        } else {
          this.errorMessage = 'Ошибка при входе в систему'
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
  max-width: 450px;
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

.form-group input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus {
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
  padding-right: 110px;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: #f3f4f6;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  padding: 8px 10px;
}

.form-options {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remember-me input {
  width: auto;
  margin: 0;
}

.remember-me label {
  font-size: 14px;
  color: #374151;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}

.submit-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
}

.auth-divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  color: #9ca3af;
  font-size: 14px;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
}

.auth-divider span {
  padding: 0 16px;
}

.auth-note {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
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

  .form-options {
    margin-bottom: 8px;
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

  .form-group input {
    padding: 11px 14px;
    font-size: 15px;
  }

  .password-input input {
    padding-right: 92px;
  }

  .password-toggle {
    right: 8px;
    padding: 7px 8px;
    font-size: 11px;
  }

  .auth-divider {
    margin: 20px 0;
  }

  .auth-note {
    font-size: 13px;
    line-height: 1.5;
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
  .remember-me label,
  .auth-note {
    font-size: 12px;
  }

  .form-group label {
    font-size: 13px;
  }

  .submit-btn {
    padding: 12px;
    font-size: 15px;
  }

  .password-input input {
    padding-right: 82px;
  }
}
</style>
