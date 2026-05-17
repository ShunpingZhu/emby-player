import { getState, subscribe } from './state/store'
import { router } from './router/router'
import { initHome } from './pages/home'
import { initLibrary } from './pages/library'
import { initSearch } from './pages/search'
import { initSettings } from './pages/settings'

export function initApp(): void {
  // Show/hide login page based on auth state
  const loginPage = document.getElementById('login-page')!
  const appContainer = document.getElementById('app')!

  function updateUI(): void {
    const state = getState()
    if (state.accessToken) {
      loginPage.classList.add('hidden')
      appContainer.classList.remove('hidden')
    } else {
      loginPage.classList.remove('hidden')
      appContainer.classList.add('hidden')
    }
  }

  subscribe(updateUI)
  updateUI()

  // Register routes
  router.register('/', () => { router.navigate('/home') })
  router.register('/home', () => {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'))
    document.getElementById('page-home')?.classList.remove('hidden')
    initHome()
  })
  router.register('/movies', () => {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'))
    document.getElementById('page-movies')?.classList.remove('hidden')
    initLibrary('movies')
  })
  router.register('/tvshows', () => {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'))
    document.getElementById('page-tvshows')?.classList.remove('hidden')
    initLibrary('tvshows')
  })
  router.register('/search', () => {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'))
    document.getElementById('page-search')?.classList.remove('hidden')
    initSearch()
  })
  router.register('/detail', (params) => {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'))
    document.getElementById('page-detail')?.classList.remove('hidden')
    if (params.id) {
      import('./pages/detail').then(m => m.showDetail(params.id!))
    }
  })
  router.register('/settings', () => {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'))
    document.getElementById('page-settings')?.classList.remove('hidden')
    initSettings()
  })

  // Highlight active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.getAttribute('data-route') || '/home'
      router.navigate(route)
    })
  })
}