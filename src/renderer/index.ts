import './styles/main.css'
import { init } from './state/store'
import { router } from './router/router'
import { embyApi } from './api/emby'
import { initApp } from './app'

// Initialize store from localStorage
init()

// Restore API client from stored credentials
embyApi.restoreFromStorage()

// Initialize app (register routes, attach handlers)
initApp()

// Initialize router
router.init()