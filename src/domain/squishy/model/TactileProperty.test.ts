import { describe, it, expect } from 'vitest'
import { TactileProperty } from './TactileProperty'

describe('TactileProperty (Value Object)', () => {
  it('creates valid tactile property within 0.0 to 1.0', () => {
    const prop = new TactileProperty({
      softness: 0.8,
      slowRisingRate: 0.9,
      elasticity: 0.3,
    })

    expect(prop.softness).toBe(0.8)
    expect(prop.slowRisingRate).toBe(0.9)
    expect(prop.elasticity).toBe(0.3)
  })

  it('throws error when values are out of 0.0 - 1.0 range', () => {
    expect(() => new TactileProperty({ softness: -0.1, slowRisingRate: 0.5, elasticity: 0.5 })).toThrow()
    expect(() => new TactileProperty({ softness: 1.1, slowRisingRate: 0.5, elasticity: 0.5 })).toThrow()
    expect(() => new TactileProperty({ softness: 0.5, slowRisingRate: -0.01, elasticity: 0.5 })).toThrow()
    expect(() => new TactileProperty({ softness: 0.5, slowRisingRate: 0.5, elasticity: 1.5 })).toThrow()
  })

  it('correctly compares two instances for equality', () => {
    const prop1 = new TactileProperty({ softness: 0.5, slowRisingRate: 0.7, elasticity: 0.4 })
    const prop2 = new TactileProperty({ softness: 0.5, slowRisingRate: 0.7, elasticity: 0.4 })
    const prop3 = new TactileProperty({ softness: 0.6, slowRisingRate: 0.7, elasticity: 0.4 })

    expect(prop1.equals(prop2)).toBe(true)
    expect(prop1.equals(prop3)).toBe(false)
  })

  it('combines two tactile properties by weighted ratio', () => {
    const base = new TactileProperty({ softness: 0.8, slowRisingRate: 0.8, elasticity: 0.2 })
    const modifier = new TactileProperty({ softness: 0.2, slowRisingRate: 0.2, elasticity: 0.8 })

    // 70% base, 30% modifier
    const combined = base.combine(modifier, 0.3)

    // softness: 0.8 * 0.7 + 0.2 * 0.3 = 0.56 + 0.06 = 0.62
    expect(combined.softness).toBeCloseTo(0.62)
    // slowRisingRate: 0.8 * 0.7 + 0.2 * 0.3 = 0.62
    expect(combined.slowRisingRate).toBeCloseTo(0.62)
    // elasticity: 0.2 * 0.7 + 0.8 * 0.3 = 0.14 + 0.24 = 0.38
    expect(combined.elasticity).toBeCloseTo(0.38)
  })
})
