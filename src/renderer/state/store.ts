/**
 * Renderer State Store
 * 
 * Simple state management with pub/sub pattern and localStorage persistence.
 * 
 * Storage keys:
 * - emby_server: serverUrl
 * - emby_token: accessToken
 * - emby_user: user object (JSON stringified)
 */

export interface User {
  id: string
  name: string
}

export interface AppState {
  serverUrl: string | null
  accessToken: string | null
  user: User | null
}

// Storage keys
const STORAGE_KEYS = {
  serverUrl: 'emby_server',
  accessToken: 'emby_token',
  user: 'emby_user',
} as const

// Internal state
let state: AppState = {
  serverUrl: null,
  accessToken: null,
  user: null,
}

// Subscribers set
type Subscriber = (state: AppState) => void
const subscribers = new Set<Subscriber>()

/**
 * Get current state
 */
export function getState(): AppState {
  return { ...state }
}

/**
 * Set authentication data and persist to localStorage
 */
export function setAuth(serverUrl: string, accessToken: string, user: User): void {
  state = {
    ...state,
    serverUrl,
    accessToken,
    user,
  }

  // Persist to localStorage
  localStorage.setItem(STORAGE_KEYS.serverUrl, serverUrl)
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))

  // Notify subscribers
  notifySubscribers()
}

/**
 * Clear authentication data and remove from localStorage
 */
export function clearAuth(): void {
  state = {
    serverUrl: null,
    accessToken: null,
    user: null,
  }

  // Remove from localStorage
  localStorage.removeItem(STORAGE_KEYS.serverUrl)
  localStorage.removeItem(STORAGE_KEYS.accessToken)
  localStorage.removeItem(STORAGE_KEYS.user)

  // Notify subscribers
  notifySubscribers()
}

/**
 * Subscribe to state changes
 * @param fn - Callback function to invoke on state change
 * @returns Unsubscribe function
 */
export function subscribe(fn: Subscriber): () => void {
  subscribers.add(fn)
  return () => {
    subscribers.delete(fn)
  }
}

/**
 * Initialize store from localStorage
 * Call this on app startup to restore persisted state
 */
export function init(): void {
  const serverUrl = localStorage.getItem(STORAGE_KEYS.serverUrl)
  const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken)
  const userStr = localStorage.getItem(STORAGE_KEYS.user)

  if (serverUrl) {
    state.serverUrl = serverUrl
  }
  if (accessToken) {
    state.accessToken = accessToken
  }
  if (userStr) {
    try {
      state.user = JSON.parse(userStr) as User
    } catch {
      state.user = null
    }
  }

  // Don't notify subscribers on init - just restore state silently
}

// Helper to notify all subscribers
function notifySubscribers(): void {
  const currentState = getState()
  subscribers.forEach(fn => {
    try {
      fn(currentState)
    } catch (error) {
      console.error('[Store] Subscriber error:', error)
    }
  })
}