import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WebAudioAsmrPlayer } from './WebAudioAsmrPlayer'
import type { SoundTriggerInfo } from '../../domain/squishy/model/Squishy'

describe('WebAudioAsmrPlayer (Infrastructure)', () => {
  let mockAudioContext: any
  let player: WebAudioAsmrPlayer

  beforeEach(() => {
    mockAudioContext = {
      state: 'running',
      currentTime: 0,
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn(() => ({
        type: 'sine',
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createGain: vi.fn(() => ({
        gain: {
          value: 1,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      })),
      createBiquadFilter: vi.fn(() => ({
        type: 'lowpass',
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        Q: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
      })),
      createBuffer: vi.fn(() => ({
        getChannelData: vi.fn(() => new Float32Array(44100)),
      })),
      createBufferSource: vi.fn(() => ({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
    }

    player = new WebAudioAsmrPlayer(() => mockAudioContext)
  })

  it('plays air_slow squish sound using filtered noise', () => {
    const trigger: SoundTriggerInfo = {
      soundType: 'air_slow',
      volume: 0.8,
      pitch: 1.0,
      crackleCount: 1,
    }

    player.playSquish(trigger)

    expect(mockAudioContext.createBufferSource).toHaveBeenCalled()
    expect(mockAudioContext.createBiquadFilter).toHaveBeenCalled()
  })

  it('plays crunch_beads sound with crackles', () => {
    const trigger: SoundTriggerInfo = {
      soundType: 'crunch_beads',
      volume: 0.8,
      pitch: 1.1,
      crackleCount: 5,
    }

    player.playSquish(trigger)

    expect(mockAudioContext.createBufferSource).toHaveBeenCalled()
  })

  it('plays squeak_toy using pitch bent oscillator', () => {
    const trigger: SoundTriggerInfo = {
      soundType: 'squeak_toy',
      volume: 0.9,
      pitch: 1.4,
      crackleCount: 0,
    }

    player.playSquish(trigger)

    expect(mockAudioContext.createOscillator).toHaveBeenCalled()
  })

  it('does nothing when soundType is silent', () => {
    const trigger: SoundTriggerInfo = {
      soundType: 'silent',
      volume: 0.0,
      pitch: 1.0,
      crackleCount: 0,
    }

    player.playSquish(trigger)

    expect(mockAudioContext.createBufferSource).not.toHaveBeenCalled()
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
  })
})
