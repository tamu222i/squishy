import { describe, it, expect } from 'vitest'
import { Squishy } from './Squishy'
import { BASE_MATERIALS, SOUND_FILLINGS, MOLDS, DECORATIONS } from './CraftMaterials'

describe('Squishy (Aggregate Root)', () => {
  const baseMat = BASE_MATERIALS[0] // memory_foam
  const soundFill = SOUND_FILLINGS[1] // crunch_beads
  const mold = MOLDS[0] // melon_pan

  it('creates mixed squishy with combined tactile property and sound profile', () => {
    const squishy = Squishy.mix('サクサクメロンパンの素', baseMat, soundFill)

    expect(squishy.name).toBe('サクサクメロンパンの素')
    expect(squishy.status).toBe('mixed')
    expect(squishy.baseMaterial.id).toBe(baseMat.id)
    expect(squishy.soundFilling?.id).toBe(soundFill.id)
    expect(squishy.soundProfile.soundType).toBe('crunch_beads')
    // 触感は baseMat と soundFill の modifier が合成されている
    expect(squishy.tactileProperty.slowRisingRate).toBeLessThan(baseMat.tactileProperty.slowRisingRate)
  })

  it('can be mixed without sound filling (pure squishy)', () => {
    const squishy = Squishy.mix('プレーンスクイーズ', baseMat)

    expect(squishy.soundFilling).toBeNull()
    // サウンド素材なしの場合はエア音（air_slow）
    expect(squishy.soundProfile.soundType).toBe('air_slow')
  })

  it('progresses through crafting lifecycle: mix -> mold -> decorate -> finish', () => {
    const squishy = Squishy.mix('極上メロンパン', baseMat, soundFill)

    // 型に流し込む
    squishy.pourIntoMold(mold)
    expect(squishy.status).toBe('molded')
    expect(squishy.mold?.id).toBe(mold.id)

    // デコレーションを追加
    squishy.addDecoration(DECORATIONS[0]) // color_pink
    squishy.addDecoration(DECORATIONS[3]) // topping_sprinkles
    expect(squishy.decorations).toHaveLength(2)

    // 完成
    squishy.finishCrafting()
    expect(squishy.status).toBe('completed')
  })

  it('enforces lifecycle validation', () => {
    const squishy = Squishy.mix('テスト', baseMat)

    // molded 前にデコレーションしようとするとエラー
    expect(() => squishy.addDecoration(DECORATIONS[0])).toThrow()

    squishy.pourIntoMold(mold)
    // 重複して型に流し込もうとするとエラー
    expect(() => squishy.pourIntoMold(mold)).toThrow()

    squishy.finishCrafting()
    // 完成後に型変更やデコレーションしようとするとエラー
    expect(() => squishy.addDecoration(DECORATIONS[1])).toThrow()
  })

  describe('Tactile & ASMR interaction logic', () => {
    it('calculates deformation and sound trigger parameters when pressed', () => {
      const squishy = Squishy.mix('クランチトイ', baseMat, soundFill)
      squishy.pourIntoMold(mold)
      squishy.finishCrafting()

      // 押す力 0.8
      const interaction = squishy.press(0.8)

      expect(interaction.deformationRate).toBeGreaterThan(0.5)
      expect(interaction.soundTrigger.soundType).toBe('crunch_beads')
      expect(interaction.soundTrigger.volume).toBeGreaterThan(0)
    })

    it('calculates slow-rising recovery over time based on slowRisingRate', () => {
      const squishy = Squishy.mix('低反発トイ', baseMat) // memory_foam (slowRisingRate ~0.95)
      squishy.pourIntoMold(mold)
      squishy.finishCrafting()

      // 最大変形 1.0 から 0.5秒経過時の残り変形量
      const remaining1 = squishy.calculateRemainingDeformation(0.5, 1.0)
      const remaining2 = squishy.calculateRemainingDeformation(2.0, 1.0)

      // 時間が経つほど復元する（変形量が減る）
      expect(remaining1).toBeGreaterThan(remaining2)
      expect(remaining2).toBeGreaterThanOrEqual(0)
    })
  })
})
