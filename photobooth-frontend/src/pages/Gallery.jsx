import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGallery } from '../services/api'

export default function Gallery() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGallery()
      .then(res => setItems(res.generations || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleItemClick = (item) => {
    navigate(`/preview/old`, { state: { results: [{ imageUrl: item.result_url, generationId: item.id, styleName: item.style_name, description: item.prompt_used }] } })
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-dvh">
        <header className="px-5 pt-10 pb-4">
          <h1 className="text-xl font-bold">我的相册</h1>
        </header>
        <div className="px-5 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl skeleton" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-dvh">
        <header className="px-5 pt-10 pb-4">
          <h1 className="text-xl font-bold">我的相册</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <span className="text-7xl mb-5">📸</span>
          <p className="text-text-primary font-medium text-lg mb-2">还没有生成过图片</p>
          <p className="text-text-muted text-sm mb-6">去首页拍张照，AI帮你变成卡通贴纸</p>
          <button onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium active:scale-95 transition-transform">
            去拍照
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="px-5 pt-10 pb-4">
        <h1 className="text-xl font-bold">我的相册</h1>
        <p className="text-text-muted text-sm mt-1">共 {items.length} 张生成记录</p>
      </header>

      <div className="px-5 pb-8 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id}
            onClick={() => handleItemClick(item)}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-surface-card animate-fade-in cursor-pointer active:scale-95 transition-transform">
            {item.result_url ? (
              <img src={item.result_url} alt={item.style_name} className="w-full h-full object-cover" />
            ) : (
              <div className="skeleton w-full h-full" />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-xs font-medium">{item.style_name}</p>
              <p className="text-white/60 text-[10px]">
                {item.created_at ? new Date(item.created_at).toLocaleDateString('zh-CN') : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
