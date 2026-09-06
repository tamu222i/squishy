import type { Order } from '../../order/model/Order'
import type { Squishy } from '../model/Squishy'

export interface OrderEvaluationResult {
  tactileScore: number
  soundScore: number
  appearanceScore: number
  totalScore: number
  earnedCoins: number
  feedback: string
}

export class SquishyScorer {
  evaluate(order: Order, squishy: Squishy): OrderEvaluationResult {
    const req = order.requirement

    // 1. Appearance Score (Mold + Decorations)
    let moldScore = squishy.mold?.id === req.targetMoldId ? 100 : 25
    let decoScore = 100
    if (req.requiredDecorationIds && req.requiredDecorationIds.length > 0) {
      const squishyDecoIds = squishy.decorations.map((d) => d.id)
      const matched = req.requiredDecorationIds.filter((id) => squishyDecoIds.includes(id))
      decoScore = Math.round((matched.length / req.requiredDecorationIds.length) * 100)
    }
    const appearanceScore = Math.round(moldScore * 0.7 + decoScore * 0.3)

    // 2. Sound Score (ASMR match)
    let soundScore = 100
    if (req.preferredSoundType) {
      if (squishy.soundProfile.soundType === req.preferredSoundType) {
        soundScore = 100
      } else {
        soundScore = 40
      }
    }

    // 3. Tactile Score (Softness & SlowRising)
    let tactilePenalty = 0
    if (req.minSoftness !== undefined && squishy.tactileProperty.softness < req.minSoftness) {
      tactilePenalty += (req.minSoftness - squishy.tactileProperty.softness) * 100
    }
    if (req.minSlowRisingRate !== undefined && squishy.tactileProperty.slowRisingRate < req.minSlowRisingRate) {
      tactilePenalty += (req.minSlowRisingRate - squishy.tactileProperty.slowRisingRate) * 100
    }
    const tactileScore = Math.max(0, Math.min(100, Math.round(100 - tactilePenalty * 1.5)))

    // 4. Total Score
    const totalScore = Math.round(appearanceScore * 0.35 + soundScore * 0.35 + tactileScore * 0.3)

    // 5. Earned Coins
    const scoreMultiplier = totalScore >= 90 ? 1.2 : totalScore >= 70 ? 1.0 : 0.5
    const earnedCoins = Math.round(req.rewardCoins * scoreMultiplier)

    // 6. Customer Feedback
    let feedback: string
    if (totalScore >= 90) {
      feedback = `「わぁっ！まさに私が求めていた最高のスクイーズです！この感触と音がたまらなく癒やされます…！」`
    } else if (totalScore >= 70) {
      feedback = `「うん、いい感じ！気に入りました。大切にぷにぷにして可愛がりますね！」`
    } else {
      feedback = `「うーん、頼んでいたものとちょっと形や音、触感が違うかも…でも作ってくれてありがとう！」`
    }

    return {
      tactileScore,
      soundScore,
      appearanceScore,
      totalScore,
      earnedCoins,
      feedback,
    }
  }
}
