import { useState, useEffect, useRef } from 'react'
import { getStyles, createStyle, updateStyle, deleteStyle } from '../services/api'

const CATEGORIES = ['portrait', 'pet', 'couple', 'text', 'other']
const CATEGORY_LABELS = { portrait: '人物', pet: '宠物', couple: '情侣', text: '文字', other: '其他' }

export default function Styles() {
  const [styles, setStyles] = useState([])
  const [editing, setEditing] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef(null)

  const emptyForm = { name: '', prompt_template: '', category: 'portrait', icon: '🎯' }
  const [form, setForm] = useState(emptyForm)
  const [iconPreview, setIconPreview] = useState('') // base64 preview

  const load = () => {
    setLoading(true)
    getStyles()
      .then(res => setStyles(res.styles || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleIconUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) { alert('图标图片不能超过 500KB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setIconPreview(dataUrl)
      setForm({ ...form, icon: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    try {
      if (editing) {
        await updateStyle(editing.id, form)
      } else {
        await createStyle(form)
      }
      setShowNew(false)
      setEditing(null)
      setForm(emptyForm)
      setIconPreview('')
      load()
    } catch (e) {
      alert('保存失败：' + e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除这个风格？')) return
    try { await deleteStyle(id); load() } catch (e) { alert('删除失败：' + e.message) }
  }

  const startEdit = (style) => {
    setEditing(style)
    setForm({ name: style.name, prompt_template: style.prompt_template, category: style.category, icon: style.icon || '🎯' })
    setIconPreview(style.icon?.startsWith('data:') ? style.icon : '')
    setShowNew(true)
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="px-5 pt-10 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">风格管理</h1>
          <p className="text-text-muted text-sm mt-1">管理 AI 生成风格配方</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setIconPreview(''); setShowNew(true) }}
          className="px-3 py-2 bg-primary text-white text-sm font-medium rounded-xl active:scale-95 transition-transform">
          ＋ 新建
        </button>
      </header>

      {/* Form Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <div className="bg-surface-card w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-4">{editing ? '编辑风格' : '新建风格'}</h2>

            {/* Icon upload */}
            <div className="mb-3">
              <label className="text-xs text-text-muted mb-1.5 block">风格图标</label>
              <div className="flex items-center gap-3">
                <button onClick={() => fileRef.current?.click()}
                  className="w-16 h-16 rounded-xl bg-surface-input border-2 border-dashed border-text-muted/30 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors flex-shrink-0">
                  {iconPreview ? (
                    <img src={iconPreview} alt="" className="w-full h-full object-cover" />
                  ) : form.icon?.startsWith('data:') ? (
                    <img src={form.icon} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{form.icon || '🎯'}</span>
                  )}
                </button>
                <div>
                  <button onClick={() => fileRef.current?.click()}
                    className="text-xs text-primary hover:underline">📁 上传图片</button>
                  <p className="text-text-muted text-[10px] mt-0.5">PNG/JPG，不超过500KB<br/>建议正方形，会缩放到小图标</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleIconUpload} className="hidden" />
              </div>
            </div>

            {/* Or emoji fallback */}
            <div className="mb-3">
              <label className="text-xs text-text-muted">或使用 Emoji</label>
              <input value={form.icon?.length <= 4 ? form.icon : ''} onChange={e => setForm({ ...form, icon: e.target.value || '🎯' })}
                placeholder="🎯"
                className="w-full mt-1 px-3 py-2 bg-surface-input rounded-xl text-sm border border-white/5 focus:border-primary/50 focus:outline-none" />
            </div>

            <div className="mb-3">
              <label className="text-xs text-text-muted">风格名称</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="如：日系动漫风"
                className="w-full mt-1 px-3 py-2 bg-surface-input rounded-xl text-sm border border-white/5 focus:border-primary/50 focus:outline-none" />
            </div>
            <div className="mb-3">
              <label className="text-xs text-text-muted">分类</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-surface-input rounded-xl text-sm border border-white/5 focus:border-primary/50 focus:outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted">提示词模板</label>
              <textarea value={form.prompt_template} onChange={e => setForm({ ...form, prompt_template: e.target.value })}
                rows={4}
                placeholder="如：日系动漫风格，柔和粉彩色彩，大眼睛，干净描线，可爱贴纸质感"
                className="w-full mt-1 px-3 py-2 bg-surface-input rounded-xl text-sm border border-white/5 focus:border-primary/50 focus:outline-none resize-none" />
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowNew(false); setEditing(null); setIconPreview('') }}
                className="flex-1 py-3 bg-surface-input rounded-xl text-sm font-medium">取消</button>
              <button onClick={handleSave}
                className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-medium">{editing ? '更新' : '创建'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Style List */}
      <div className="px-5 pb-8 flex-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl skeleton mb-3" />)
        ) : styles.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">🎨</span>
            <p className="text-text-muted">还没有自定义风格</p>
            <p className="text-text-muted text-sm mt-1">点击右上角「新建」添加</p>
          </div>
        ) : (
          styles.map(style => (
            <div key={style.id} className="bg-surface-card rounded-2xl p-4 mb-3 border border-white/5 animate-fade-in">
              <div className="flex items-start gap-3">
                {/* Icon: image or emoji */}
                <div className="w-12 h-12 rounded-xl bg-surface-input flex items-center justify-center overflow-hidden flex-shrink-0">
                  {style.icon?.startsWith('data:') ? (
                    <img src={style.icon} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{style.icon || '🎯'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{style.name}</h3>
                    <span className="text-[10px] bg-surface-input text-text-muted px-1.5 py-0.5 rounded">
                      {CATEGORY_LABELS[style.category] || style.category}
                    </span>
                    {style.rating > 0 && (
                      <span className="text-[10px] text-yellow-400">{'⭐'.repeat(Math.min(style.rating, 5))}</span>
                    )}
                  </div>
                  <p className="text-text-muted text-xs mt-1 truncate">{style.prompt_template}</p>
                  <p className="text-text-muted text-[10px] mt-1">版本 {style.version || 1} · {style.usage_count || 0} 次使用</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => startEdit(style)}
                    className="text-text-muted hover:text-primary text-xs px-2 py-1">编辑</button>
                  <button onClick={() => handleDelete(style.id)}
                    className="text-text-muted hover:text-red-400 text-xs px-2 py-1">删除</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
