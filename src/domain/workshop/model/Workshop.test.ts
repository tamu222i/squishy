import { describe, it, expect } from 'vitest'
import { Workshop } from './Workshop'
import { MOLDS, BASE_MATERIALS, SOUND_FILLINGS } from '../../squishy/model/CraftMaterials'
import { Squishy } from '../../squishy/model/Squishy'

describe('Workshop (Aggregate Root)', () => {
  it('initializes with default starting coins and unlocked free molds', () => {
    const workshop = Workshop.createInitial()

    expect(workshop.coins.value).toBe(100)
    expect(workshop.isMoldUnlocked('melon_pan')).toBe(true)
    expect(workshop.isMoldUnlocked('cat_bun')).toBe(true)
    // shiba_toast costs 50 so initially locked
    expect(workshop.isMoldUnlocked('shiba_toast')).toBe(false)
  })

  it('can earn coins from completed orders', () => {
    const workshop = Workshop.createInitial()
    workshop.addCoins(75)
    expect(workshop.coins.value).toBe(175)
  })

  it('can unlock a new mold by spending coins', () => {
    const workshop = Workshop.createInitial() // 100 coins
    const shibaMold = MOLDS.find((m) => m.id === 'shiba_toast')! // cost 50

    workshop.unlockMold(shibaMold)

    expect(workshop.isMoldUnlocked('shiba_toast')).toBe(true)
    expect(workshop.coins.value).toBe(50)
  })

  it('fails to unlock mold if insufficient coins', () => {
    const workshop = Workshop.createInitial() // 100 coins
    const expensiveMold = MOLDS.find((m) => m.id === 'strawberry')! // cost 100
    workshop.spendCoins(50) // now 50 coins

    expect(() => workshop.unlockMold(expensiveMold)).toThrow('Insufficient coins')
  })

  it('records crafted squishies in workshop showroom', () => {
    const workshop = Workshop.createInitial()
    const squishy = Squishy.mix('私の初スクイーズ', BASE_MATERIALS[0], SOUND_FILLINGS[0])
    squishy.pourIntoMold(MOLDS[0])
    squishy.finishCrafting()

    workshop.addCraftedSquishy(squishy)

    expect(workshop.showroom).toHaveLength(1)
    expect(workshop.showroom[0].name).toBe('私の初スクイーズ')
  })
})
