type RouteHandler = (params?: Record<string, string>) => void

const routes: Record<string, RouteHandler> = {}

function handleRoute(): void {
  const hash = window.location.hash.slice(1) || '/'
  // parse path and query
  const [path, queryString] = hash.split('?')
  const params: Record<string, string> = {}
  if (queryString) {
    new URLSearchParams(queryString).forEach((v, k) => { params[k] = v })
  }
  const handler = routes[path] || routes['/']
  handler?.(params)
}

export const router = {
  init(): void {
    window.addEventListener('hashchange', handleRoute)
    handleRoute()
  },
  navigate(path: string): void {
    window.location.hash = path
  },
  register(path: string, handler: RouteHandler): void {
    routes[path] = handler
  }
}

// Register routes
router.register('/', () => {
  // 显示首页
  console.log('Navigate to home')
})

router.register('/home', () => {
  // 显示首页
  console.log('Navigate to home')
})

router.register('/movies', () => {
  // 显示电影库
  console.log('Navigate to movies')
})

router.register('/tvshows', () => {
  // 显示剧集库
  console.log('Navigate to tvshows')
})

router.register('/search', () => {
  // 显示搜索页
  console.log('Navigate to search')
})

router.register('/detail', () => {
  // 显示详情页（从 query params 取 id）
  console.log('Navigate to detail')
})

router.register('/settings', () => {
  // 显示设置页
  console.log('Navigate to settings')
})
