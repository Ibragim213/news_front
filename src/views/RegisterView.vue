<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">Регистрация</h1>
        <p class="auth-subtitle">Создайте новый аккаунт</p>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="name">Имя</label>
            <input type="text" id="name" v-model="name" placeholder="Введите ваше имя" required />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Введите ваш email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <div class="password-input">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                placeholder="Введите пароль"
                required
              />
              <button type="button" class="password-toggle" @click="togglePasswordVisibility">
                <span v-if="showPassword">👁️</span>
                <span v-else>🔒</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Подтвердите пароль</label>
            <div class="password-input">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="confirmPassword"
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

          <div class="terms-checkbox">
            <input type="checkbox" id="terms" v-model="acceptTerms" required />
            <label for="terms">
              Я согласен с
              <router-link to="/terms">условиями использования</router-link>
              и <router-link to="/privacy">политикой конфиденциальности</router-link>
            </label>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading">Регистрация...</span>
            <span v-else>Зарегистрироваться</span>
          </button>
        </form>

        <div class="auth-divider">
          <span>или</span>
        </div>

        <div class="social-auth">
          <button class="social-btn google-btn">
            <span>G</span>
            Зарегистрироваться с Google
          </button>
        </div>

        <div class="login-link">
          Уже есть аккаунт?
          <router-link to="/login">Войти</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      showPassword: false,
      showConfirmPassword: false,
      isLoading: false,
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword
    },
    async handleRegister() {
      if (this.password !== this.confirmPassword) {
        alert('Пароли не совпадают')
        return
      }

      this.isLoading = true
      try {
        // Здесь будет логика регистрации
        console.log('Registration attempt with:', this.name, this.email, this.password)

        // Симуляция успешной регистрации
        await new Promise((resolve) => setTimeout(resolve, 1000))
        this.$router.push('/login')
      } catch (error) {
        console.error('Registration error:', error)
        alert('Ошибка регистрации. Пожалуйста, попробуйте позже.')
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
}

.terms-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

.terms-checkbox input {
  width: auto;
  margin-top: 2px;
}

.terms-checkbox a {
  color: #2563eb;
  text-decoration: none;
}

.terms-checkbox a:hover {
  text-decoration: underline;
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

.auth-divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  color: #9ca3af;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
}

.auth-divider span {
  padding: 0 16px;
  font-size: 14px;
}

.social-auth {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.social-btn {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s;
}

.google-btn {
  background: white;
  color: #111827;
}

.google-btn span {
  background: #4285f4;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.google-btn:hover {
  background: #f3f4f6;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.login-link a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
