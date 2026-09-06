import { Coin } from './Coin'
import type { Mold } from '../../squishy/model/CraftMaterials'
import type { Squishy } from '../../squishy/model/Squishy'

export interface WorkshopProps {
  coins: Coin
  unlockedMoldIds: Set<string>
  unlockedMaterialIds: Set<string>
  unlockedFillingIds: Set<string>
  showroom: Squishy[]
}

export class Workshop {
  private _coins: Coin
  private _unlockedMoldIds: Set<string>
  private _unlockedMaterialIds: Set<string>
  private _unlockedFillingIds: Set<string>
  private _showroom: Squishy[]

  constructor(props: WorkshopProps) {
    this._coins = props.coins
    this._unlockedMoldIds = new Set(props.unlockedMoldIds)
    this._unlockedMaterialIds = new Set(props.unlockedMaterialIds)
    this._unlockedFillingIds = new Set(props.unlockedFillingIds)
    this._showroom = [...props.showroom]
  }

  get coins(): Coin {
    return this._coins
  }

  get showroom(): ReadonlyArray<Squishy> {
    return this._showroom
  }

  get unlockedMoldIds(): ReadonlySet<string> {
    return this._unlockedMoldIds
  }

  get unlockedMaterialIds(): ReadonlySet<string> {
    return this._unlockedMaterialIds
  }

  get unlockedFillingIds(): ReadonlySet<string> {
    return this._unlockedFillingIds
  }

  static createInitial(): Workshop {
    return new Workshop({
      coins: new Coin(100),
      unlockedMoldIds: new Set(['melon_pan', 'cat_bun']),
      unlockedMaterialIds: new Set(['memory_foam', 'silicone_gel', 'clay_sponge']),
      unlockedFillingIds: new Set(['air_slow_valve', 'crunch_beads', 'popping_candy', 'slime_core']),
      showroom: [],
    })
  }

  isMoldUnlocked(moldId: string): boolean {
    return this._unlockedMoldIds.has(moldId)
  }

  isMaterialUnlocked(materialId: string): boolean {
    return this._unlockedMaterialIds.has(materialId)
  }

  isFillingUnlocked(fillingId: string): boolean {
    return this._unlockedFillingIds.has(fillingId)
  }

  addCoins(amount: number): void {
    this._coins = this._coins.add(amount)
  }

  spendCoins(amount: number): void {
    this._coins = this._coins.subtract(amount)
  }

  unlockMold(mold: Mold): void {
    if (this.isMoldUnlocked(mold.id)) {
      return
    }
    this.spendCoins(mold.unlockCost)
    this._unlockedMoldIds.add(mold.id)
  }

  addCraftedSquishy(squishy: Squishy): void {
    this._showroom.push(squishy)
  }
}
