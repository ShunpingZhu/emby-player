import { contextBridge, ipcRenderer } from 'electron'

interface EmbyRequestOptions {
  url: string
  method: 'GET' | 'POST' | 'DELETE' | 'PUT'
  headers: Record<string, string>
  body?: any
}

contextBridge.exposeInMainWorld('electronAPI', {
  embyRequest: (options: EmbyRequestOptions) => ipcRenderer.invoke('emby:request', options),
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized')
  },
  getVersion: () => ipcRenderer.invoke('app:version')
})