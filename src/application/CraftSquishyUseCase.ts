import { Squishy } from '../domain/squishy/model/Squishy'
import {
  BASE_MATERIALS,
  SOUND_FILLINGS,
  MOLDS,
  DECORATIONS,
} from '../domain/squishy/model/CraftMaterials'
import type { Workshop } from '../domain/workshop/model/Workshop'

export interface CraftSquishyInput {
  name: string
  baseMaterialId: string
  soundFillingId?: string
  moldId: string
  decorationIds?: string[]
  workshop: Workshop
}

export interface CraftSquishyOutput {
  squishy: Squishy
}

export class CraftSquishyUseCase {
  execute(input: CraftSquishyInput): CraftSquishyOutput {
    const { name, baseMaterialId, soundFillingId, moldId, decorationIds = [], workshop } = input

    // Check unlocked status
    if (!workshop.isMaterialUnlocked(baseMaterialId)) {
      throw new Error(`Base material is not unlocked: ${baseMaterialId}`)
    }
    if (soundFillingId && !workshop.isFillingUnlocked(soundFillingId)) {
      throw new Error(`Sound filling is not unlocked: ${soundFillingId}`)
    }
    if (!workshop.isMoldUnlocked(moldId)) {
      throw new Error(`Mold is not unlocked: ${moldId}`)
    }

    const baseMaterial = BASE_MATERIALS.find((m) => m.id === baseMaterialId)
    if (!baseMaterial) {
      throw new Error(`Base material not found: ${baseMaterialId}`)
    }

    const soundFilling = soundFillingId
      ? SOUND_FILLINGS.find((f) => f.id === soundFillingId)
      : undefined

    const mold = MOLDS.find((m) => m.id === moldId)
    if (!mold) {
      throw new Error(`Mold not found: ${moldId}`)
    }

    // Lifecycle: mix -> pourIntoMold -> addDecoration -> finish
    const squishy = Squishy.mix(name, baseMaterial, soundFilling)
    squishy.pourIntoMold(mold)

    for (const decoId of decorationIds) {
      const deco = DECORATIONS.find((d) => d.id === decoId)
      if (deco) {
        squishy.addDecoration(deco)
      }
    }

    squishy.finishCrafting()

    return { squishy }
  }
}
