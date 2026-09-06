export interface TactilePropertyProps {
  softness: number // 0.0 (hard) to 1.0 (super soft)
  slowRisingRate: number // 0.0 (fast recovery) to 1.0 (ultra slow recovery)
  elasticity: number // 0.0 (doughy/clay-like) to 1.0 (bouncy/springy)
}

export class TactileProperty {
  readonly softness: number
  readonly slowRisingRate: number
  readonly elasticity: number

  constructor(props: TactilePropertyProps) {
    if (
      props.softness < 0.0 || props.softness > 1.0 ||
      props.slowRisingRate < 0.0 || props.slowRisingRate > 1.0 ||
      props.elasticity < 0.0 || props.elasticity > 1.0
    ) {
      throw new Error(
        `TactileProperty values must be between 0.0 and 1.0: softness=${props.softness}, slowRisingRate=${props.slowRisingRate}, elasticity=${props.elasticity}`
      )
    }

    this.softness = props.softness
    this.slowRisingRate = props.slowRisingRate
    this.elasticity = props.elasticity
  }

  equals(other: TactileProperty): boolean {
    const EPSILON = 1e-6
    return (
      Math.abs(this.softness - other.softness) < EPSILON &&
      Math.abs(this.slowRisingRate - other.slowRisingRate) < EPSILON &&
      Math.abs(this.elasticity - other.elasticity) < EPSILON
    )
  }

  combine(other: TactileProperty, otherRatio: number): TactileProperty {
    const clampedRatio = Math.max(0, Math.min(1, otherRatio))
    const thisRatio = 1 - clampedRatio

    return new TactileProperty({
      softness: this.softness * thisRatio + other.softness * clampedRatio,
      slowRisingRate: this.slowRisingRate * thisRatio + other.slowRisingRate * clampedRatio,
      elasticity: this.elasticity * thisRatio + other.elasticity * clampedRatio,
    })
  }

  static readonly DEFAULT = new TactileProperty({
    softness: 0.5,
    slowRisingRate: 0.5,
    elasticity: 0.5,
  })

  static readonly ULTRA_SLOW_RISING = new TactileProperty({
    softness: 0.9,
    slowRisingRate: 0.95,
    elasticity: 0.2,
  })

  static readonly JELLY_BOUNCY = new TactileProperty({
    softness: 0.7,
    slowRisingRate: 0.2,
    elasticity: 0.9,
  })
}
