export class OrderId {
  readonly value: string

  constructor(value?: string) {
    this.value = value ?? `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  }

  equals(other: OrderId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
