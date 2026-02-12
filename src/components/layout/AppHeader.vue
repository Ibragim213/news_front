<template>
  <header class="header">
    <div class="container header-inner">
      <nav class="nav">
        <router-link to="/">Главная</router-link>
        <router-link to="/news">Новости</router-link>
        <router-link to="/documents">Документы</router-link>
        <router-link to="/employees">Сотрудники</router-link>
        <router-link to="/calendar">Календарь</router-link>
      </nav>
      <div class="header-actions">
        <!-- ТОЛЬКО ФОТО, БЕЗ УВЕДОМЛЕНИЙ -->
        <router-link to="/profile" class="profile-link">
          <img src="@/assets/images/imagesss.png" alt="Профиль" class="profile-image" />
        </router-link>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: white;
  border-bottom: 1px solid #eee;
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav a {
  margin-right: 30px;
  text-decoration: none;
  color: #333;
  font-size: 15px;
}

.nav a.router-link-active {
  color: #007bff;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
}

.profile-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.profile-image:hover {
  transform: scale(1.05);
  border-color: #007bff;
}

@media (max-width: 320px) {
  .profile-image {
    width: 32px;
    height: 32px;
  }

  .nav a {
    margin-right: 15px;
    font-size: 13px;
  }
}
</style>
