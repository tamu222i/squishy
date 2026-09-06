import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { Squishy } from '../../domain/squishy/model/Squishy'
import type { IAsmrSoundPlayer } from '../../infrastructure/sound/WebAudioAsmrPlayer'
import { calculateSquishDeformationProgress } from './squishyPhysics'

interface SquishyToyProps {
  squishy: Squishy
  soundPlayer: IAsmrSoundPlayer
  interactive?: boolean
  size?: number
  onSquished?: (force: number) => void
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  text: string
  opacity: number
  scale: number
}

export const SquishyToy: React.FC<SquishyToyProps> = ({
  squishy,
  soundPlayer,
  interactive = true,
  size = 240,
  onSquished,
}) => {
  const [deformation, setDeformation] = useState(0)
  const [isPressing, setIsPressing] = useState(false)
  const [pressPoint, setPressPoint] = useState({ x: 0.5, y: 0.5 })
  const [particles, setParticles] = useState<Particle[]>([])

  const targetForceRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const containerRef = useRef<HTMLDivElement>(null)
  const particleIdCounter = useRef(0)

  // Trigger ASMR Sound & Particles
  const triggerAsmr = useCallback(
    (force: number, clientX: number, clientY: number) => {
      const result = squishy.press(force)
      soundPlayer.playSquish(result.soundTrigger)
      onSquished?.(force)

      // Generate ASMR visual particles
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const px = clientX - rect.left
        const py = clientY - rect.top

        let particleText = '✨'
        if (result.soundTrigger.soundType === 'crunch_beads') particleText = '🥣'
        else if (result.soundTrigger.soundType === 'popping_candy') particleText = '💥'
        else if (result.soundTrigger.soundType === 'air_slow') particleText = '💨'
        else if (result.soundTrigger.soundType === 'slime_gel') particleText = '💧'
        else if (result.soundTrigger.soundType === 'squeak_toy') particleText = '🐥'

        const newParticles: Particle[] = []
        const count = Math.max(2, result.soundTrigger.crackleCount || 3)
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = 30 + Math.random() * 60
          newParticles.push({
            id: ++particleIdCounter.current,
            x: px,
            y: py,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 20,
            text: particleText,
            opacity: 1.0,
            scale: 0.8 + Math.random() * 0.5,
          })
        }
        setParticles((prev) => [...prev.slice(-15), ...newParticles])
      }
    },
    [squishy, soundPlayer, onSquished]
  )

  // Physics animation loop (Deformation & Slow Rising)
  useEffect(() => {
    let animId: number

    const updatePhysics = (time: number) => {
      const dt = Math.min(0.1, (time - lastTimeRef.current) / 1000)
      lastTimeRef.current = time

      setDeformation((prev) => {
        const next = calculateSquishDeformationProgress(
          prev,
          targetForceRef.current,
          dt,
          squishy.tactileProperty.softness,
          squishy.tactileProperty.slowRisingRate
        )
        return next
      })

      // Update particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            opacity: p.opacity - dt * 1.5,
          }))
          .filter((p) => p.opacity > 0)
      )

      animId = requestAnimationFrame(updatePhysics)
    }

    lastTimeRef.current = performance.now()
    animId = requestAnimationFrame(updatePhysics)

    return () => cancelAnimationFrame(animId)
  }, [squishy])

  // Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return
    e.preventDefault()
    setIsPressing(true)

    const rect = e.currentTarget.getBoundingClientRect()
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    setPressPoint({ x: relX, y: relY })

    targetForceRef.current = 0.85
    triggerAsmr(0.85, e.clientX, e.clientY)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !isPressing) return
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    setPressPoint({ x: relX, y: relY })

    // If moved significantly while pressing, trigger mild crackle
    if (Math.random() < 0.1) {
      triggerAsmr(0.6, e.clientX, e.clientY)
    }
  }

  const handlePointerUp = () => {
    if (!interactive) return
    setIsPressing(false)
    targetForceRef.current = 0

    const result = squishy.press(deformation)
    soundPlayer.playRelease(result.soundTrigger)
  }

  // Visual appearance styles
  // Base color
  const colorDeco = squishy.decorations.find((d) => d.type === 'color')
  const baseColor = colorDeco?.colorCode ?? squishy.baseMaterial.defaultColor

  // Sauce decoration
  const sauceDeco = squishy.decorations.find((d) => d.type === 'sauce')
  // Topping decoration
  const toppingDecos = squishy.decorations.filter((d) => d.type === 'topping')

  // Deformation transform calculation
  // scaleX expands outward when compressed (Poisson effect), scaleY squishes down
  const scaleY = 1.0 - deformation * 0.4
  const scaleX = 1.0 + deformation * 0.25
  const offsetY = deformation * 18
  const shadowScale = 1.0 + deformation * 0.35
  const shadowOpacity = 0.3 + deformation * 0.3

  // Mold identifier
  const moldId = squishy.mold?.id ?? 'melon_pan'

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center select-none cursor-pointer touch-none"
      style={{ width: size, height: size + 40 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Dynamic Floor Shadow */}
      <div
        className="absolute bottom-4 w-4/5 h-8 bg-neutral-900 rounded-full filter blur-md transition-opacity pointer-events-none"
        style={{
          transform: `scale(${shadowScale})`,
          opacity: shadowOpacity,
        }}
      />

      {/* Main Squishy Container */}
      <div
        className="relative transition-transform duration-75 ease-out"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          transform: `translateY(${offsetY}px) scale(${scaleX}, ${scaleY})`,
          transformOrigin: `${pressPoint.x * 100}% ${pressPoint.y * 100}%`,
        }}
      >
        {/* SVG Mold & Appearance */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full filter drop-shadow-lg overflow-visible"
        >
          <defs>
            {/* Shading Radial Gradient for puffy 3D feel */}
            <radialGradient id={`squishy-grad-${squishy.id.value}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="50%" stopColor={baseColor} />
              <stop offset="100%" stopColor={baseColor} style={{ filter: 'brightness(0.75)' }} />
            </radialGradient>

            {/* Indent Dent Shadow when pressed */}
            <radialGradient id="press-dent" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Render Shape by Mold */}
          {moldId === 'cat_bun' ? (
            <g>
              {/* Cat Ears */}
              <polygon points="45,65 25,15 80,40" fill={`url(#squishy-grad-${squishy.id.value})`} />
              <polygon points="155,65 175,15 120,40" fill={`url(#squishy-grad-${squishy.id.value})`} />
              <polygon points="45,60 35,25 75,45" fill="#fbcfe8" opacity="0.8" />
              <polygon points="155,60 165,25 125,45" fill="#fbcfe8" opacity="0.8" />
              {/* Cat Round Body */}
              <circle cx="100" cy="110" r="85" fill={`url(#squishy-grad-${squishy.id.value})`} />
              {/* Face */}
              <circle cx="70" cy="105" r="7" fill="#374151" />
              <circle cx="130" cy="105" r="7" fill="#374151" />
              <ellipse cx="60" cy="120" rx="10" ry="6" fill="#fda4af" opacity="0.8" />
              <ellipse cx="140" cy="120" rx="10" ry="6" fill="#fda4af" opacity="0.8" />
              {/* Cute Cat Mouth */}
              <path d="M 90 120 Q 95 127 100 120 Q 105 127 110 120" stroke="#374151" strokeWidth="4" fill="none" strokeLinecap="round" />
            </g>
          ) : moldId === 'shiba_toast' ? (
            <g>
              {/* Toast Crust */}
              <rect x="25" y="25" width="150" height="150" rx="40" fill="#b45309" />
              {/* Toast Inner */}
              <rect x="35" y="35" width="130" height="130" rx="30" fill={`url(#squishy-grad-${squishy.id.value})`} />
              {/* Shiba Ears */}
              <polygon points="45,45 30,10 75,30" fill="#d97706" />
              <polygon points="155,45 170,10 125,30" fill="#d97706" />
              {/* Shiba Eyes & Nose */}
              <circle cx="75" cy="95" r="6" fill="#1f2937" />
              <circle cx="125" cy="95" r="6" fill="#1f2937" />
              <ellipse cx="100" cy="110" rx="18" ry="12" fill="#ffffff" />
              <ellipse cx="100" cy="106" rx="6" ry="4" fill="#1f2937" />
              {/* Eyebrow dots */}
              <circle cx="75" cy="80" r="4" fill="#ffffff" />
              <circle cx="125" cy="80" r="4" fill="#ffffff" />
            </g>
          ) : moldId === 'bear_cake' ? (
            <g>
              {/* Bear Ears */}
              <circle cx="45" cy="45" r="30" fill={`url(#squishy-grad-${squishy.id.value})`} />
              <circle cx="155" cy="45" r="30" fill={`url(#squishy-grad-${squishy.id.value})`} />
              <circle cx="45" cy="45" r="16" fill="#fde68a" opacity="0.9" />
              <circle cx="155" cy="45" r="16" fill="#fde68a" opacity="0.9" />
              {/* Bear Head */}
              <circle cx="100" cy="110" r="82" fill={`url(#squishy-grad-${squishy.id.value})`} />
              {/* Muzzle */}
              <ellipse cx="100" cy="120" rx="26" ry="20" fill="#fef08a" />
              <ellipse cx="100" cy="112" rx="8" ry="5" fill="#451a03" />
              <circle cx="75" cy="95" r="6" fill="#451a03" />
              <circle cx="125" cy="95" r="6" fill="#451a03" />
            </g>
          ) : moldId === 'strawberry' ? (
            <g>
              {/* Strawberry Body */}
              <path
                d="M 100 185 C 40 160 25 100 35 60 C 45 35 80 35 100 45 C 120 35 155 35 165 60 C 175 100 160 160 100 185 Z"
                fill={`url(#squishy-grad-${squishy.id.value})`}
              />
              {/* Green Leaves */}
              <path
                d="M 100 45 L 85 10 L 95 38 L 65 20 L 85 45 L 100 45 L 115 45 L 135 20 L 105 38 L 115 10 Z"
                fill="#22c55e"
              />
              {/* Seeds */}
              {[
                [70, 75], [100, 70], [130, 75],
                [55, 105], [85, 105], [115, 105], [145, 105],
                [70, 135], [100, 135], [130, 135],
                [85, 160], [115, 160],
              ].map(([sx, sy], idx) => (
                <ellipse key={idx} cx={sx} cy={sy} rx="3" ry="5" fill="#fef08a" opacity="0.9" />
              ))}
            </g>
          ) : (
            // Default: Melon Pan (メロンパン)
            <g>
              <circle cx="100" cy="100" r="85" fill={`url(#squishy-grad-${squishy.id.value})`} />
              {/* Melon Pan Grid Lines */}
              <path
                d="M 40 65 Q 100 85 160 65 M 30 100 Q 100 120 170 100 M 40 135 Q 100 155 160 135
                   M 65 40 Q 85 100 65 160 M 100 30 Q 120 100 100 170 M 135 40 Q 155 100 135 160"
                stroke="#d97706"
                strokeWidth="4"
                strokeOpacity="0.4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Sugar Sparkles */}
              <circle cx="80" cy="70" r="3" fill="#ffffff" opacity="0.8" />
              <circle cx="120" cy="75" r="3" fill="#ffffff" opacity="0.8" />
              <circle cx="95" cy="115" r="3" fill="#ffffff" opacity="0.8" />
              <circle cx="135" cy="120" r="3" fill="#ffffff" opacity="0.8" />
            </g>
          )}

          {/* Sauce Layer */}
          {sauceDeco && (
            <path
              d="M 45 75 Q 70 95 100 80 Q 130 65 155 85 Q 145 110 130 95 Q 100 115 70 100 Q 55 115 45 75 Z"
              fill={sauceDeco.colorCode || '#e11d48'}
              opacity="0.85"
            />
          )}

          {/* Toppings (Sprinkles / Glitter) */}
          {toppingDecos.map((deco) =>
            deco.id === 'topping_sprinkles' ? (
              <g key={deco.id}>
                {[
                  { cx: 75, cy: 65, color: '#ec4899', rot: 25 },
                  { cx: 120, cy: 60, color: '#3b82f6', rot: -30 },
                  { cx: 90, cy: 95, color: '#eab308', rot: 15 },
                  { cx: 135, cy: 105, color: '#10b981', rot: -45 },
                  { cx: 65, cy: 125, color: '#8b5cf6', rot: 40 },
                  { cx: 110, cy: 135, color: '#ef4444', rot: 10 },
                ].map((s, i) => (
                  <rect
                    key={i}
                    x={s.cx - 6}
                    y={s.cy - 3}
                    width="12"
                    height="6"
                    rx="3"
                    fill={s.color}
                    transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
                  />
                ))}
              </g>
            ) : deco.id === 'topping_glitter' ? (
              <g key={deco.id}>
                {[
                  [65, 65], [130, 70], [80, 110], [125, 120], [95, 140]
                ].map(([gx, gy], i) => (
                  <text key={i} x={gx} y={gy} fontSize="14" fill="#ffffff" opacity="0.9">✨</text>
                ))}
              </g>
            ) : null
          )}

          {/* Finger Dent Overlay */}
          {deformation > 0.05 && (
            <ellipse
              cx={pressPoint.x * 200}
              cy={pressPoint.y * 200}
              rx={35 * (0.8 + deformation * 0.4)}
              ry={28 * (0.8 + deformation * 0.4)}
              fill="url(#press-dent)"
            />
          )}
        </svg>
      </div>

      {/* ASMR Floating Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none select-none font-bold text-lg"
          style={{
            left: p.x,
            top: p.y,
            transform: `translate(-50%, -50%) scale(${p.scale})`,
            opacity: p.opacity,
            transition: 'opacity 0.05s linear',
          }}
        >
          {p.text}
        </div>
      ))}

      {/* Pressure & Recovery Status Indicator */}
      <div className="mt-2 text-xs font-medium text-neutral-500 flex items-center gap-1">
        {deformation > 0.02 ? (
          <span className="text-amber-500 font-bold animate-pulse">
            むぎゅ度: {Math.round(deformation * 100)}%
            {squishy.tactileProperty.slowRisingRate > 0.7 && ' (ゆっくり復元中...)'}
          </span>
        ) : (
          <span className="text-neutral-400">👆 クリック／長押しでぷにぷに！</span>
        )}
      </div>
    </div>
  )
}
