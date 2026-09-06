import { TactileProperty } from './TactileProperty'
import { SoundProfile } from './SoundProfile'

// --- BaseMaterial ---
export interface BaseMaterialProps {
  id: string
  name: string
  tactileProperty: TactileProperty
  defaultColor: string
  cost: number
}

export class BaseMaterial {
  readonly id: string
  readonly name: string
  readonly tactileProperty: TactileProperty
  readonly defaultColor: string
  readonly cost: number

  constructor(props: BaseMaterialProps) {
    this.id = props.id
    this.name = props.name
    this.tactileProperty = props.tactileProperty
    this.defaultColor = props.defaultColor
    this.cost = props.cost
  }
}

export const BASE_MATERIALS: BaseMaterial[] = [
  new BaseMaterial({
    id: 'memory_foam',
    name: 'プレミアム低反発ウレタン',
    tactileProperty: new TactileProperty({ softness: 0.9, slowRisingRate: 0.95, elasticity: 0.15 }),
    defaultColor: '#fef08a', // クリームイエロー
    cost: 30,
  }),
  new BaseMaterial({
    id: 'silicone_gel',
    name: 'ぷるぷるシリコンゲル',
    tactileProperty: new TactileProperty({ softness: 0.75, slowRisingRate: 0.3, elasticity: 0.85 }),
    defaultColor: '#a5f3fc', // クリアシアン
    cost: 20,
  }),
  new BaseMaterial({
    id: 'clay_sponge',
    name: 'もっちりクレイフォーム',
    tactileProperty: new TactileProperty({ softness: 0.6, slowRisingRate: 0.65, elasticity: 0.4 }),
    defaultColor: '#fed7aa', // ピーチベージュ
    cost: 10,
  }),
]

// --- SoundFilling (個性的な音が出る素材) ---
export interface SoundFillingProps {
  id: string
  name: string
  soundProfile: SoundProfile
  tactileModifier: TactileProperty
  cost: number
}

export class SoundFilling {
  readonly id: string
  readonly name: string
  readonly soundProfile: SoundProfile
  readonly tactileModifier: TactileProperty
  readonly cost: number

  constructor(props: SoundFillingProps) {
    this.id = props.id
    this.name = props.name
    this.soundProfile = props.soundProfile
    this.tactileModifier = props.tactileModifier
    this.cost = props.cost
  }
}

export const SOUND_FILLINGS: SoundFilling[] = [
  new SoundFilling({
    id: 'air_slow_valve',
    name: 'スローエア通気コア',
    soundProfile: SoundProfile.AIR_SLOW,
    tactileModifier: new TactileProperty({ softness: 0.85, slowRisingRate: 0.95, elasticity: 0.1 }),
    cost: 25,
  }),
  new SoundFilling({
    id: 'crunch_beads',
    name: 'クランチ発泡ビーズ',
    soundProfile: SoundProfile.CRUNCH_BEADS,
    tactileModifier: new TactileProperty({ softness: 0.65, slowRisingRate: 0.3, elasticity: 0.6 }),
    cost: 30,
  }),
  new SoundFilling({
    id: 'popping_candy',
    name: 'パチパチキャンディ粉',
    soundProfile: SoundProfile.POPPING_CANDY,
    tactileModifier: new TactileProperty({ softness: 0.7, slowRisingRate: 0.5, elasticity: 0.5 }),
    cost: 35,
  }),
  new SoundFilling({
    id: 'slime_core',
    name: 'スライムジェルコア',
    soundProfile: SoundProfile.SLIME_GEL,
    tactileModifier: new TactileProperty({ softness: 0.9, slowRisingRate: 0.4, elasticity: 0.75 }),
    cost: 20,
  }),
  new SoundFilling({
    id: 'squeaker_whistle',
    name: 'ピヨピヨ笛ギミック',
    soundProfile: SoundProfile.SQUEAK_TOY,
    tactileModifier: new TactileProperty({ softness: 0.5, slowRisingRate: 0.1, elasticity: 0.9 }),
    cost: 40,
  }),
]

// --- Mold ---
export type MoldCategory = 'bakery' | 'animal' | 'dessert' | 'fruit'

export interface MoldProps {
  id: string
  name: string
  category: MoldCategory
  description: string
  unlockCost: number
}

export class Mold {
  readonly id: string
  readonly name: string
  readonly category: MoldCategory
  readonly description: string
  readonly unlockCost: number

  constructor(props: MoldProps) {
    this.id = props.id
    this.name = props.name
    this.category = props.category
    this.description = props.description
    this.unlockCost = props.unlockCost
  }
}

export const MOLDS: Mold[] = [
  new Mold({
    id: 'melon_pan',
    name: 'メロンパン型',
    category: 'bakery',
    description: '格子模様がふっくら浮き出る王道のメロンパン型',
    unlockCost: 0,
  }),
  new Mold({
    id: 'cat_bun',
    name: 'まんまるネコまんじゅう型',
    category: 'animal',
    description: 'ぴょこんと生えた耳が愛らしいネコ型',
    unlockCost: 0,
  }),
  new Mold({
    id: 'shiba_toast',
    name: '柴犬食パン型',
    category: 'bakery',
    description: '柴犬の顔が焼き型になったトーストスクイーズ型',
    unlockCost: 50,
  }),
  new Mold({
    id: 'bear_cake',
    name: 'くまさんパンケーキ型',
    category: 'dessert',
    description: 'ふんわり厚みのあるくま型パンケーキ',
    unlockCost: 80,
  }),
  new Mold({
    id: 'strawberry',
    name: 'ジューシーいちご型',
    category: 'fruit',
    description: '粒々のつぶつぶ感がリアルないちご型',
    unlockCost: 100,
  }),
]

// --- Decoration ---
export type DecorationType = 'color' | 'topping' | 'sauce'

export interface DecorationProps {
  id: string
  name: string
  type: DecorationType
  icon: string
  colorCode?: string
  cost: number
}

export class Decoration {
  readonly id: string
  readonly name: string
  readonly type: DecorationType
  readonly icon: string
  readonly colorCode?: string
  readonly cost: number

  constructor(props: DecorationProps) {
    this.id = props.id
    this.name = props.name
    this.type = props.type
    this.icon = props.icon
    this.colorCode = props.colorCode
    this.cost = props.cost
  }
}

export const DECORATIONS: Decoration[] = [
  new Decoration({ id: 'color_pink', name: 'パステルピンク着色', type: 'color', icon: '🎨', colorCode: '#f472b6', cost: 10 }),
  new Decoration({ id: 'color_matcha', name: '抹茶グリーン着色', type: 'color', icon: '🍵', colorCode: '#86efac', cost: 10 }),
  new Decoration({ id: 'color_chocolate', name: 'チョコブラウン着色', type: 'color', icon: '🍫', colorCode: '#92400e', cost: 10 }),
  new Decoration({ id: 'topping_sprinkles', name: 'カラフルチョコスプレー', type: 'topping', icon: '🍬', cost: 15 }),
  new Decoration({ id: 'topping_glitter', name: 'キラキラスクイーズラメ', type: 'topping', icon: '✨', cost: 20 }),
  new Decoration({ id: 'sauce_strawberry', name: 'とろ〜り苺ソース', type: 'sauce', icon: '🍓', colorCode: '#e11d48', cost: 15 }),
  new Decoration({ id: 'sauce_caramel', name: '濃厚キャラメルソース', type: 'sauce', icon: '🍯', colorCode: '#d97706', cost: 15 }),
]
