import { describe, it, expect } from 'vitest'
import { SquishyScorer } from './SquishyScorer'
import { Order } from '../../order/model/Order'
import type { OrderRequirement } from '../../order/model/Order'
import { Squishy } from '../model/Squishy'
import { BASE_MATERIALS, SOUND_FILLINGS, MOLDS } from '../model/CraftMaterials'

describe('SquishyScorer (Domain Service)', () => {
  const scorer = new SquishyScorer()

  const req: OrderRequirement = {
    customerName: '低反発好きのケンジ',
    dialogue: '超低反発でシュワ〜っと音が抜けるメロンパンが欲しい！',
    targetMoldId: 'melon_pan',
    preferredSoundType: 'air_slow',
    minSoftness: 0.8,
    minSlowRisingRate: 0.85,
    rewardCoins: 100,
  }
  const order = new Order({ requirement: req })

  it('awards high score when mold, sound, and tactile requirements match', () => {
    // memory_foam (softness 0.9, slowRising 0.95), air_slow_valve, melon_pan
    const squishy = Squishy.mix('完璧なメロンパン', BASE_MATERIALS[0], SOUND_FILLINGS[0])
    squishy.pourIntoMold(MOLDS[0])
    squishy.finishCrafting()

    const result = scorer.evaluate(order, squishy)

    expect(result.totalScore).toBeGreaterThanOrEqual(90)
    expect(result.soundScore).toBe(100)
    expect(result.appearanceScore).toBe(100)
    expect(result.earnedCoins).toBeGreaterThanOrEqual(100)
    expect(result.feedback).toContain('最高')
  })

  it('penalizes when sound type or mold does not match', () => {
    // crunch_beads instead of air_slow, and cat_bun instead of melon_pan
    const squishy = Squishy.mix('違うスクイーズ', BASE_MATERIALS[1], SOUND_FILLINGS[1])
    squishy.pourIntoMold(MOLDS[1])
    squishy.finishCrafting()

    const result = scorer.evaluate(order, squishy)

    expect(result.totalScore).toBeLessThan(70)
    expect(result.soundScore).toBeLessThan(60)
    expect(result.appearanceScore).toBeLessThan(50)
  })
})
