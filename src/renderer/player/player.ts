import Hls from 'hls.js'

let hls: Hls | null = null
let videoEl: HTMLVideoElement | null = null

export function openPlayer(url: string, title?: string): void {
  const overlay = document.getElementById('player-overlay')!
  videoEl = document.getElementById('player-video') as HTMLVideoElement
  
  if (hls) {
    hls.destroy()
    hls = null
  }
  
  if (Hls.isSupported()) {
    hls = new Hls()
    hls.loadSource(url)
    hls.attachMedia(videoEl)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoEl?.play().catch(() => {})
    })
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        console.error('HLS fatal error:', data)
        alert('视频加载失败')
      }
    })
  } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    videoEl.src = url
    videoEl.play().catch(() => {})
  } else {
    alert('当前浏览器不支持 HLS 播放')
    return
  }
  
  overlay.classList.add('active')
  initControls()
}

export function closePlayer(): void {
  const overlay = document.getElementById('player-overlay')!
  overlay.classList.remove('active')
  
  if (videoEl) {
    videoEl.pause()
    videoEl.src = ''
  }
  if (hls) {
    hls.destroy()
    hls = null
  }
}

function initControls(): void {
  const video = videoEl!
  const playBtn = document.getElementById('btn-play-pause')!
  const closeBtn = document.getElementById('btn-close-player')!
  const fullscreenBtn = document.getElementById('btn-fullscreen')!
  const progressBar = document.getElementById('progress-bar')!
  const progressFill = document.getElementById('progress-fill')!
  const timeDisplay = document.getElementById('time-display')!
  
  // Play/Pause
  playBtn?.addEventListener('click', () => {
    if (video.paused) {
      video.play().catch(() => {})
      playBtn.textContent = '⏸'
    } else {
      video.pause()
      playBtn.textContent = '▶'
    }
  })
  
  // Close
  closeBtn?.addEventListener('click', closePlayer)
  
  // Fullscreen
  fullscreenBtn?.addEventListener('click', () => {
    const overlayEl = document.getElementById('player-overlay')!
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      overlayEl.requestFullscreen().catch(() => {})
    }
  })
  
  // Progress update
  video.addEventListener('timeupdate', () => {
    const pct = (video.currentTime / video.duration) * 100 || 0
    progressFill.style.width = pct + '%'
    timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`
  })
  
  // Seek
  progressBar?.addEventListener('click', (e: MouseEvent) => {
    const rect = progressBar.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    video.currentTime = pct * video.duration
  })
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!document.getElementById('player-overlay')?.classList.contains('active')) return
    switch (e.key) {
      case ' ':
        e.preventDefault()
        if (video.paused) { video.play().catch(() => {}) } else { video.pause() }
        break
      case 'ArrowRight':
        video.currentTime = Math.min(video.duration, video.currentTime + 10)
        break
      case 'ArrowLeft':
        video.currentTime = Math.max(0, video.currentTime - 10)
        break
      case 'Escape':
        closePlayer()
        break
    }
  })
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
