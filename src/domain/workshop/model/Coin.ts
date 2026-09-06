export class Coin {
  readonly value: number

  constructor(value: number) {
    if (value < 0) {
      throw new Error(`Coin value cannot be negative: ${value}`)
    }
    this.value = Math.floor(value)
  }

  add(amount: number): Coin {
    if (amount < 0) {
      throw new Error(`Cannot add negative coins: ${amount}`)
    }
    return new Coin(this.value + amount)
  }

  subtract(amount: number): Coin {
    if (amount < 0) {
      throw new Error(`Cannot subtract negative coins: ${amount}`)
    }
    if (this.value < amount) {
      throw new Error(`Insufficient coins: have ${this.value}, need ${amount}`)
    }
    return new Coin(this.value - amount)
  }
}
