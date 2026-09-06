# プロジェクト計画書 (PLAN.md)

## 1. 開発方針・基本ルール
- **設計・実装手法**: DDD（ドメイン駆動設計）および TDD（テスト駆動開発）をベースとする。
- **コミットサイクル**: `Red` -> `Green` -> `Refactor` のサイクルごとに1コミットとする。
- **計画・履歴管理**:
  - 実装計画およびタスクはすべて本ドキュメント (`PLAN.md`) に記録・更新する。
  - 変更履歴（Changelog）も常に本ドキュメントに追記していく。

---

## 2. プロジェクト概要
- **プロジェクト名**: squishy (スクイーズ工房ショップ × ASMR)
- **ステータス**: 設計・開発フェーズ開始
- **ゲームコンセプト**:
  - プレイヤーはスクイーズ職人となり、お客さんからのオーダー（希望の触感・音・見た目）に合わせてスクイーズをクラフトする工房ショップシミュレーション。
  - **ASMR・サウンド素材システム**:
    - 通常の柔らかさ・復元速度に加え、「個性的な音が出る素材（特殊フィリング・添加物）」を選択可能。
    - 例:
      - 「スローエアフォーム」（シュワ〜と空気が抜ける極上低反発ASMR）
      - 「クランチビーズ」（押すとサクサク・シャリシャリ鳴る）
      - 「パチパチパウダー」（押すとパチパチ弾ける音）
      - 「スライムジェルコア」（むにゅっ・ぽちゃぽちゃ音）
      - 「ピヨピヨ笛 / クリッカー」（押すとキュッ・カチッと鳴るギミック）
    - 完成したスクイーズを画面上でドラッグ・プレスして「むぎゅっ」と潰し、心地よいASMR音とスローライジング復元を楽しむ触感シミュレーション。
  - **ゲームサイクル**:
    1. お客さんのオーダー受注（「サクサク音が鳴るクマちゃん」「超低反発でシュワシュワ言うメロンパン」等）
    2. 素材調合（ベースウレタン＋サウンド素材・着色）
    3. 型（モールド）成形
    4. デコレーション（トッピング・ペイント）
    5. 触感・ASMR検査（実際に潰して音と触感をテスト！）
    6. 納品・採点（触感・音・見た目のスコア判定）＆コイン獲得
    7. コインで新しい素材・型・パーツをアンロック

---

## 3. DDD ドメインモデル設計

### ドメイン層 (`src/domain/`)
```
src/domain/
├── squishy/
│   ├── model/
│   │   ├── Squishy.ts              # [集約ルート] スクイーズ本体（状態管理: 調合済→成形済→完成）
│   │   ├── BaseMaterial.ts         # ベース素材（低反発ウレタン、シリコン等）
│   │   ├── SoundFilling.ts         # サウンド素材（クランチビーズ、パチパチパウダー等）
│   │   ├── Mold.ts                 # 型・形状（メロンパン、猫、クマ等）
│   │   ├── Decoration.ts           # 装飾パーツ・トッピング
│   │   ├── TactileProperty.ts      # [値オブジェクト] 触感特性 (softness, slowRisingRate, elasticity)
│   │   ├── SoundProfile.ts         # [値オブジェクト] ASMR音特性 (soundType, pitch, intensity, crackle)
│   │   └── SquishyId.ts            # [値オブジェクト]
│   └── service/
│       └── SquishyScorer.ts        # [ドメインサービス] オーダー要件とスクイーズのマッチ度評価
├── order/
│   ├── model/
│   │   ├── Order.ts                # [集約ルート] 顧客からの注文（要求触感、要求音、希望形状）
│   │   ├── OrderRequirement.ts     # 要求仕様
│   │   └── OrderId.ts
│   └── repository/
│       └── IOrderRepository.ts
└── workshop/
    ├── model/
    │   ├── Workshop.ts             # [集約ルート] 工房（所持コイン、アンロック済み素材/型）
    │   └── Coin.ts                 # [値オブジェクト]
    └── repository/
        └── IWorkshopRepository.ts
```

