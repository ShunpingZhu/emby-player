import { embyApi } from '../api/emby'
import { setAuth, clearAuth, getState } from '../state/store'

export function initLogin(): void {
  const btn = document.getElementById('btn-login')
  const errorEl = document.getElementById('login-error')
  
  if (!btn) return
  
  btn.addEventListener('click', async () => {
    const serverInput = document.getElementById('login-server') as HTMLInputElement
    const userInput = document.getElementById('login-username') as HTMLInputElement
    const passInput = document.getElementById('login-password') as HTMLInputElement
    
    const server = serverInput?.value?.trim()
    const username = userInput?.value?.trim()
    const password = passInput?.value
    
    if (!server || !username || !password) {
      if (errorEl) errorEl.textContent = '请填写所有字段'
      return
    }
    
    btn.setAttribute('disabled', '')
    if (errorEl) errorEl.textContent = '连接中...'
    
    try {
      const result = await embyApi.authenticate(server, username, password)
      setAuth(server.replace(/\/$/, ''), result.AccessToken, { id: result.User.Id, name: result.User.Name })
      if (errorEl) errorEl.textContent = ''
    } catch (err: any) {
      if (errorEl) errorEl.textContent = err.message || '用户名或密码错误'
    } finally {
      btn.removeAttribute('disabled')
    }
  })
}