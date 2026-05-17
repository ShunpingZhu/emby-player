import { embyApi } from '../api/emby'
import { router } from '../router/router'

export function initSearch(): void {
  const container = document.getElementById('page-search')!
  const searchInput = container.querySelector('input') as HTMLInputElement
  const searchBtn = container.querySelector('.btn-primary') as HTMLButtonElement
  
  function doSearch(): void {
    const q = searchInput?.value?.trim()
    if (!q) return
    
    searchBtn?.setAttribute('disabled', '')
    container.querySelector('.media-grid')?.remove()
    const loadingEl = container.querySelector('.loading') || createLoading(container)
    loadingEl.textContent = '搜索中...'
    loadingEl.classList.remove('hidden')
    
    embyApi.search(q).then(hints => {
      loadingEl.classList.add('hidden')
      if (!hints.length) {
        container.innerHTML += '<div class="empty-msg">未找到结果</div>'
        return
      }
      const grid = document.createElement('div')
      grid.className = 'media-grid'
      grid.innerHTML = hints.map(h => renderHint(h)).join('')
      container.appendChild(grid)
      grid.querySelectorAll('.media-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-id')
          if (id) router.navigate(`/detail?id=${id}`)
        })
      })
    }).catch(() => {
      loadingEl.textContent = '搜索失败'
    }).finally(() => {
      searchBtn?.removeAttribute('disabled')
    })
  }
  
  searchBtn?.addEventListener('click', doSearch)
  searchInput?.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch() })
}

function renderHint(h: any): string {
  const imgUrl = h.ThumbImageTag ? embyApi.getImageUrl(h.ItemId, 'Primary', 320) : ''
  return `<div class="media-card" data-id="${h.ItemId}">
    <div class="media-poster">${imgUrl ? `<img src="${imgUrl}" alt="${h.Name}" loading="lazy" onerror="this.parentElement.innerHTML='🎬'">` : '🎬'}</div>
    <div class="media-info">
      <div class="media-title">${h.Name}</div>
      ${h.ProductionYear ? `<div class="media-year">${h.ProductionYear}</div>` : ''}
    </div>
  </div>`
}

function createLoading(parent: HTMLElement): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'loading hidden'
  parent.appendChild(el)
  return el
}