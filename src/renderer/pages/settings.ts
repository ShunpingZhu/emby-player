import { getState, clearAuth } from '../state/store'
import { embyApi } from '../api/emby'

export function initSettings(): void {
  const container = document.getElementById('page-settings')!
  const state = getState()
  
  container.innerHTML = `
    <div class="page-header">
      <h2>设置</h2>
    </div>
    <div class="settings-section">
      <div class="settings-item">
        <span class="settings-label">服务器</span>
        <span class="settings-value">${state.serverUrl || '-'}</span>
      </div>
      <div class="settings-item">
        <span class="settings-label">用户</span>
        <span class="settings-value">${state.user?.name || '-'}</span>
      </div>
    </div>
    <button class="btn-primary" id="btn-logout" style="margin-top:24px;background:var(--error)">断开连接</button>
  `
  
  container.querySelector('#btn-logout')?.addEventListener('click', () => {
    embyApi.clear()
    clearAuth()
  })
}