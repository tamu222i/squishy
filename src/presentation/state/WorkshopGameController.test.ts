import { describe, it, expect, beforeEach } from 'vitest'
import { WorkshopGameController } from './WorkshopGameController'
import { MOLDS } from '../../domain/squishy/model/CraftMaterials'

describe('WorkshopGameController (Presentation Controller)', () => {
  let controller: WorkshopGameController

  beforeEach(() => {
    controller = new WorkshopGameController()
  })

  it('initializes with default workshop and orders', () => {
    const state = controller.getState()
    expect(state.workshop.coins.value).toBe(100)
    expect(state.orders.length).toBeGreaterThanOrEqual(1)
    expect(state.activeSquishy).toBeNull()
    expect(state.currentScreen).toBe('orders')
  })

  it('allows crafting a new squishy and transitioning to inspect screen', () => {
    controller.startCrafting('melon_pan')
    controller.selectBaseMaterial('memory_foam')
    controller.selectSoundFilling('crunch_beads')
    controller.toggleDecoration('topping_sprinkles')
    controller.finishCrafting('サクサクメロンパン')

    const state = controller.getState()
    expect(state.activeSquishy).not.toBeNull()
    expect(state.activeSquishy?.name).toBe('サクサクメロンパン')
    expect(state.activeSquishy?.soundProfile.soundType).toBe('crunch_beads')
    expect(state.currentScreen).toBe('inspect')
  })

  it('delivers squishy to selected order and awards coins', () => {
    controller.startCrafting('melon_pan')
    controller.selectBaseMaterial('memory_foam')
    controller.selectSoundFilling('crunch_beads')
    controller.toggleDecoration('topping_sprinkles')
    controller.finishCrafting('サクサクメロンパン')

    const initialCoins = controller.getState().workshop.coins.value
    const targetOrderId = controller.getState().orders[0].id.value

    controller.deliverActiveSquishy(targetOrderId)

    const state = controller.getState()
    expect(state.lastDeliveryResult).not.toBeNull()
    expect(state.workshop.coins.value).toBeGreaterThan(initialCoins)
    expect(state.workshop.showroom.length).toBe(1)
  })

  it('unlocks molds from shop', () => {
    const shibaMold = MOLDS.find((m) => m.id === 'shiba_toast')!
    controller.unlockMold(shibaMold)

    expect(controller.getState().workshop.isMoldUnlocked('shiba_toast')).toBe(true)
    expect(controller.getState().workshop.coins.value).toBe(50)
  })
})
