<template>
  <header class="header">
    <div class="container header-inner">
      <nav class="nav" aria-label="Основная навигация">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="nav-link"
        >
          {{ link.label }}
        </router-link>
      </nav>

      <div class="header-actions">
        <template v-if="isAuthenticated">
          <router-link to="/profile" class="profile-link" :title="displayName">
            <img src="@/assets/images/imagesss.png" alt="Профиль" class="profile-image" />
            <span class="profile-name">{{ displayName }}</span>
          </router-link>

          <button class="logout-btn" type="button" @click="logout">Выйти</button>
        </template>

        <router-link v-else to="/login" class="login-btn">Войти</router-link>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  data() {
    return {
      navLinks: [
        { path: '/', label: 'Главная' },
        { path: '/news', label: 'Новости' },
        { path: '/documents', label: 'Документы' },
        { path: '/employees', label: 'Сотрудники' },
        { path: '/calendar', label: 'Календарь' },
      ],
      isAuthenticated: false,
      userData: {
        username: 'Гость',
        fullName: '',
        role: 'USER',
      },
    }
  },
  computed: {
    displayName() {
      return this.userData.fullName || this.userData.username
    },
  },
  created() {
    this.loadUserData()
  },
  mounted() {
    window.addEventListener('user-updated', this.loadUserData)
    window.addEventListener('storage', this.handleStorageChange)
  },
  beforeUnmount() {
    window.removeEventListener('user-updated', this.loadUserData)
    window.removeEventListener('storage', this.handleStorageChange)
  },
  methods: {
    loadUserData() {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (token && userStr) {
        try {
          this.userData = JSON.parse(userStr)
          this.isAuthenticated = true
        } catch (error) {
          console.error('Error parsing user data', error)
          this.resetAuth()
        }
      } else {
        this.resetAuth()
      }
    },

    handleStorageChange(event) {
      if (event.key === 'token' || event.key === 'user') {
        this.loadUserData()
      }
    },

    resetAuth() {
      this.isAuthenticated = false
      this.userData = {
        username: 'Гость',
        fullName: '',
        role: 'USER',
      }
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.resetAuth()
      window.dispatchEvent(new Event('user-updated'))
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 15px 0;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 28px;
  min-width: 0;
}

.nav-link {
  text-decoration: none;
  color: #334155;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #2563eb;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}

.profile-link:hover .profile-image {
  transform: scale(1.04);
  border-color: #2563eb;
}

.profile-name {
  max-width: 180px;
  overflow: hidden;
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn,
.login-btn {
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #2563eb;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.logout-btn:hover,
.login-btn:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

@media (max-width: 900px) {
  .header-inner {
    flex-direction: column;
    align-items: stretch;
  }

  .nav {
    gap: 18px;
    justify-content: center;
  }

  .header-actions {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 16px;
  }

  .nav {
    gap: 14px;
  }

  .nav-link {
    font-size: 14px;
  }

  .profile-name {
    max-width: 120px;
    font-size: 13px;
  }

  .logout-btn,
  .login-btn {
    padding: 9px 14px;
    font-size: 13px;
  }
}

@media (max-width: 420px) {
  .container {
    padding: 0 12px;
  }

  .nav {
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 4px;
  }

  .nav::-webkit-scrollbar {
    display: none;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .profile-name {
    display: none;
  }
}
</style>
