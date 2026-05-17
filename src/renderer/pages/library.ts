import { embyApi } from '../api/emby'
import { router } from '../router/router'

export function initLibrary(type: 'movies' | 'tvshows'): void {
  const container = document.getElementById(type === 'movies' ? 'page-movies' : 'page-tvshows')!
  container.innerHTML = '<div class="loading">加载中...</div>'
  
  const api = type === 'movies' ? embyApi.getMovies() : embyApi.getTvShows()
  
  api.then(items => {
    if (!items.length) {
      container.innerHTML = '<div class="empty-msg">暂无内容</div>'
      return
    }
    container.innerHTML = `<div class="media-grid">${items.map(item => renderCard(item)).join('')}</div>`
    container.querySelectorAll('.media-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id')
        if (id) router.navigate(`/detail?id=${id}`)
      })
    })
  }).catch(() => {
    container.innerHTML = '<div class="error-msg">加载失败</div>'
  })
}

function renderCard(item: any): string {
  const imgUrl = item.ImageTags?.Primary ? embyApi.getImageUrl(item.Id, 'Primary', 320) : ''
  return `<div class="media-card" data-id="${item.Id}">
    <div class="media-poster">${imgUrl ? `<img src="${imgUrl}" alt="${item.Name}" loading="lazy" onerror="this.parentElement.innerHTML='🎬'">` : '🎬'}</div>
    <div class="media-info">
      <div class="media-title">${item.Name}</div>
      ${item.ProductionYear ? `<div class="media-year">${item.ProductionYear}</div>` : ''}
    </div>
  </div>`
}