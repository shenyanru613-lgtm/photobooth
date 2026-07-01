import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStyles, getGallery } from '../services/api'

const DEFAULT_STYLES = [
  { id: 'anime', name: '日系动漫', icon: '🌸', desc: '柔和动漫风', color: '#ec4899' },
  { id: 'comic', name: '美式漫画', icon: '💥', desc: '粗线条漫画', color: '#f97316' },
  { id: 'pixel', name: '像素复古', icon: '👾', desc: '16位游戏风', color: '#22c55e' },
  { id: 'chibi', name: 'Q版萌宠', icon: '🐾', desc: '超可爱萌宠', color: '#eab308' },
  { id: 'watercolor', name: '水彩手绘', icon: '🎨', desc: '手绘水彩', color: '#06b6d4' },
  { id: 'cheer', name: '治愈鼓励', icon: '💝', desc: '暖心插画', color: '#8b5cf6' },
]

export default function Home() {
  const navigate = useNavigate()
  const [styles, setStyles] = useState(DEFAULT_STYLES)
  const [selectedStyle, setSelectedStyle] = useState(DEFAULT_STYLES[0])
  const [recentItems, setRecentItems] = useState([])

  useEffect(() => {
    getStyles()
      .then(res => { if (res.styles?.length) setStyles(res.styles) })
      .catch(() => {})
    getGallery(1, 3)
      .then(res => setRecentItems((res.generations || []).slice(0, 3)))
      .catch(() => {})
  }, [])

  const handleStart = () => {
    navigate('/capture', { state: { styleId: selectedStyle.id, styleName: selectedStyle.name } })
  }

  const handleUpload = () => {
    navigate('/capture', { state: { styleId: selectedStyle.id, styleName: selectedStyle.name, pickFromAlbum: true } })
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="px-5 pt-10 pb-2 text-center animate-fade-in">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent-pink to-accent-orange bg-clip-text text-transparent">
          AI 拍照亭
        </h1>
        <p className="text-text-muted mt-1 text-sm">拍一张，就变贴纸 ✨</p>
      </header>

      {/* Style Picker */}
      <section className="px-5 flex-1">
        <h2 className="text-sm font-medium text-text-secondary mb-3">选择风格</h2>
        <div className="grid grid-cols-2 gap-3">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style)}
              className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 animate-fade-in ${
                selectedStyle.id === style.id
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-white/5 bg-surface-card hover:border-white/10'
              }`}
            >
              <span className="text-2xl">{style.icon || '🎯'}</span>
              <h3 className="font-semibold text-sm mt-2">{style.name}</h3>
              <p className="text-text-muted text-xs mt-0.5">{style.desc}</p>
            </button>
          ))}
        </div>

        {/* Custom prompt */}
        <div className="mt-4">
          <label className="text-xs text-text-muted" htmlFor="customPrompt">🖊️ 自定义风格描述（可选）</label>
          <input
            id="customPrompt"
            type="text"
            placeholder="比如：宫崎骏风格，暖色调..."
            className="w-full mt-1.5 px-4 py-3 bg-surface-input rounded-xl text-text-primary text-sm placeholder:text-text-muted border border-white/5 focus:border-primary/50 focus:outline-none transition-colors"
          />
        </div>

        {/* Recent items */}
        {recentItems.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-medium text-text-secondary mb-2">最近生成</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recentItems.map((item) => (
                <button key={item.id}
                  onClick={() => navigate('/preview/old', {
                    state: { results: [{ imageUrl: item.result_url, generationId: item.id, styleName: item.style_name, description: item.prompt_used, styleId: '' }] }
                  })}
                  className="w-16 h-16 rounded-xl overflow-hidden bg-surface-card flex-shrink-0 border border-white/5 hover:border-primary/50 transition-colors"
                >
                  <img src={item.result_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Actions */}
      <section className="px-5 pb-8 pt-4 flex flex-col gap-3 animate-slide-up">
        <button
          onClick={handleStart}
          className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl text-lg transition-all active:scale-95 shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          开始拍照
        </button>
        <button
          onClick={handleUpload}
          className="w-full py-3.5 bg-surface-card hover:bg-surface-input text-text-primary font-medium rounded-2xl border border-white/5 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          从相册选择
        </button>
      </section>
    </div>
  )
}
