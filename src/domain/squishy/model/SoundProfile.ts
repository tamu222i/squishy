export type SoundType =
  | 'silent'
  | 'air_slow'       // 呼吸のような低反発エア音（シュワ〜〜）
  | 'crunch_beads'   // 発泡ビーズ／クランチ（サクサク、シャリシャリ）
  | 'popping_candy'  // パチパチキャンディ（パチパチパチ）
  | 'slime_gel'      // ジェル・スライムコア（むにゅっ、ぽちゃっ）
  | 'squeak_toy'     // 鳴き笛トイ（キュッ、ピヨッ）

export interface SoundProfileProps {
  soundType: SoundType
  pitch: number        // 0.5 ~ 2.0 (1.0 = standard)
  intensity: number    // 0.0 ~ 1.0 (volume / impact)
  crackleRate: number  // 0.0 ~ 1.0 (grain/crackle density)
}

export class SoundProfile {
  readonly soundType: SoundType
  readonly pitch: number
  readonly intensity: number
  readonly crackleRate: number

  constructor(props: SoundProfileProps) {
    if (props.pitch < 0.5 || props.pitch > 2.0) {
      throw new Error(`pitch must be between 0.5 and 2.0: pitch=${props.pitch}`)
    }
    if (props.intensity < 0.0 || props.intensity > 1.0) {
      throw new Error(`intensity must be between 0.0 and 1.0: intensity=${props.intensity}`)
    }
    if (props.crackleRate < 0.0 || props.crackleRate > 1.0) {
      throw new Error(`crackleRate must be between 0.0 and 1.0: crackleRate=${props.crackleRate}`)
    }

    this.soundType = props.soundType
    this.pitch = props.pitch
    this.intensity = props.intensity
    this.crackleRate = props.crackleRate
  }

  equals(other: SoundProfile): boolean {
    const EPSILON = 1e-6
    return (
      this.soundType === other.soundType &&
      Math.abs(this.pitch - other.pitch) < EPSILON &&
      Math.abs(this.intensity - other.intensity) < EPSILON &&
      Math.abs(this.crackleRate - other.crackleRate) < EPSILON
    )
  }

  static readonly SILENT = new SoundProfile({
    soundType: 'silent',
    pitch: 1.0,
    intensity: 0.0,
    crackleRate: 0.0,
  })

  static readonly AIR_SLOW = new SoundProfile({
    soundType: 'air_slow',
    pitch: 1.0,
    intensity: 0.8,
    crackleRate: 0.1,
  })

  static readonly CRUNCH_BEADS = new SoundProfile({
    soundType: 'crunch_beads',
    pitch: 1.1,
    intensity: 0.85,
    crackleRate: 0.8,
  })

  static readonly POPPING_CANDY = new SoundProfile({
    soundType: 'popping_candy',
    pitch: 1.3,
    intensity: 0.75,
    crackleRate: 0.95,
  })

  static readonly SLIME_GEL = new SoundProfile({
    soundType: 'slime_gel',
    pitch: 0.9,
    intensity: 0.8,
    crackleRate: 0.2,
  })

  static readonly SQUEAK_TOY = new SoundProfile({
    soundType: 'squeak_toy',
    pitch: 1.4,
    intensity: 0.9,
    crackleRate: 0.0,
  })
}
