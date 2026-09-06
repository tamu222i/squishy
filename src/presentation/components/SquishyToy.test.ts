import { describe, it, expect } from 'vitest'
import { Squishy } from '../../domain/squishy/model/Squishy'
import { BASE_MATERIALS, SOUND_FILLINGS, MOLDS } from '../../domain/squishy/model/CraftMaterials'
import { calculateSquishDeformationProgress } from './squishyPhysics'

describe('Squishy Deformation Physics Helper', () => {
  const squishy = Squishy.mix('テスト', BASE_MATERIALS[0], SOUND_FILLINGS[0])
  squishy.pourIntoMold(MOLDS[0])
  squishy.finishCrafting()

  it('calculates press deformation accurately', () => {
    const deformation = calculateSquishDeformationProgress(0, 0.8, 0.1, squishy.tactileProperty.softness)
    expect(deformation).toBeGreaterThan(0)
    expect(deformation).toBeLessThanOrEqual(1.0)
  })

  it('calculates slow-rising recovery step', () => {
    // Current deformation 0.8 -> recovers with elapsed time delta 0.05s
    const slowSquishy = Squishy.mix('超低反発', BASE_MATERIALS[0]) // memory_foam (slowRisingRate 0.95)
    const fastSquishy = Squishy.mix('高反発', BASE_MATERIALS[1]) // silicone_gel (slowRisingRate 0.3)

    const slowRecovered = calculateSquishDeformationProgress(0.8, 0, 0.1, slowSquishy.tactileProperty.softness, slowSquishy.tactileProperty.slowRisingRate)
    const fastRecovered = calculateSquishDeformationProgress(0.8, 0, 0.1, fastSquishy.tactileProperty.softness, fastSquishy.tactileProperty.slowRisingRate)

    // Fast squishy recovers faster (has less remaining deformation)
    expect(fastRecovered).toBeLessThan(slowRecovered)
  })
})
