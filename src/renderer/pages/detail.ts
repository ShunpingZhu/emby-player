import { embyApi } from '../api/emby'
import { openPlayer } from '../player/player'

export function showDetail(id: string): void {
  const container = document.getElementById('page-detail')!
  container.innerHTML = '<div class="loading">加载中...</div>'
  
  embyApi.getItem(id).then(item => {
    const imgUrl = item.ImageTags?.Primary ? embyApi.getImageUrl(item.Id, 'Primary', 600) : ''
    const runtime = item.RunTimeTicks ? Math.round(item.RunTimeTicks / 10000000) : 0
    const hours = Math.floor(runtime / 3600)
    const mins = Math.floor((runtime % 3600) / 60)
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    
    let bodyHtml = `
      <div class="detail-container">
        <div class="detail-poster">
          ${imgUrl ? `<img src="${imgUrl}" alt="${item.Name}" onerror="this.src=''">` : '<div style="width:280px;height:420px;background:var(--poster-placeholder);display:flex;align-items:center;justify-content:center;font-size:64px;border-radius:8px">🎬</div>'}
        </div>
        <div class="detail-info">
          <h1 class="detail-title">${item.Name}</h1>
          <div class="detail-meta">
            ${item.ProductionYear || ''}
            ${runtime ? ` · ${timeStr}` : ''}
            ${item.Genres?.length ? ` · ${item.Genres.join(', ')}` : ''}
          </div>
          ${item.Overview ? `<p class="detail-overview">${item.Overview}</p>` : ''}
          ${item.Type === 'Movie' ? `<button class="btn-primary" id="btn-play" style="margin-top:24px;max-width:200px">▶ 播放</button>` : ''}
        </div>
      </div>
    `
    
    // Series: show season/episode list
    if (item.Type === 'Series' && item.Seasons?.length) {
      bodyHtml += `<div class="seasons-section" style="margin-top:32px;padding:0 24px">
        <div class="section-title">剧集</div>
        <div class="seasons-list" id="seasons-list"></div>
      </div>`
    }
    
    container.innerHTML = bodyHtml
    
    // Play button
    if (item.Type === 'Movie') {
      container.querySelector('#btn-play')?.addEventListener('click', async () => {
        const streamUrl = await embyApi.getStreamUrl(item.Id)
        openPlayer(streamUrl, item.Name)
      })
    }
    
    // Seasons/Episodes
    if (item.Type === 'Series' && item.Seasons?.length) {
      const seasonsList = container.querySelector('#seasons-list')!
      // For simplicity, show all episodes directly under seasons
      // Expand season on click
      item.Seasons.forEach(season => {
        const seasonEl = document.createElement('div')
        seasonEl.className = 'season-block'
        seasonEl.innerHTML = `<div class="season-title" style="cursor:pointer;padding:12px 0;border-bottom:1px solid var(--border)">📺 ${season.Name} (${season.EpisodeCount} 集)</div>
          <div class="season-episodes hidden" id="season-${season.Id}"></div>`
        seasonsList.appendChild(seasonEl)
        
        seasonEl.querySelector('.season-title')?.addEventListener('click', async () => {
          const epContainer = document.getElementById(`season-${season.Id}`)!
          epContainer.classList.toggle('hidden')
          if (!epContainer.innerHTML) {
            // Load episodes for this season
            const seasonDetail = await embyApi.getItem(season.Id)
            epContainer.innerHTML = seasonDetail.Episodes?.map((ep: any) => 
              `<div class="episode-item" data-id="${ep.Id}" style="padding:10px 0;cursor:pointer;border-bottom:1px solid var(--border);display:flex;justify-content:space-between">
                <span>第 ${ep.IndexNumber} 集${ep.Name ? ': ' + ep.Name : ''}</span>
                ${ep.RunTimeTicks ? `<span style="color:var(--text-secondary)">${Math.round(ep.RunTimeTicks/10000000)}m</span>` : ''}
              </div>`
            ).join('') || '暂无集数据'
            
            epContainer.querySelectorAll('.episode-item').forEach(el => {
              el.addEventListener('click', async () => {
                const epId = el.getAttribute('data-id')
                if (epId) {
                  const streamUrl = await embyApi.getStreamUrl(epId)
                  openPlayer(streamUrl, `${item.Name} 第${season.SeasonNumber}季第${el.querySelector('span')?.textContent?.match(/\d+/)?.[0]}集`)
                }
              })
            })
          }
        })
      })
    }
  }).catch(() => {
    container.innerHTML = '<div class="error-msg">加载详情失败</div>'
  })
}