import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { generateImage, printImage } from '../services/api'

const MAX_ATTEMPTS = 3

const PRINT_SIZES = [
  { id: 'keychain', label: '钥匙扣', size: '30mm圆', icon: '🔑' },
  { id: 'sticker_s', label: '小贴纸', size: '57×57mm', icon: '🟡' },
  { id: 'sticker_l', label: '大贴纸', size: '76×76mm', icon: '🟠' },
  { id: 'card', label: '明信片', size: '100×148mm', icon: '📮' },
]

export default function Preview() {
  const navigate = useNavigate()
  const location = useLocation()

  const { photoFile, photoDataUrl, styleId, styleName, pickFromAlbum } = location.state || {}
  const initialResults = location.state?.results || []
  const initialAttempt = location.state?.attempt || 0

  const [results, setResults] = useState(initialResults)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [attempt, setAttempt] = useState(initialAttempt)
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(0)
  const [error, setError] = useState('')

  // Print state
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [selectedSize, setSelectedSize] = useState('keychain')
  const [copies, setCopies] = useState(1)
  const [printing, setPrinting] = useState(false)
  const [printStatus, setPrintStatus] = useState('')
  const [printError, setPrintError] = useState('')
  const [printQueued, setPrintQueued] = useState(false)

  const [showAbortConfirm, setShowAbortConfirm] = useState(false)

  // Ref to prevent double generation in React StrictMode
  const startedRef = useRef(false)

  // === Auto-start first generation (only if we have a photoFile) ===
  useEffect(() => {
    if (!photoFile || results.length > 0 || startedRef.current) return
    startedRef.current = true
    doGenerate()
  }, [])

  // === Generation progress animation ===
  useEffect(() => {
    if (!generating) return
    let current = 0
    const timer = setInterval(() => {
      current++
      if (current < 3) setGenStep(current)
      else clearInterval(timer)
    }, 4000)
    return () => clearInterval(timer)
  }, [generating, attempt])

  // === Generate ===
  const doGenerate = useCallback(async () => {
    if (!photoFile) return
    setGenerating(true)
    setGenStep(0)
    setError('')
    try {
      const customPrompt = document.getElementById('customPrompt')?.value || ''
      const result = await generateImage(photoFile, styleId, customPrompt)
      const newResult = {
        id: Date.now(),
        imageUrl: result.imageUrl,
        description: result.description,
        prompt: result.revisedPrompt,
        generationId: result.generationId,
        styleName: result.styleName || styleName,
        styleId,
      }
      setResults(prev => {
        const updated = [...prev, newResult]
        setSelectedIdx(updated.length - 1)
        return updated
      })
      setAttempt(prev => prev + 1)
    } catch (e) {
      setError(e.message || 'AI 生成失败')
    } finally {
      setGenerating(false)
    }
  }, [photoFile, styleId, styleName])

  // === Print ===
  const handlePrint = async () => {
    const current = results[selectedIdx]
    if (!current) return

    setShowSizeModal(false)
    setPrinting(true)
    setPrintStatus('sending')
    setPrintQueued(false)
    try {
      const res = await printImage(current.generationId, { size: selectedSize, copies })
      if (res.relayed) {
        // Actually sent to printer
        setPrintStatus('printing')
      } else {
        // Queued — no relay connected
        setPrintQueued(true)
        setPrintStatus('')
      }
    } catch (e) {
      setPrintStatus('error')
      setPrintError(e.message || '打印失败')
    }
  }

  const handleCancelPrint = () => {
    setPrinting(false)
    setPrintStatus('')
    setPrintError('')
    setPrintQueued(false)
  }

  const handleAbort = () => setShowAbortConfirm(true)
  const confirmAbort = () => navigate('/')
  const handleNewPhoto = () => {
    navigate('/capture', { state: { styleId, styleName, pickFromAlbum } })
  }

  // === If coming from gallery (no photoFile, just viewing old results) ===
  const isViewingOld = !photoFile && results.length > 0

  // === Guards ===
  if (!photoFile && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh p-10 text-center">
        <span className="text-6xl mb-4">📸</span>
        <p className="text-text-muted mb-4">没有生成结果</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-primary text-white rounded-xl">返回首页</button>
      </div>
    )
  }

  const currentResult = results[selectedIdx]
  const remainingRegens = MAX_ATTEMPTS - attempt

  return (
    <div className="flex flex-col min-h-dvh">

      {/* ========== HEADER ========== */}
      <div className="flex items-center gap-3 px-5 pt-10 pb-3">
        <button onClick={handleAbort} className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-primary rounded-full">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h1 className="font-bold text-lg flex-1">预览结果</h1>
        {!isViewingOld && attempt > 0 && (
          <span className="text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-full font-medium">
            第 {attempt}/{MAX_ATTEMPTS} 次
          </span>
        )}
        <span className="text-xs bg-surface-input text-text-secondary px-2.5 py-1 rounded-full">{styleName || results[0]?.styleName}</span>
      </div>

      {/* ========== MAIN IMAGE ========== */}
      <div className="px-5 flex-1 flex flex-col items-center">
        <div className="w-full aspect-square bg-surface-card rounded-2xl overflow-hidden relative shadow-xl shadow-primary/10">
          {generating && results.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
              <GenerationSteps currentStep={genStep} />
            </div>
          ) : generating && results.length > 0 ? (
            <>
              <img src={currentResult?.imageUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-white text-sm font-medium">正在重新生成...</p>
                <GenerationSteps currentStep={genStep} dark />
              </div>
            </>
          ) : currentResult ? (
            <img src={currentResult.imageUrl} alt="" className="w-full h-full object-cover animate-fade-in" />
          ) : (
            <div className="skeleton w-full h-full" />
          )}

          {error && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-6">
              <span className="text-4xl mb-3">😥</span>
              <p className="text-red-400 text-sm text-center mb-3">{error}</p>
              <button onClick={doGenerate} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium">重试</button>
            </div>
          )}
        </div>

        {/* ========== THUMBNAIL STRIP ========== */}
        {!isViewingOld && (
          <div className="w-full mt-4 flex justify-center gap-3">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
              const hasResult = i < results.length
              const isSelected = i === selectedIdx
              return (
                <button
                  key={i}
                  onClick={() => hasResult && setSelectedIdx(i)}
                  disabled={!hasResult}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    isSelected
                      ? 'border-primary shadow-lg shadow-primary/30 scale-110'
                      : hasResult
                      ? 'border-white/10 opacity-60 hover:opacity-90'
                      : 'border-dashed border-text-muted/30 flex items-center justify-center'
                  }`}
                >
                  {hasResult ? (
                    <img src={results[i].imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : generating && i === results.length ? (
                    <div className="w-full h-full bg-surface-input flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <span className="text-text-muted text-xs">{i + 1}</span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {currentResult?.description && (
          <p className="text-text-muted text-xs mt-2">{currentResult.description}</p>
        )}
      </div>

      {/* ========== ACTIONS ========== */}
      <div className="px-5 pb-8 pt-4 flex flex-col gap-3 animate-slide-up">

        {/* ---- Regenerate — only if we have a photo to regenerate from ---- */}
        {!isViewingOld && remainingRegens > 0 ? (
          <button
            onClick={doGenerate}
            disabled={generating}
            className="w-full py-4 bg-accent-orange/15 hover:bg-accent-orange/25 text-accent-orange font-bold rounded-2xl text-lg transition-all active:scale-95 border-2 border-accent-orange/30 disabled:opacity-40 shadow-lg shadow-accent-orange/10 flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
            </svg>
            不满意？重新生成（还剩 {remainingRegens} 次）
          </button>
        ) : !isViewingOld && remainingRegens <= 0 ? (
          <div className="w-full py-3 bg-surface-card rounded-2xl text-text-muted text-sm text-center border border-white/5">
            3次生成机会已用完。选一张最好看的打印，或点「重新拍照」
          </div>
        ) : null}

        {/* Primary: Print */}
        <button
          onClick={() => setShowSizeModal(true)}
          disabled={generating || !currentResult}
          className="w-full py-4 bg-gradient-to-r from-primary to-accent-pink text-white font-bold rounded-2xl text-lg transition-all active:scale-95 shadow-lg shadow-primary/30 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 12H4a2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2h-2" /><rect x="6" y="14" width="12" height="8" />
          </svg>
          选择此张打印
        </button>

        {/* Retake / Back */}
        <button
          onClick={isViewingOld ? () => navigate('/gallery') : handleNewPhoto}
          className="w-full py-3 bg-surface-card hover:bg-surface-input text-text-primary font-medium rounded-2xl border border-white/5 transition-all active:scale-95"
        >
          {isViewingOld ? '📋 返回相册' : '📸 重新拍照'}
        </button>

        {!isViewingOld && (
          <button onClick={handleAbort} disabled={generating}
            className="w-full py-2 text-text-muted text-sm hover:text-red-400 transition-colors disabled:opacity-40">
            不打印了，返回首页
          </button>
        )}
      </div>

      {/* ========== SIZE MODAL ========== */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSizeModal(false)}>
          <div className="bg-surface-card w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-4">选择打印尺寸</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {PRINT_SIZES.map(s => (
                <button key={s.id} onClick={() => setSelectedSize(s.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    selectedSize === s.id ? 'border-primary bg-primary/10' : 'border-white/5 bg-surface-input hover:border-white/10'
                  }`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <p className="font-semibold text-sm mt-1">{s.label}</p>
                  <p className="text-text-muted text-xs">{s.size}</p>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between bg-surface-input rounded-xl px-4 py-3 mb-4">
              <span className="text-sm">份数</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setCopies(Math.max(1, copies - 1))}
                  className="w-8 h-8 rounded-lg bg-surface-card flex items-center justify-center text-sm font-bold">−</button>
                <span className="text-sm font-bold w-6 text-center">{copies}</span>
                <button onClick={() => setCopies(Math.min(9, copies + 1))}
                  className="w-8 h-8 rounded-lg bg-surface-card flex items-center justify-center text-sm font-bold">+</button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSizeModal(false)}
                className="flex-1 py-3 bg-surface-input rounded-xl text-sm font-medium">取消</button>
              <button onClick={handlePrint}
                className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold">确认打印</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== PRINTING OVERLAY ========== */}
      {printing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <PrintProgress status={printStatus} error={printError} queued={printQueued}
            onCancel={handleCancelPrint}
            selectedSize={selectedSize} copies={copies}
            onNewPhoto={() => { setPrinting(false); handleNewPhoto() }}
            onRetry={handlePrint}
          />
        </div>
      )}

      {/* ========== ABORT CONFIRM ========== */}
      {showAbortConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAbortConfirm(false)}>
          <div className="bg-surface-card rounded-2xl p-6 mx-5 max-w-sm text-center animate-fade-in" onClick={e => e.stopPropagation()}>
            <span className="text-4xl mb-3 block">🗑️</span>
            <p className="font-medium mb-1">放弃所有生成结果？</p>
            <p className="text-text-muted text-sm mb-4">已生成的 {results.length} 张图都会丢失</p>
            <div className="flex gap-3">
              <button onClick={() => setShowAbortConfirm(false)}
                className="flex-1 py-2.5 bg-surface-input rounded-xl text-sm font-medium">继续看看</button>
              <button onClick={confirmAbort}
                className="flex-1 py-2.5 bg-red-500/20 text-red-400 rounded-xl text-sm font-medium">确认放弃</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ========== Generation Steps ==========
