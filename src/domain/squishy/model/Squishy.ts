import { SquishyId } from './SquishyId'
import { BaseMaterial, SoundFilling, Mold, Decoration } from './CraftMaterials'
import { TactileProperty } from './TactileProperty'
import { SoundProfile } from './SoundProfile'
import type { SoundType } from './SoundProfile'

export type SquishyStatus = 'mixed' | 'molded' | 'completed'

export interface SoundTriggerInfo {
  soundType: SoundType
  volume: number
  pitch: number
  crackleCount: number
}

export interface SquishDeformationResult {
  deformationRate: number // 0.0 ~ 1.0 (how deeply squished)
  resistanceForce: number // 0.0 ~ 1.0 (spring pushback)
  soundTrigger: SoundTriggerInfo
}

export class Squishy {
  readonly id: SquishyId
  name: string
  private _status: SquishyStatus
  readonly baseMaterial: BaseMaterial
  readonly soundFilling: SoundFilling | null
  private _mold: Mold | null = null
  private _decorations: Decoration[] = []
  readonly tactileProperty: TactileProperty
  readonly soundProfile: SoundProfile

  private constructor(params: {
    id?: SquishyId
    name: string
    status: SquishyStatus
    baseMaterial: BaseMaterial
    soundFilling: SoundFilling | null
    mold?: Mold | null
    decorations?: Decoration[]
    tactileProperty: TactileProperty
    soundProfile: SoundProfile
  }) {
    this.id = params.id ?? new SquishyId()
    this.name = params.name
    this._status = params.status
    this.baseMaterial = params.baseMaterial
    this.soundFilling = params.soundFilling
    this._mold = params.mold ?? null
    this._decorations = params.decorations ? [...params.decorations] : []
    this.tactileProperty = params.tactileProperty
    this.soundProfile = params.soundProfile
  }

  get status(): SquishyStatus {
    return this._status
  }

  get mold(): Mold | null {
    return this._mold
  }

  get decorations(): ReadonlyArray<Decoration> {
    return this._decorations
  }

  static mix(name: string, baseMaterial: BaseMaterial, soundFilling?: SoundFilling): Squishy {
    let combinedTactile = baseMaterial.tactileProperty
    let soundProfile = SoundProfile.AIR_SLOW

    if (soundFilling) {
      // 70% base, 30% sound filling modifier
      combinedTactile = baseMaterial.tactileProperty.combine(soundFilling.tactileModifier, 0.3)
      soundProfile = soundFilling.soundProfile
    }

    return new Squishy({
      name,
      status: 'mixed',
      baseMaterial,
      soundFilling: soundFilling ?? null,
      tactileProperty: combinedTactile,
      soundProfile,
    })
  }

  pourIntoMold(mold: Mold): void {
    if (this._status !== 'mixed') {
      throw new Error(`Cannot pour into mold when status is ${this._status}. Must be 'mixed'.`)
    }
    this._mold = mold
    this._status = 'molded'
  }

  addDecoration(decoration: Decoration): void {
    if (this._status !== 'molded') {
      throw new Error(`Cannot add decoration when status is ${this._status}. Must be 'molded'.`)
    }
    this._decorations.push(decoration)
  }

  finishCrafting(): void {
    if (this._status !== 'molded') {
      throw new Error(`Cannot finish crafting when status is ${this._status}. Must be 'molded'.`)
    }
    this._status = 'completed'
  }

  press(force: number): SquishDeformationResult {
    const clampedForce = Math.max(0, Math.min(1, force))
    // Softness increases max deformation depth
    const deformationRate = Math.min(1.0, clampedForce * (0.5 + this.tactileProperty.softness * 0.5))
    // Elasticity increases pushback feel
    const resistanceForce = clampedForce * this.tactileProperty.elasticity

    const volume = Math.min(1.0, clampedForce * this.soundProfile.intensity)
    const pitch = this.soundProfile.pitch * (0.95 + clampedForce * 0.1)
    const crackleCount = Math.round(clampedForce * this.soundProfile.crackleRate * 10)

    return {
      deformationRate,
      resistanceForce,
      soundTrigger: {
        soundType: this.soundProfile.soundType,
        volume,
        pitch,
        crackleCount,
      },
    }
  }

  calculateRemainingDeformation(elapsedSeconds: number, initialDeformation: number): number {
    // slowRisingRate = 1.0 means extremely slow (e.g. 5+ seconds to recover)
    // slowRisingRate = 0.0 means instant recovery (~0.2 seconds)
    const baseSpeed = 1.2
    const recoverySpeed = Math.max(0.1, (1.05 - this.tactileProperty.slowRisingRate) * baseSpeed)
    const recovered = elapsedSeconds * recoverySpeed
    return Math.max(0, initialDeformation - recovered)
  }
}
