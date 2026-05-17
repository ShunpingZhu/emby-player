/**
 * Emby API Client
 * 
 * Singleton class for interacting with Emby media server API.
 * All HTTP requests are proxied through main process via window.electronAPI.embyRequest
 * to avoid CORS issues.
 */

import { getState, setAuth, clearAuth } from '../state/store'
import type {
  AuthResult,
  MediaFolder,
  EmbyItem,
  SearchHint,
} from '../../shared/types'

export class EmbyApiClient {
  private serverUrl: string = ''
  private accessToken: string = ''

  constructor() {
    // Initialize from storage if available
    this.restoreFromStorage()
  }

  /**
   * Generate X-Emby-Authorization header for API requests
   */
  private getAuthHeader(): Record<string, string> {
    return {
      'X-Emby-Authorization': 'MediaBrowser Client="EmbyPlayer", Device="Windows", DeviceId="emby-player-client", DeviceName="Windows PC", Version="1.0.0"',
    }
  }

  /**
   * Build full URL with api_key query parameter
   */
  private buildUrl(path: string): string {
    const base = this.serverUrl.replace(/\/$/, '') // Remove trailing slash
    const separator = path.includes('?') ? '&' : '?'
    return `${base}${path}${separator}api_key=${this.accessToken}`
  }

  /**
   * Unified request method that wraps window.electronAPI.embyRequest
   * Handles JSON parsing and error normalization
   */
  private async request<T>(url: string, method: 'GET' | 'POST' | 'DELETE' | 'PUT' = 'GET', body?: unknown): Promise<T> {
    const response = await window.electronAPI.embyRequest({
      url,
      method,
      headers: this.getAuthHeader(),
      body,
    })

    if (!response.success) {
      throw new Error(response.error || `Request failed with status ${response.statusCode}`)
    }

    return response.data as T
  }

  /**
   * Authenticate user with Emby server
   * POST /Users/AuthenticateByName
   */
  async authenticate(serverUrl: string, username: string, password: string): Promise<AuthResult> {
    // Normalize server URL - remove trailing slash
    this.serverUrl = serverUrl.replace(/\/$/, '')
    this.accessToken = ''

    const url = `${this.serverUrl}/Users/AuthenticateByName`
    
    const response = await this.request<AuthResult>(url, 'POST', {
      Username: username,
      Pw: password,
    })

    // Store credentials
    this.accessToken = response.AccessToken
    
    const user = {
      id: response.User.Id,
      name: response.User.Name,
    }
    
    // Persist to store
    setAuth(this.serverUrl, this.accessToken, user)

    return response
  }

  /**
   * Get all media folders (libraries)
   * GET /Library/MediaFolders
   */
  async getMediaFolders(): Promise<MediaFolder[]> {
    const url = this.buildUrl('/Library/MediaFolders')
    const response = await this.request<{ Items: MediaFolder[] }>(url)
    return response.Items || []
  }

  /**
   * Get latest items (recently added)
   * GET /Items?SortBy=DateCreated&SortOrder=Descending&Recursive=true
   */
  async getLatestItems(limit: number = 20): Promise<EmbyItem[]> {
    const url = this.buildUrl(`/Items?SortBy=DateCreated&SortOrder=Descending&Recursive=true&Limit=${limit}`)
    const response = await this.request<{ Items: EmbyItem[] }>(url)
    return response.Items || []
  }

  /**
   * Get items by library (folder)
   * GET /Items?ParentId={id}&SortBy=Name&Recursive=true
   */
  async getItemsByLibrary(parentId: string, limit: number = 100): Promise<EmbyItem[]> {
    const url = this.buildUrl(`/Items?ParentId=${parentId}&SortBy=Name&Recursive=true&Limit=${limit}`)
    const response = await this.request<{ Items: EmbyItem[] }>(url)
    return response.Items || []
  }

  /**
   * Get all movies
   * GET /Items?Recursive=true&IncludeMediaTypes=1
   */
  async getMovies(): Promise<EmbyItem[]> {
    const url = this.buildUrl('/Items?Recursive=true&IncludeMediaTypes=1')
    const response = await this.request<{ Items: EmbyItem[] }>(url)
    return response.Items || []
  }

  /**
   * Get all TV shows
   * GET /Items?Recursive=true&IncludeMediaTypes=2
   */
  async getTvShows(): Promise<EmbyItem[]> {
    const url = this.buildUrl('/Items?Recursive=true&IncludeMediaTypes=2')
    const response = await this.request<{ Items: EmbyItem[] }>(url)
    return response.Items || []
  }

  /**
   * Get item details including seasons and episodes for TV shows
   * GET /Items/{id}?Fields=Seasons,Episodes,Overview,Genres,Studios
   */
  async getItem(id: string): Promise<EmbyItem> {
    const url = this.buildUrl(`/Items/${id}?Fields=Seasons,Episodes,Overview,Genres,Studios`)
    return this.request<EmbyItem>(url)
  }

  /**
   * Search for media items
   * GET /Search/Hints?searchTerm={query}&limit=20
   */
  async search(query: string): Promise<SearchHint[]> {
    const encodedQuery = encodeURIComponent(query)
    const url = this.buildUrl(`/Search/Hints?searchTerm=${encodedQuery}&limit=20`)
    const response = await this.request<{ SearchHints: SearchHint[] }>(url)
    return response.SearchHints || []
  }

  /**
   * Get image URL for an item
   * GET /Items/{id}/Images/{type}?maxWidth={width}&api_key={token}
   */
  getImageUrl(itemId: string, imageType: 'Primary' | 'Backdrop' | 'Thumb', maxWidth?: number): string {
    const base = this.serverUrl.replace(/\/$/, '')
    let url = `${base}/Items/${itemId}/Images/${imageType}?api_key=${this.accessToken}`
    if (maxWidth) {
      url += `&maxWidth=${maxWidth}`
    }
    return url
  }

  /**
   * Get HLS stream URL for an item
   * GET /Videos/{id}/live.m3u8?api_key={token}
   * Returns the raw m3u8 content as a string (full stream URL)
   */
  async getStreamUrl(itemId: string): Promise<string> {
    const url = this.buildUrl(`/Videos/${itemId}/live.m3u8`)
    // Request returns raw m3u8 text content
    const m3u8Content = await this.request<string>(url)
    return m3u8Content
  }

  /**
   * Check if client is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return this.accessToken !== '' && this.serverUrl !== ''
  }

  /**
   * Restore authentication state from store
   */
  restoreFromStorage(): void {
    const state = getState()
    if (state.serverUrl) {
      this.serverUrl = state.serverUrl
    }
    if (state.accessToken) {
      this.accessToken = state.accessToken
    }
  }

  /**
   * Clear all authentication state
   */
  clear(): void {
    this.serverUrl = ''
    this.accessToken = ''
    clearAuth()
  }
}

// Singleton instance
export const embyApi = new EmbyApiClient()