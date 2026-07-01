import { useRef, useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Capture() {
  const navigate = useNavigate()
  const location = useLocation()
  const { styleId = 'anime', styleName = '日系动漫', pickFromAlbum = false } = location.state || {}

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const streamRef = useRef(null)

  const [facingMode, setFacingMode] = useState('user')
  const [cameraReady, setCameraReady] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [camFailed, setCamFailed] = useState(false)

  // Start camera
  useEffect(() => {
    if (pickFromAlbum) {
      fileInputRef.current?.click()
      return
    }
    startCamera(facingMode)
    return () => { stopCamera() }
  }, [facingMode])

  const startCamera = async (mode) => {
    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1920 } },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraReady(true)
        setError('')
        setCamFailed(false)
      }
    } catch (e) {
      setCamFailed(true)
      setError('无法访问摄像头。请在浏览器设置中允许相机权限，或使用「从相册选择」。')
      setCameraReady(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraReady(false)
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  // Take photo → navigate to preview (preview calls generate)
  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    canvas.toBlob((blob) => {
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
      stopCamera()
      navigate('/preview/new', {
        state: { photoFile: file, photoDataUrl: dataUrl, styleId, styleName, pickFromAlbum }
      })
    }, 'image/jpeg', 0.9)
  }, [facingMode, styleId, styleName, pickFromAlbum, navigate])

  // Countdown
  const startCountdown = () => {
    setCountdown(3)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); takePhoto(); return 0 }
        return prev - 1
      })
    }, 800)
  }

  // Pick from album
  const handleFilePick = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        stopCamera()
        navigate('/preview/new', {
          state: { photoFile: file, photoDataUrl: ev.target.result, styleId, styleName, pickFromAlbum: false }
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="capture-container">
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFilePick} className="hidden" />

      {/* Camera View */}
      {!camFailed && (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      )}

      {/* Camera denied fallback */}
      {camFailed && (
        <div className="w-full h-full bg-surface flex flex-col items-center justify-center p-8 text-center">
          <span className="text-6xl mb-4">📷</span>
          <p className="text-text-primary font-medium mb-2">摄像头不可用</p>
          <p className="text-text-muted text-sm mb-6">{error}</p>
          <button onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium">
            📁 从相册选择照片
          </button>
        </div>
      )}

      {/* Countdown */}
      {countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-black/30">
          <span className="text-[100px] font-bold text-white drop-shadow-2xl animate-ping">{countdown}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <button onClick={() => { stopCamera(); navigate('/') }}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span className="text-white text-sm font-medium bg-black/30 backdrop-blur px-3 py-1.5 rounded-full">
          {styleName}
        </span>
        {!camFailed && (
          <button onClick={switchCamera}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </button>
        )}
      </div>

      {/* Bottom Bar */}
      {!camFailed && (
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center gap-4 z-10">
          <div className="flex items-center gap-5">
            <button onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white active:scale-90 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
            </button>

            <button onClick={startCountdown} disabled={!cameraReady}
              className="w-[72px] h-[72px] rounded-full border-[5px] border-white flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform">
              <div className="w-[56px] h-[56px] rounded-full bg-white" />
            </button>

            <button onClick={takePhoto} disabled={!cameraReady}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-xs font-medium disabled:opacity-30 active:scale-90 transition-transform">
              快拍
            </button>
          </div>
          <p className="text-white/50 text-xs">点中间倒计时3秒，或点「快拍」立即拍摄</p>
        </div>
      )}
    </div>
  )
}
