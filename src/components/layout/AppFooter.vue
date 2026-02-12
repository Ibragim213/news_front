<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <!-- О компании -->
        <div class="footer-section">
          <h3>О компании</h3>
          <p>Мы сохраняем постоянную стремление к совершенствованию и улучшению наших продуктов.</p>
        </div>

        <!-- Ресурсы -->
        <div class="footer-section">
          <h3>Ресурсы</h3>
          <ul>
            <li>Новости</li>
            <li>Документы</li>
            <li>Сотрудники</li>
            <li>Команда</li>
          </ul>
        </div>

        <!-- Контакты -->
        <div class="footer-section">
          <h3>Контакты</h3>
          <p>📞 +7 (928) 111-11-11</p>
          <p>📧 info@example.com</p>
          <p>🏢 г. Москва, ул. Примерная, д. 1</p>
        </div>

        <!-- Подписка -->
        <div class="footer-section">
          <h3>Подписка</h3>
          <p v-if="!subscribed">
            Подписывайтесь на наши рассылки, чтобы быть в курсе всех событий.
          </p>

          <!-- Форма подписки -->
          <form v-if="!subscribed" @submit.prevent="handleSubscribe" class="subscribe-form">
            <div class="form-group" :class="{ 'has-error': emailError }">
              <input
                type="email"
                v-model="email"
                placeholder="Ваш email"
                @input="clearError"
                @focus="clearError"
              />
              <span v-if="emailError" class="error-message"> ⚠️ {{ emailError }} </span>
            </div>
            <button type="submit" :disabled="isLoading" class="subscribe-btn">
              {{ isLoading ? 'Отправка...' : 'Подписаться' }}
            </button>
          </form>

          <!-- Сообщение об успешной подписке -->
          <div v-else class="success-message">
            <span class="success-icon">✨</span>
            <h4>Спасибо за подписку!</h4>
            <p>Мы будем присылать вам самые важные новости компании.</p>
            <button @click="resetForm" class="reset-btn">Подписать другой email</button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  data() {
    return {
      email: '',
      emailError: '',
      isLoading: false,
      subscribed: false,
    }
  },
  methods: {
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    },

    clearError() {
      this.emailError = ''
    },

    handleSubscribe() {
      // Валидация
      if (!this.email) {
        this.emailError = 'Введите адрес электронной почты'
        return
      }

      if (!this.validateEmail(this.email)) {
        this.emailError = 'Адрес должен содержать символ «@» и домен (например, name@mail.ru)'
        return
      }

      // Имитация отправки
      this.isLoading = true
      this.emailError = ''

      setTimeout(() => {
        this.isLoading = false
        this.subscribed = true
        this.email = ''

        // Сохраняем в localStorage
        const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]')
        subscribers.push({
          email: this.email,
          date: new Date().toISOString(),
        })
        localStorage.setItem('subscribers', JSON.stringify(subscribers))
      }, 1000)
    },

    resetForm() {
      this.subscribed = false
      this.email = ''
      this.emailError = ''
    },
  },
}
</script>

<style scoped>
.footer {
  background: #1f2937;
  color: white;
  padding: 50px 0 30px;
  margin-top: 60px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.footer-section h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #fff;
  position: relative;
  display: inline-block;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 2px;
  background: #3b82f6;
  border-radius: 2px;
}

.footer-section p {
  color: #9ca3af;
  line-height: 1.6;
  margin-bottom: 10px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  color: #9ca3af;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  padding-left: 0;
}

.footer-section ul li:hover {
  color: white;
  transform: translateX(5px);
}

/* Форма подписки */
.subscribe-form {
  margin-top: 15px;
}

.form-group {
  position: relative;
  margin-bottom: 12px;
}

.subscribe-form input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #374151;
  border-radius: 8px;
  background: #111827;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
}

.subscribe-form input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #1f2937;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.subscribe-form input::placeholder {
  color: #6b7280;
}

/* Стили для ошибки - подсказка СНИЗУ */
.form-group.has-error input {
  border-color: #ef4444;
  background: #2d1a1a;
}

.error-message {
  display: block;
  color: #fca5a5;
  font-size: 12px;
  margin-top: 6px;
  padding-left: 4px;
  animation: slideDown 0.2s ease;
  background: rgba(239, 68, 68, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #ef4444;
}

/* Кнопка подписки */
.subscribe-btn {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.subscribe-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.subscribe-btn:active:not(:disabled) {
  transform: translateY(0);
}

.subscribe-btn:disabled {
  background: #4b5563;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Успешная подписка */
.success-message {
  background: linear-gradient(135deg, #065f46 0%, #047857 100%);
  border-radius: 12px;
  padding: 24px 20px;
  text-align: center;
  animation: scaleIn 0.3s ease;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.success-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
  animation: bounce 0.5s ease;
}

.success-message h4 {
  color: white;
  font-size: 18px;
  margin: 0 0 8px;
  font-weight: 600;
}

.success-message p {
  color: #d1fae5;
  font-size: 13px;
  margin: 0 0 20px;
  opacity: 0.9;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(5px);
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* Анимации */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* Адаптив */
@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .footer-section {
    text-align: center;
  }

  .footer-section h3::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .footer-section ul li:hover {
    transform: translateX(0) scale(1.05);
  }

  .error-message {
    text-align: left;
  }
}
</style>
