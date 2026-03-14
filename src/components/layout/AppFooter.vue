<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <section class="footer-section">
          <h3>О компании</h3>
          <p>Здесь сотрудники получают новости, документы и важную рабочую информацию в одном месте.</p>
        </section>

        <section class="footer-section">
          <h3>Ресурсы</h3>
          <ul>
            <li><router-link to="/news" class="footer-link">Новости</router-link></li>
            <li><router-link to="/documents" class="footer-link">Документы</router-link></li>
            <li><router-link to="/employees" class="footer-link">Сотрудники</router-link></li>
            <li><router-link to="/calendar" class="footer-link">Календарь</router-link></li>
          </ul>
        </section>

        <section class="footer-section">
          <h3>Контакты</h3>
          <p>Телефон: +7 (928) 111-11-11</p>
          <p>Email: info@example.com</p>
          <p>Адрес: г. Москва, ул. Примерная, д. 1</p>
        </section>

        <section class="footer-section">
          <h3>Информация</h3>
          <p>На портале собраны рабочие новости, документы, контакты сотрудников и календарь общих событий.</p>
          <p>Для доступа к материалам используйте свой аккаунт сотрудника.</p>
        </section>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 60px;
  padding: 50px 0 30px;
  background: #1f2937;
  color: #ffffff;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 30px;
}

.footer-section h3 {
  margin: 0 0 20px;
  color: #ffffff;
  font-size: 18px;
}

.footer-section p,
.footer-section li {
  margin-bottom: 10px;
  color: #cbd5e1;
  line-height: 1.6;
}

.footer-section ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer-link {
  color: #cbd5e1;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover,
.footer-link.router-link-active {
  color: #ffffff;
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 16px;
  }

  .footer-grid {
    gap: 24px;
  }
}

@media (max-width: 420px) {
  .container {
    padding: 0 12px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
