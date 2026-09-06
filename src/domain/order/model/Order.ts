import { OrderId } from './OrderId'
import type { SoundType } from '../../squishy/model/SoundProfile'

export type OrderStatus = 'pending' | 'completed' | 'failed'

export interface OrderRequirement {
  customerName: string
  dialogue: string
  targetMoldId: string
  preferredSoundType?: SoundType
  minSoftness?: number
  minSlowRisingRate?: number
  requiredDecorationIds?: string[]
  rewardCoins: number
}

export interface OrderProps {
  id?: OrderId
  requirement: OrderRequirement
  status?: OrderStatus
  finalScore?: number
}

export class Order {
  readonly id: OrderId
  readonly requirement: OrderRequirement
  private _status: OrderStatus
  private _finalScore?: number

  constructor(props: OrderProps) {
    this.id = props.id ?? new OrderId()
    this.requirement = props.requirement
    this._status = props.status ?? 'pending'
    this._finalScore = props.finalScore
  }

  get status(): OrderStatus {
    return this._status
  }

  get finalScore(): number | undefined {
    return this._finalScore
  }

  complete(score: number): void {
    if (this._status !== 'pending') {
      throw new Error(`Cannot complete order with status ${this._status}. Must be 'pending'.`)
    }
    this._status = 'completed'
    this._finalScore = Math.max(0, Math.min(100, score))
  }

  fail(): void {
    if (this._status !== 'pending') {
      throw new Error(`Cannot fail order with status ${this._status}. Must be 'pending'.`)
    }
    this._status = 'failed'
  }
}

export const INITIAL_ORDERS: OrderRequirement[] = [
  {
    customerName: 'ASMRマニアのアオイ',
    dialogue: 'サクサク音が鳴る可愛いメロンパンのスクイーズを作って！チョコスプレーもかけてね！',
    targetMoldId: 'melon_pan',
    preferredSoundType: 'crunch_beads',
    minSoftness: 0.6,
    minSlowRisingRate: 0.3,
    requiredDecorationIds: ['topping_sprinkles'],
    rewardCoins: 80,
  },
  {
    customerName: '癒やしを求めるサトシ',
    dialogue: '仕事で疲れてて…息を吐くように「シュワ〜」と空気が抜ける超低反発のネコまんじゅうが欲しいです。',
    targetMoldId: 'cat_bun',
    preferredSoundType: 'air_slow',
    minSoftness: 0.8,
    minSlowRisingRate: 0.85,
    rewardCoins: 100,
  },
  {
    customerName: '小学生のユウタ',
    dialogue: '押したらパチパチキャンディみたいに弾ける音のする柴犬スクイーズが欲しい！',
    targetMoldId: 'shiba_toast',
    preferredSoundType: 'popping_candy',
    minSoftness: 0.5,
    minSlowRisingRate: 0.4,
    rewardCoins: 120,
  },
]
