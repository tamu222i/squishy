import type { SoundTriggerInfo } from '../../domain/squishy/model/Squishy'

export interface IAsmrSoundPlayer {
  playSquish(trigger: SoundTriggerInfo): void
  playRelease(trigger: SoundTriggerInfo): void
}

export class WebAudioAsmrPlayer implements IAsmrSoundPlayer {
  private audioCtxFactory: () => AudioContext | null
  private cachedContext: AudioContext | null = null

  constructor(audioCtxFactory?: () => AudioContext | null) {
    this.audioCtxFactory =
      audioCtxFactory ??
      (() => {
        if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
          return new AudioContextClass()
        }
        return null
      })
  }

  private getContext(): AudioContext | null {
    if (!this.cachedContext) {
      this.cachedContext = this.audioCtxFactory()
    }
    if (this.cachedContext && this.cachedContext.state === 'suspended') {
      this.cachedContext.resume().catch(() => {})
    }
    return this.cachedContext
  }

  playSquish(trigger: SoundTriggerInfo): void {
    if (trigger.soundType === 'silent' || trigger.volume <= 0) {
      return
    }

    const ctx = this.getContext()
    if (!ctx) return

    switch (trigger.soundType) {
      case 'air_slow':
        this.playAirSlow(ctx, trigger)
        break
      case 'crunch_beads':
        this.playCrunch(ctx, trigger)
        break
      case 'popping_candy':
        this.playPopping(ctx, trigger)
        break
      case 'slime_gel':
        this.playSlime(ctx, trigger)
        break
      case 'squeak_toy':
        this.playSqueak(ctx, trigger)
        break
    }
  }

  playRelease(trigger: SoundTriggerInfo): void {
    if (trigger.soundType === 'silent' || trigger.volume <= 0) {
      return
    }

    const ctx = this.getContext()
    if (!ctx) return

    // Release sound is a softer, breath-like reverse or relaxation sound
    if (trigger.soundType === 'air_slow') {
      this.playAirSlow(ctx, { ...trigger, volume: trigger.volume * 0.7, pitch: trigger.pitch * 1.05 })
    } else if (trigger.soundType === 'slime_gel') {
      this.playSlime(ctx, { ...trigger, volume: trigger.volume * 0.5, pitch: trigger.pitch * 0.9 })
    }
  }

  private playAirSlow(ctx: AudioContext, trigger: SoundTriggerInfo): void {
    const duration = 0.6
    const sampleRate = ctx.sampleRate || 44100
    const bufferSize = Math.floor(sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate)
    const output = buffer.getChannelData(0)

    // Pink-ish / soft airy noise
    let b0 = 0, b1 = 0, b2 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.15
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(400 * trigger.pitch, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(150 * trigger.pitch, ctx.currentTime + duration)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.01, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(trigger.volume * 0.5, ctx.currentTime + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    source.start(ctx.currentTime)
    source.stop(ctx.currentTime + duration)
  }

  private playCrunch(ctx: AudioContext, trigger: SoundTriggerInfo): void {
    const duration = 0.25
    const sampleRate = ctx.sampleRate || 44100
    const bufferSize = Math.floor(sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate)
    const output = buffer.getChannelData(0)

    // Crackle / crunchy texture
    for (let i = 0; i < bufferSize; i++) {
      const isCrackle = Math.random() < 0.15 * (trigger.crackleCount / 5)
      output[i] = isCrackle ? (Math.random() * 2 - 1) * 0.7 : (Math.random() * 2 - 1) * 0.05
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1800 * trigger.pitch, ctx.currentTime)
    filter.Q.setValueAtTime(2.0, ctx.currentTime)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(trigger.volume * 0.8, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    source.start(ctx.currentTime)
    source.stop(ctx.currentTime + duration)
  }

  private playPopping(ctx: AudioContext, trigger: SoundTriggerInfo): void {
    const burstCount = Math.max(2, trigger.crackleCount)
    for (let i = 0; i < burstCount; i++) {
      const delay = Math.random() * 0.2
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'square'
      const freq = (1200 + Math.random() * 1500) * trigger.pitch
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + delay + 0.03)

      gain.gain.setValueAtTime(trigger.volume * 0.2, ctx.currentTime + delay)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.03)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.04)
    }
  }

  private playSlime(ctx: AudioContext, trigger: SoundTriggerInfo): void {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(320 * trigger.pitch, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(110 * trigger.pitch, ctx.currentTime + 0.18)

    gain.gain.setValueAtTime(trigger.volume * 0.6, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  }

  private playSqueak(ctx: AudioContext, trigger: SoundTriggerInfo): void {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(800 * trigger.pitch, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1600 * trigger.pitch, ctx.currentTime + 0.08)
    osc.frequency.exponentialRampToValueAtTime(1200 * trigger.pitch, ctx.currentTime + 0.15)

    gain.gain.setValueAtTime(trigger.volume * 0.5, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.16)
  }
}
