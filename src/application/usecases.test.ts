import { describe, it, expect, beforeEach } from 'vitest'
import { CraftSquishyUseCase } from './CraftSquishyUseCase'
import { DeliverOrderUseCase } from './DeliverOrderUseCase'
import { InspectSquishyUseCase } from './InspectSquishyUseCase'
import { Workshop } from '../domain/workshop/model/Workshop'
import { Order } from '../domain/order/model/Order'
import { OrderId } from '../domain/order/model/OrderId'
import { SquishyScorer } from '../domain/squishy/service/SquishyScorer'

describe('Application UseCases (TDD)', () => {
  let workshop: Workshop
  let scorer: SquishyScorer
  let craftUseCase: CraftSquishyUseCase
  let deliverUseCase: DeliverOrderUseCase
  let inspectUseCase: InspectSquishyUseCase

  beforeEach(() => {
    workshop = Workshop.createInitial()
    scorer = new SquishyScorer()
    craftUseCase = new CraftSquishyUseCase()
    deliverUseCase = new DeliverOrderUseCase(scorer)
    inspectUseCase = new InspectSquishyUseCase()
  })

  describe('CraftSquishyUseCase', () => {
    it('crafts a completed squishy from unlocked materials and mold', () => {
      const result = craftUseCase.execute({
        name: '特製メロンパンスクイーズ',
        baseMaterialId: 'memory_foam',
        soundFillingId: 'crunch_beads',
        moldId: 'melon_pan',
        decorationIds: ['topping_sprinkles'],
        workshop,
      })

      expect(result.squishy.name).toBe('特製メロンパンスクイーズ')
      expect(result.squishy.status).toBe('completed')
      expect(result.squishy.mold?.id).toBe('melon_pan')
      expect(result.squishy.decorations).toHaveLength(1)
    })

    it('rejects crafting if mold is locked in workshop', () => {
      expect(() =>
        craftUseCase.execute({
          name: '未解放いちご',
          baseMaterialId: 'memory_foam',
          moldId: 'strawberry', // locked initially
          workshop,
        })
      ).toThrow('Mold is not unlocked')
    })
  })

  describe('DeliverOrderUseCase', () => {
    it('evaluates, completes order, awards coins, and saves to showroom', () => {
      const craftResult = craftUseCase.execute({
        name: 'アオイちゃん用メロンパン',
        baseMaterialId: 'memory_foam',
        soundFillingId: 'crunch_beads',
        moldId: 'melon_pan',
        decorationIds: ['topping_sprinkles'],
        workshop,
      })

      const order = new Order({
        id: new OrderId('order_aoi'),
        requirement: {
          customerName: 'アオイ',
          dialogue: 'サクサクメロンパン作って！',
          targetMoldId: 'melon_pan',
          preferredSoundType: 'crunch_beads',
          rewardCoins: 100,
        },
      })

      const initialCoins = workshop.coins.value
      const result = deliverUseCase.execute({
        order,
        squishy: craftResult.squishy,
        workshop,
      })

      expect(order.status).toBe('completed')
      expect(result.evaluation.totalScore).toBeGreaterThanOrEqual(80)
      expect(workshop.coins.value).toBeGreaterThan(initialCoins)
      expect(workshop.showroom).toHaveLength(1)
    })
  })

  describe('InspectSquishyUseCase', () => {
    it('handles press deformation and recovery calculation', () => {
      const craftResult = craftUseCase.execute({
        name: 'ぷにぷに',
        baseMaterialId: 'memory_foam',
        moldId: 'cat_bun',
        workshop,
      })

      const pressResult = inspectUseCase.press(craftResult.squishy, 0.7)
      expect(pressResult.deformationRate).toBeGreaterThan(0.4)
      expect(pressResult.soundTrigger.volume).toBeGreaterThan(0)

      const remaining = inspectUseCase.recover(craftResult.squishy, 1.0, pressResult.deformationRate)
      expect(remaining).toBeLessThan(pressResult.deformationRate)
    })
  })
})
