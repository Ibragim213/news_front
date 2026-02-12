<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <!-- О компании -->
        <div class="footer-section">
          <h3>О компании</h3>
          <p>Мы сохраняем постоянную стремление к совершенствованию и улучшению наших продуктов.</p>
        </div>

        <!-- Версии -->
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
          <p>🏢 📍 Адрес: г. Москва, ул. Примерная, д. 1</p>
        </div>

        <!-- Подписка -->
        <div class="footer-section">
          <h3>Подписка</h3>
          <p>Подписывайтесь на наши рассылки, чтобы быть в курсе всех событий.</p>
          <form class="subscribe-form">
            <input type="email" placeholder="Ваш email" />
            <button type="submit">Подписаться</button>
          </form>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #1f2937;
  color: white;
  padding: 50px 0 30px;
  margin-top: 60px;
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
}

.footer-section p {
  color: #bdc3c7;
  line-height: 1.6;
  margin-bottom: 10px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  color: #bdc3c7;
  margin-bottom: 10px;
  cursor: pointer;
}

.footer-section ul li:hover {
  color: white;
}

.thankful {
  margin-top: 15px;
  font-style: italic;
  color: #95a5a6 !important;
}

.subscribe-form {
  margin-top: 15px;
}

.subscribe-form input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: none;
  border-radius: 4px;
  background: #34495e;
  color: white;
}

.subscribe-form input::placeholder {
  color: #95a5a6;
}

.subscribe-form button {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.subscribe-form button:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 320px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
