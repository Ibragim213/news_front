<template>
  <header class="header">
    <div class="container header-inner">
      <!-- Навигация -->
      <nav class="nav">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="nav-link"
          active-class="active"
        >
          {{ link.label }}
          <span class="nav-indicator"></span>
        </router-link>
      </nav>

      <!-- Профиль/Вход -->
      <div class="header-actions">
        <div class="user-menu" v-if="isAuthenticated">
          <router-link to="/profile" class="profile-link">
            <div class="profile-wrapper">
              <img src="@/assets/images/imagesss.png" alt="Профиль" class="profile-image" />
              <span class="profile-status"></span>
            </div>
            <span class="profile-name">{{ displayName }}</span>
          </router-link>
          <button @click="logout" class="logout-btn" title="Выйти">
            <span>🚪</span>
          </button>
        </div>

        <div v-else class="auth-links">
          <router-link to="/login" class="auth-link login-btn">Вход</router-link>
        </div>
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
          console.log('User loaded:', this.userData)
        } catch (e) {
          console.error('Error parsing user data', e)
          this.resetAuth()
        }
      } else {
        this.resetAuth()
      }
    },

    handleStorageChange(e) {
      if (e.key === 'token' || e.key === 'user') {
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
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.03);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-start;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  text-decoration: none;
  color: #4b5563;
  font-size: 15px;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  transition: all 0.3s ease;
  transform: translateX(-50%);
  border-radius: 3px 3px 0 0;
}

.nav-link:hover {
  background: rgba(37, 99, 235, 0.05);
  color: #2563eb;
  transform: translateY(-1px);
}

.nav-link:hover .nav-indicator {
  width: 30px;
}

.nav-link.active {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
}

.nav-link.active .nav-indicator {
  width: 30px;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
}

.nav-link:active {
  transform: scale(0.98);
  background: rgba(37, 99, 235, 0.12);
}

.header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px 6px 6px;
  text-decoration: none;
  border-radius: 40px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.5);
}

.profile-link:hover {
  background: rgba(37, 99, 235, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
}

.login-btn {
  background: #2563eb;
  color: white !important;
  padding: 8px 24px;
  border-radius: 40px;
}

.login-btn:hover {
  background: #1d4ed8 !important;
  color: white !important;
}

.profile-wrapper {
  position: relative;
}

.profile-image {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-link:hover .profile-image {
  border-color: #2563eb;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.profile-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
  display: block;
  transition: all 0.3s ease;
}

.profile-name {
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  transition: color 0.3s ease;
}

.profile-link:hover .profile-name {
  color: #2563eb;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 4px;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.1);
}

.auth-links {
  display: flex;
  gap: 12px;
}

.auth-link {
  padding: 8px 16px;
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.auth-link:hover {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.05);
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .nav {
    gap: 4px;
  }

  .nav-link {
    padding: 8px 12px;
    font-size: 14px;
  }

  .profile-name {
    display: none;
  }

  .logout-btn {
    padding: 6px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .nav-link {
    padding: 6px 10px;
    font-size: 13px;
  }

  .profile-image {
    width: 36px;
    height: 36px;
  }

  .profile-status {
    width: 10px;
    height: 10px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header {
  animation: fadeIn 0.5s ease;
}
</style>
