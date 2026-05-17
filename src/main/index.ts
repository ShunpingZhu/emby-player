import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import log from 'electron-log/main'

// Initialize electron-log for main process
log.initialize()
log.transports.file.level = 'info'
log.transports.console.level = 'debug'

// Log file location
log.transports.file.resolvePathFn = () => join(app.getPath('userData'), 'logs', 'main.log')

// Global exception handlers
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error)
  app.exit(1)
})

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection:', reason)
})

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  log.info('Creating main window...')

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    resizable: false,
    closable: true,
    minimizable: true,
    maximizable: true,
    frame: false,
    backgroundColor: '#0f0f1a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: false
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    log.info('Main window shown')
  })

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximized', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximized', false)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Load the app
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  log.info('Main window created successfully')
}

// Window control IPC handlers
ipcMain.on('window:minimize', () => {
  log.debug('IPC: window:minimize')
  mainWindow?.minimize()
})

ipcMain.on('window:maximize', () => {
  log.debug('IPC: window:maximize')
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('window:close', () => {
  log.debug('IPC: window:close')
  mainWindow?.close()
})

ipcMain.handle('window:isMaximized', () => {
  return mainWindow?.isMaximized() ?? false
})

// App info IPC handler
ipcMain.handle('app:version', () => {
  return app.getVersion()
})

// Emby API request handler (proxy to avoid CORS)
ipcMain.handle('emby:request', async (_event, options: { url: string; method?: string; headers?: Record<string, string>; body?: unknown }) => {
  log.info(`Emby request: ${options.method || 'GET'} ${options.url}`)
  
  try {
    const response = await fetch(options.url, {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    })

    const statusCode = response.status
    log.debug(`Emby response status: ${statusCode}`)

    // Check for error status codes
    if (statusCode >= 400) {
      const errorText = await response.text()
      log.error(`Emby request failed with status ${statusCode}: ${errorText}`)
      return {
        success: false,
        statusCode,
        error: `HTTP ${statusCode}: ${errorText.substring(0, 200)}`
      }
    }

    // Handle non-JSON responses (m3u8, text, etc.)
    const contentType = response.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      const data = await response.json()
      return {
        success: true,
        statusCode,
        data
      }
    } else {
      // Return text content for non-JSON responses (m3u8, etc.)
      const text = await response.text()
      return {
        success: true,
        statusCode,
        data: text
      }
    }
  } catch (error) {
    log.error('Emby request failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})

app.whenReady().then(() => {
  log.info('App ready, version:', app.getVersion())
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  log.info('All windows closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  log.info('App is quitting')
})