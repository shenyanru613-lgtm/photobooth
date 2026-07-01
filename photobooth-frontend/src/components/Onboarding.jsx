import { useState, useEffect } from 'react'

const STEPS = [
  {
    emoji: '🎨',
    title: '选择风格',
    desc: '6种AI风格，日系动漫、Q版萌宠……选你喜欢的，也可以自定义风格描述',
  },
  {
    emoji: '📸',
    title: '拍张照片',
    desc: '站在镜头前，倒计时3秒拍照。或从相册选一张现成的照片',
  },
  {
    emoji: '🖨️',
    title: '拿到贴纸',
    desc: 'AI生成卡通图后，选尺寸一键打印。贴纸或钥匙扣，立刻拿到手',
  },
]

export default function Onboarding() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem('photobooth_onboarding_seen')
    if (!seen) {
      setShow(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('photobooth_onboarding_seen', '1')
    setShow(false)
  }

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(prev => prev + 1)
    } else {
      dismiss()
    }
  }

  if (!show) return null

  const current = STEPS[step]

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col" style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Skip */}
      <div className="px-5 pt-10 pb-4 flex justify-end">
        <button onClick={dismiss} className="text-text-muted text-sm hover:text-text-primary transition-colors">
          跳过
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 animate-fade-in" key={step}>
        <span className="text-7xl mb-8">{current.emoji}</span>
        <h2 className="text-2xl font-bold mb-3 text-center">{current.title}</h2>
        <p className="text-text-secondary text-center leading-relaxed">
          {current.desc}
        </p>
      </div>

      {/* Dots + Button */}
      <div className="px-5 pb-10 pt-4 flex flex-col items-center gap-6">
        {/* Dots */}
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${
              i === step ? 'bg-primary w-6' : 'bg-surface-input'
            }`} />
          ))}
        </div>

        <button onClick={next}
          className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl text-lg transition-all active:scale-95 shadow-lg shadow-primary/30">
          {step < STEPS.length - 1 ? '下一步' : '开始使用'}
        </button>
      </div>
    </div>
  )
}
