export class SquishyId {
  readonly value: string

  constructor(value?: string) {
    this.value = value ?? `squishy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  equals(other: SquishyId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