function GenerationSteps({ currentStep, dark }) {
  const steps = [
    { label: '分析照片特征', icon: '🔍' },
    { label: '正在风格迁移', icon: '🎨' },
    { label: '优化处理细节', icon: '✨' },
  ]
  return (
    <div className="flex flex-col gap-3">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
            i < currentStep ? 'bg-green-500' : i === currentStep ? 'bg-primary animate-pulse-glow' : 'bg-white/10'
          }`}>
            {i < currentStep ? '✓' : s.icon}
          </span>
          <span className={`text-sm ${dark ? 'text-white/70' : 'text-text-secondary'} ${i === currentStep ? 'font-medium' : ''}`}>
            {s.label}{i === currentStep && <span className="animate-pulse">...</span>}
          </span>
        </div>
      ))}
    </div>
  )
}

// ========== Print Progress ==========
function PrintProgress({ status, error, queued, onCancel, selectedSize, copies, onNewPhoto, onRetry }) {
  const sizeObj = PRINT_SIZES.find(s => s.id === selectedSize)

  // Queued (no relay connected)
  if (queued) {
    return (
      <div className="bg-surface-card rounded-3xl p-8 mx-5 max-w-sm w-full text-center animate-fade-in">
        <span className="text-5xl mb-3 block">📋</span>
        <h2 className="text-lg font-bold mb-2">打印任务已排队</h2>
        <p className="text-text-muted text-sm mb-4">
          PC 打印服务未连接。<br/>请确保电脑上的打印中继正在运行。
        </p>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 mb-4">
          💡 在电脑上运行 <code className="bg-surface px-1 rounded">pc-print-relay/main.py</code> 后自动打印
        </div>
        <button onClick={onCancel}
          className="w-full py-3 bg-surface-input rounded-xl text-sm font-medium">
          知道了
        </button>
      </div>
    )
  }

  // Done
  if (status === 'done') {
    return (
      <div className="bg-surface-card rounded-3xl p-8 mx-5 max-w-sm w-full text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 className="text-xl font-bold mb-1">打印完成！</h2>
        <p className="text-text-muted text-sm mb-2">贴纸已从打印机吐出</p>
        <p className="text-text-muted text-xs mb-6">{sizeObj?.label} · {copies} 份</p>
        <button onClick={onNewPhoto}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold active:scale-95 transition-transform">
          再来一张
        </button>
      </div>
    )
  }

  // Error
  if (status === 'error') {
    return (
      <div className="bg-surface-card rounded-3xl p-8 mx-5 max-w-sm w-full text-center animate-fade-in">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </div>
        <h2 className="text-xl font-bold mb-1">打印失败</h2>
        <p className="text-red-400 text-sm mb-4">{error || '未知错误'}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 bg-surface-input rounded-xl text-sm font-medium">返回</button>
          <button onClick={onRetry} className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold">重试</button>
        </div>
      </div>
    )
  }

  // Progress
  const statusMap = {
    'sending': { progress: 30, text: '正在发送到打印机...' },
    'printing': { progress: 70, text: '打印机正在出纸...' },
  }
  const current = statusMap[status] || { progress: 10, text: '准备打印任务...' }

  return (
    <div className="bg-surface-card rounded-3xl p-8 mx-5 max-w-sm w-full text-center animate-fade-in">
      <span className="text-5xl mb-3 block">🖨️</span>
      <h2 className="font-bold text-lg mb-1">正在打印...</h2>
      <div className="w-full h-2 bg-surface-input rounded-full mt-4 mb-2 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${current.progress}%` }} />
      </div>
      <p className="text-text-muted text-sm mb-3">{current.text}</p>
      <div className="bg-surface-input rounded-xl p-3 text-left text-xs text-text-muted mb-4">
        <div className="flex justify-between mb-1"><span>尺寸</span><span className="text-text-primary">{sizeObj?.label} ({sizeObj?.size})</span></div>
        <div className="flex justify-between"><span>份数</span><span className="text-text-primary">{copies}</span></div>
      </div>
      <button onClick={onCancel}
        className="w-full py-3 bg-surface-input rounded-xl text-sm font-medium hover:text-red-400 transition-colors">
        取消打印
      </button>
    </div>
  )
}
