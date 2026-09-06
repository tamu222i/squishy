import { describe, it, expect } from 'vitest'
import { Order } from './Order'
import type { OrderRequirement } from './Order'
import { OrderId } from './OrderId'

describe('Order (Aggregate Root)', () => {
  const req: OrderRequirement = {
    customerName: 'ASMRマニアのアオイ',
    dialogue: 'サクサク音が鳴る可愛いメロンパンのスクイーズを作って！',
    targetMoldId: 'melon_pan',
    preferredSoundType: 'crunch_beads',
    minSoftness: 0.6,
    minSlowRisingRate: 0.5,
    requiredDecorationIds: ['topping_sprinkles'],
    rewardCoins: 50,
  }

  it('creates an order with pending status', () => {
    const order = new Order({ id: new OrderId('order_1'), requirement: req })
    expect(order.id.value).toBe('order_1')
    expect(order.status).toBe('pending')
    expect(order.requirement.preferredSoundType).toBe('crunch_beads')
  })

  it('completes order with final score', () => {
    const order = new Order({ id: new OrderId('order_1'), requirement: req })
    order.complete(95)
    expect(order.status).toBe('completed')
    expect(order.finalScore).toBe(95)
  })

  it('cannot complete already completed order', () => {
    const order = new Order({ id: new OrderId('order_1'), requirement: req })
    order.complete(80)
    expect(() => order.complete(90)).toThrow()
  })
})
