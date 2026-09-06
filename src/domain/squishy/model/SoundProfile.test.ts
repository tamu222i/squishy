import { describe, it, expect } from 'vitest'
import { SoundProfile, SoundType } from './SoundProfile'

describe('SoundProfile (Value Object)', () => {
  it('creates a valid sound profile with default parameters', () => {
    const profile = new SoundProfile({
      soundType: 'crunch_beads',
      pitch: 1.0,
      intensity: 0.8,
      crackleRate: 0.7,
    })

    expect(profile.soundType).toBe('crunch_beads')
    expect(profile.pitch).toBe(1.0)
    expect(profile.intensity).toBe(0.8)
    expect(profile.crackleRate).toBe(0.7)
  })

  it('provides a SILENT preset', () => {
    const silent = SoundProfile.SILENT
    expect(silent.soundType).toBe('silent')
    expect(silent.intensity).toBe(0)
  })

  it('validates ranges for pitch and intensity', () => {
    expect(() => new SoundProfile({ soundType: 'air_slow', pitch: 0.1, intensity: 0.5, crackleRate: 0.5 })).toThrow()
    expect(() => new SoundProfile({ soundType: 'air_slow', pitch: 1.0, intensity: -0.1, crackleRate: 0.5 })).toThrow()
    expect(() => new SoundProfile({ soundType: 'air_slow', pitch: 1.0, intensity: 0.5, crackleRate: 1.5 })).toThrow()
  })

  it('correctly checks equality', () => {
    const p1 = new SoundProfile({ soundType: 'popping_candy', pitch: 1.2, intensity: 0.6, crackleRate: 0.9 })
    const p2 = new SoundProfile({ soundType: 'popping_candy', pitch: 1.2, intensity: 0.6, crackleRate: 0.9 })
    const p3 = new SoundProfile({ soundType: 'popping_candy', pitch: 1.0, intensity: 0.6, crackleRate: 0.9 })

    expect(p1.equals(p2)).toBe(true)
    expect(p1.equals(p3)).toBe(false)
  })
})
