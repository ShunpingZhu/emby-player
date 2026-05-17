/**
 * Emby API Shared TypeScript Types
 * All data models for Emby media server integration
 */

/**
 * Global window.electronAPI type declaration for renderer process
 */
export interface ElectronAPI {
  embyRequest: (options: EmbyRequestOptions) => Promise<EmbyResponse>
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
  getVersion: () => Promise<string>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

/**
 * Authentication result from Emby login
 */
export interface AuthResult {
  User: { Id: string; Name: string }
  AccessToken: string
  ServerId: string
}

/**
 * Media library folder
 */
export interface MediaFolder {
  Id: string
  Name: string
  CollectionType: 'movies' | 'tvshows' | 'music' | 'books' | 'photos' | ''
}

/**
 * Base Emby media item
 * Note: RunTimeTicks is in 100ns units. Convert to seconds: RunTimeTicks / 10_000_000
 */
export interface EmbyItem {
  Id: string
  ItemId?: string
  Name: string
  Type: 'Movie' | 'Series' | 'Episode' | 'Season' | 'Folder' | 'Book' | 'Photo' | 'Audio' | 'Playlist' | 'BoxSet'
  ProductionYear?: number
  /** RunTimeTicks unit: 100ns (convert to seconds: / 10_000_000) */
  RunTimeTicks?: number
  Overview?: string
  Genres?: string[]
  Studios?: Array<{ Name: string }>
  ImageTags?: { Primary?: string; Backdrop?: string; Thumb?: string }
  Seasons?: Season[]
  Episodes?: Episode[]
}

/**
 * TV series season
 */
export interface Season {
  Id: string
  Name: string
  SeasonNumber: number
  EpisodeCount: number
}

/**
 * TV episode
 */
export interface Episode {
  Id: string
  Name: string
  IndexNumber: number
  SeasonId: string
  /** RunTimeTicks unit: 100ns (convert to seconds: / 10_000_000) */
  RunTimeTicks?: number
  Overview?: string
}

/**
 * Search hint result from Emby search
 */
export interface SearchHint {
  ItemId: string
  Name: string
  Type: string
  ProductionYear?: number
  ThumbImageTag?: string
}

/**
 * HTTP request options for Emby API
 */
export interface EmbyRequestOptions {
  url: string
  method: 'GET' | 'POST' | 'DELETE' | 'PUT'
  headers: Record<string, string>
  body?: unknown
}

/**
 * Standardized API response wrapper
 */
export interface EmbyResponse {
  success: boolean
  data?: unknown
  error?: string
  statusCode?: number
}

/**
 * Application global state
 */
export interface AppState {
  serverUrl: string | null
  accessToken: string | null
  user: { id: string; name: string } | null
}
