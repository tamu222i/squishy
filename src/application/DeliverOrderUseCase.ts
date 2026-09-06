import type { Order } from '../domain/order/model/Order'
import type { Squishy } from '../domain/squishy/model/Squishy'
import type { Workshop } from '../domain/workshop/model/Workshop'
import type { SquishyScorer, OrderEvaluationResult } from '../domain/squishy/service/SquishyScorer'

export interface DeliverOrderInput {
  order: Order
  squishy: Squishy
  workshop: Workshop
}

export interface DeliverOrderOutput {
  evaluation: OrderEvaluationResult
}

export class DeliverOrderUseCase {
  private readonly scorer: SquishyScorer

  constructor(scorer: SquishyScorer) {
    this.scorer = scorer
  }

  execute(input: DeliverOrderInput): DeliverOrderOutput {
    const { order, squishy, workshop } = input

    const evaluation = this.scorer.evaluate(order, squishy)

    // Complete order
    order.complete(evaluation.totalScore)

    // Reward workshop
    workshop.addCoins(evaluation.earnedCoins)

    // Keep squishy in workshop showroom
    workshop.addCraftedSquishy(squishy)

    return { evaluation }
  }
}