### アプリケーション層 (`src/application/`)
- `CraftSquishyUseCase.ts`: 素材調合・成形・デコレーションの流れを制御
- `InspectSquishyUseCase.ts`: スクイーズのスクイーズ（圧縮）操作・ASMRトリガー
- `DeliverOrderUseCase.ts`: 納品・スコア評価・報酬付与

### インフラ層 (`src/infrastructure/`)
- `sound/WebAudioAsmrPlayer.ts`: Web Audio API を用いたリアルタイムASMRシンセサイズ / 音声再生
- `repository/InMemoryWorkshopRepository.ts`

### プレゼンテーション層 (`src/presentation/`)
- 工房メイン画面（オーダー一覧、所持コイン、作業台）
- クラフト画面（素材調合、サウンド素材配合、型流し込み、デコレーション）
- スクイーズ・ASMRインタラクション（ドラッグ/クリックでむぎゅっと変形、スローライジング復元アニメーション、音の再生）

---

## 4. 実装計画・タスク一覧 (TDD: Red/Green/Refactor -> Commit)

### フェーズ 1: プロジェクト基盤のセットアップ
- [x] 1.1 Vite + React + TypeScript + Vitest の環境構築
- [x] 1.2 テスト環境の動作確認 & 初期コミット

### フェーズ 2: ドメインモデルのTDD実装 (Red -> Green -> Refactor -> Commit)
- [x] 2.1 [TDD] `TactileProperty` & `SoundProfile` 値オブジェクト
- [x] 2.2 [TDD] `BaseMaterial`, `SoundFilling`, `Mold`, `Decoration` ドメインエンティティ/値オブジェクト
- [x] 2.3 [TDD] `Squishy` 集約（配合、成形、デコレーション、変形・復元ステータス計算）
- [x] 2.4 [TDD] `Order` 集約 & `SquishyScorer`（オーダー満足度・音と触感のマッチング計算）
- [ ] 2.5 [TDD] `Workshop` 集約（コイン獲得、素材・型のアンロック）

### フェーズ 3: 音響・ASMRインフラ & アプリケーション層
- [ ] 3.1 [TDD] ユースケース群の実装（CraftSquishy, DeliverOrder, InspectSquishy）
- [ ] 3.2 Web Audio API による ASMR サウンドエンジン（シュワシュワ、サクサク、パチパチ、むにゅっ）の実装

### フェーズ 4: UI & インタラクション実装
- [ ] 4.1 ぷにぷにインタラクションコンポーネント（変形・スローライジング・ASMR音連動）
- [ ] 4.2 クラフトUI（素材調合・サウンド素材選択・型抜き・デコレーション）
- [ ] 4.3 工房ゲームループ（注文受注 → 制作 → 検査＆ASMR → 納品・報酬・アンロック）

---

## 5. 変更履歴 (Changelog)

| 日時 (UTC) | 種別 | 内容 |
|---|---|---|
| 2026-09-06 | Initial | 開発方針（TDD/DDD、Red/Green/Refactorコミット規約）およびPLAN.mdの初期策定 |
| 2026-09-06 | Concept | スクイーズ作成ゲームのコンセプト案（案A, 案B, 案C）の策定 |
| 2026-09-06 | Design | 案A＋ASMR要素・サウンド素材の要件確定、DDDモデル設計・TDDタスク計画策定 |
| 2026-09-06 | Setup | Vite + React + TypeScript + Vitest の基盤環境構築・テスト疎通完了 |
| 2026-09-06 | Feat(Domain) | [TDD] TactileProperty & SoundProfile 値オブジェクトの実装 (Red/Green/Refactor完了) |
| 2026-09-06 | Feat(Domain) | [TDD] BaseMaterial, SoundFilling, Mold, Decoration の実装 (Red/Green/Refactor完了) |
| 2026-09-06 | Feat(Domain) | [TDD] Squishy 集約の実装（ライフサイクル・触感合成・変形/復元/ASMRパラメータ計算） (Red/Green/Refactor完了) |
| 2026-09-06 | Feat(Domain) | [TDD] Order 集約 & SquishyScorer ドメインサービスの実装 (Red/Green/Refactor完了) |
