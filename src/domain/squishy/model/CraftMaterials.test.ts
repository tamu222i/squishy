import { describe, it, expect } from 'vitest'
import {
  BaseMaterial,
  BASE_MATERIALS,
  SoundFilling,
  SOUND_FILLINGS,
  Mold,
  MOLDS,
  Decoration,
  DECORATIONS,
} from './CraftMaterials'
import { TactileProperty } from './TactileProperty'
import { SoundProfile } from './SoundProfile'

describe('CraftMaterials (Domain Entities & Value Objects)', () => {
  describe('BaseMaterial', () => {
    it('creates a base material with tactile properties', () => {
      const mat = new BaseMaterial({
        id: 'test_foam',
        name: 'テストウレタン',
        tactileProperty: TactileProperty.ULTRA_SLOW_RISING,
        defaultColor: '#fde047',
        cost: 10,
      })

      expect(mat.id).toBe('test_foam')
      expect(mat.tactileProperty.slowRisingRate).toBeGreaterThan(0.9)
      expect(mat.cost).toBe(10)
    })

    it('provides standard presets including ultra slow memory foam', () => {
      expect(BASE_MATERIALS.length).toBeGreaterThanOrEqual(3)
      const memoryFoam = BASE_MATERIALS.find((m) => m.id === 'memory_foam')
      expect(memoryFoam).toBeDefined()
      expect(memoryFoam?.tactileProperty.slowRisingRate).toBeGreaterThan(0.8)
    })
  })

  describe('SoundFilling (Unique ASMR materials)', () => {
    it('creates a sound filling with sound profile and tactile modifier', () => {
      const filling = new SoundFilling({
        id: 'crunch_beads',
        name: 'クランチビーズ',
        soundProfile: SoundProfile.CRUNCH_BEADS,
        tactileModifier: new TactileProperty({ softness: 0.6, slowRisingRate: 0.3, elasticity: 0.7 }),
        cost: 25,
      })

      expect(filling.soundProfile.soundType).toBe('crunch_beads')
      expect(filling.cost).toBe(25)
    })

    it('provides diverse sound presets: air_slow, crunch, popping candy, slime, squeak', () => {
      const soundTypes = SOUND_FILLINGS.map((f) => f.soundProfile.soundType)
      expect(soundTypes).toContain('air_slow')
      expect(soundTypes).toContain('crunch_beads')
      expect(soundTypes).toContain('popping_candy')
      expect(soundTypes).toContain('slime_gel')
      expect(soundTypes).toContain('squeak_toy')
    })
  })

  describe('Mold', () => {
    it('creates a mold with shape category and unlock cost', () => {
      const mold = new Mold({
        id: 'melon_pan',
        name: 'メロンパン型',
        category: 'bakery',
        description: '格子模様が可愛い定番のメロンパン型',
        unlockCost: 0,
      })

      expect(mold.id).toBe('melon_pan')
      expect(mold.category).toBe('bakery')
    })

    it('provides standard mold presets', () => {
      expect(MOLDS.length).toBeGreaterThanOrEqual(4)
      const ids = MOLDS.map((m) => m.id)
      expect(ids).toContain('melon_pan')
      expect(ids).toContain('cat_bun')
    })
  })

  describe('Decoration', () => {
    it('creates toppings, colors, and sauces', () => {
      const topping = new Decoration({
        id: 'chocolate_spray',
        name: 'カラフルチョコスプレー',
        type: 'topping',
        icon: '🍬',
        cost: 15,
      })

      expect(topping.type).toBe('topping')
      expect(topping.icon).toBe('🍬')
    })

    it('provides decoration presets', () => {
      expect(DECORATIONS.length).toBeGreaterThanOrEqual(5)
    })
  })
})
