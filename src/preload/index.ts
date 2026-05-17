import { contextBridge, ipcRenderer } from 'electron'

export interface EmbyRequestOptions {
  url: string
  method?: string
  headers?: Record<string, string>
}

export interface EmbyResponse {
  ok: boolean
  status: number
  data: unknown
}

export interface ElectronAPI {
  emby: {
    request: (options: EmbyRequestOptions) => Promise<EmbyResponse>
  }
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
    isMaximized: () => Promise<boolean>
    onMaximized: (callback: (isMaximized: boolean) => void) => () => void
  }
}

const electronAPI: ElectronAPI = {
  emby: {
    request: (options: EmbyRequestOptions) => ipcRenderer.invoke('emby:request', options)
  },
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximized: (callback: (isMaximized: boolean) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean) => callback(isMaximized)
      ipcRenderer.on('window:maximized', handler)
      return () => ipcRenderer.removeListener('window:maximized', handler)
    }
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
