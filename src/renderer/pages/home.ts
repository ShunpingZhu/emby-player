import { embyApi } from '../api/emby'
import { router } from '../router/router'

export function initHome(): void {
  const container = document.getElementById('page-home')!
  container.innerHTML = '<div class="loading">加载中...</div>'
  
  Promise.all([
    embyApi.getMediaFolders(),
    embyApi.getLatestItems(8)
  ]).then(([folders, items]) => {
    if (!folders.length) {
      container.innerHTML = '<div class="empty-msg">暂无内容</div>'
      return
    }
    
    let html = ''
    for (const folder of folders) {
      const folderItems = items.filter(item => item.Type === (folder.CollectionType === 'movies' ? 'Movie' : folder.CollectionType === 'tvshows' ? 'Series' : ''))
      if (!folderItems.length) continue
      html += `<div class="section-block">
        <div class="section-title">${folder.Name}</div>
        <div class="media-grid">${folderItems.map(item => renderCard(item)).join('')}</div>
      </div>`
    }
    container.innerHTML = html || '<div class="empty-msg">暂无内容</div>'
    
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
  const imgUrl = item.ImageTags?.Primary 
    ? embyApi.getImageUrl(item.Id, 'Primary', 320)
    : ''
  return `<div class="media-card" data-id="${item.Id}">
    <div class="media-poster">${imgUrl ? `<img src="${imgUrl}" alt="${item.Name}" loading="lazy" onerror="this.parentElement.innerHTML='🎬'">` : '🎬'}</div>
    <div class="media-info">
      <div class="media-title">${item.Name}</div>
      ${item.ProductionYear ? `<div class="media-year">${item.ProductionYear}</div>` : ''}
    </div>
  </div>`
}