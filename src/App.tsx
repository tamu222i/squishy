import React, { useState, useMemo } from 'react'
import './App.css'
import { useWorkshopGame } from './presentation/hooks/useWorkshopGame'
import { SquishyToy } from './presentation/components/SquishyToy'
import { WebAudioAsmrPlayer } from './infrastructure/sound/WebAudioAsmrPlayer'
import {
  BASE_MATERIALS,
  SOUND_FILLINGS,
  MOLDS,
  DECORATIONS,
} from './domain/squishy/model/CraftMaterials'
import confetti from 'canvas-confetti'

export function App() {
  const game = useWorkshopGame()
  const soundPlayer = useMemo(() => new WebAudioAsmrPlayer(), [])

  const [squishyName, setSquishyName] = useState('とっておきのスクイーズ')
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)

  // Sound Preview Helper
  const previewSound = (e: React.MouseEvent, soundFillingId: string) => {
    e.stopPropagation()
    const filling = SOUND_FILLINGS.find((f) => f.id === soundFillingId)
    if (filling) {
      soundPlayer.playSquish({
        soundType: filling.soundProfile.soundType,
        volume: 0.9,
        pitch: filling.soundProfile.pitch,
        crackleCount: Math.max(3, Math.round(filling.soundProfile.crackleRate * 8)),
      })
    }
  }

  // Handle Delivery
  const handleDeliver = (orderId: string) => {
    game.deliverActiveSquishy(orderId)
    setShowDeliveryModal(true)
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  // Sound name label helper
  const getSoundLabel = (type: string) => {
    switch (type) {
      case 'air_slow':
        return '🌬️ スローエア（シュワ〜っと抜ける低反発音）'
      case 'crunch_beads':
        return '🥣 クランチビーズ（サクサク・シャリシャリ音）'
      case 'popping_candy':
        return '💥 パチパチキャンディ（パチパチ弾ける音）'
      case 'slime_gel':
        return '💧 スライムジェル（むにゅっ・ぽちゃ音）'
      case 'squeak_toy':
        return '🐥 ピヨピヨ笛（キュッ！と鳴るトイ音）'
      default:
        return '無音'
    }
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="glass-card app-header">
        <div className="logo-group">
          <span className="logo-icon">🧸</span>
          <div>
            <h1 className="logo-title">ぷにぷに工房</h1>
            <div className="logo-subtitle">〜 スクイーズASMRクラフトショップ 〜</div>
          </div>
        </div>

        <div className="coin-badge">
          <span>🪙</span>
          <span>{game.workshop.coins.value} コイン</span>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="glass-card nav-tabs">
        <button
          className={`nav-tab-btn ${game.currentScreen === 'orders' ? 'active' : ''}`}
          onClick={() => game.navigateTo('orders')}
        >
          <span>📋</span>
          <span>お客さんの注文 ({game.orders.filter((o) => o.status === 'pending').length})</span>
        </button>
        <button
          className={`nav-tab-btn ${game.currentScreen === 'craft' ? 'active' : ''}`}
          onClick={() => game.navigateTo('craft')}
        >
          <span>🧪</span>
          <span>スクイーズ調合台</span>
        </button>
        <button
          className={`nav-tab-btn ${game.currentScreen === 'inspect' ? 'active' : ''}`}
          onClick={() => game.navigateTo('inspect')}
          disabled={!game.activeSquishy}
          style={{ opacity: game.activeSquishy ? 1 : 0.5 }}
        >
          <span>✨</span>
          <span>ASMRプレイ＆検査</span>
        </button>
        <button
          className={`nav-tab-btn ${game.currentScreen === 'showroom' ? 'active' : ''}`}
          onClick={() => game.navigateTo('showroom')}
        >
          <span>🏆</span>
          <span>ショールーム ({game.workshop.showroom.length})</span>
        </button>
        <button
          className={`nav-tab-btn ${game.currentScreen === 'shop' ? 'active' : ''}`}
          onClick={() => game.navigateTo('shop')}
        >
          <span>🛒</span>
          <span>工房ショップ</span>
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main>
        {/* SCREEN 1: ORDERS */}
        {game.currentScreen === 'orders' && (
          <div className="glass-card panel">
            <h2 className="panel-title">
              <span>📋</span>
              <span>届いているオーダー一覧</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
              お客さんの好みに合わせて、素材調合・サウンド素材・型を選んでスクイーズを作りましょう！
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {game.orders.map((order) => {
                const targetMold = MOLDS.find((m) => m.id === order.requirement.targetMoldId)
                const isCompleted = order.status === 'completed'

                return (
                  <div
                    key={order.id.value}
                    className="glass-card"
                    style={{
                      padding: 20,
                      border: isCompleted ? '2px solid #86efac' : '2px solid #fbcfe8',
                      background: isCompleted ? '#f0fdf4' : '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 16,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 20 }}>👤</span>
                        <strong style={{ fontSize: 16 }}>{order.requirement.customerName}</strong>
                        {isCompleted ? (
                          <span style={{ fontSize: 12, background: '#bbf7d0', color: '#166534', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                            ✓ 納品済み (スコア: {order.finalScore}点)
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, background: '#fef08a', color: '#854d0e', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                            受付中
                          </span>
                        )}
                      </div>
                      <p style={{ fontStyle: 'italic', color: '#4b5563', margin: '6px 0 10px', background: '#f9fafb', padding: '8px 12px', borderRadius: 8 }}>
                        {order.requirement.dialogue}
                      </p>
                      <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#6b7280', flexWrap: 'wrap' }}>
                        <span>希望の型: <strong>{targetMold?.name ?? order.requirement.targetMoldId}</strong></span>
                        {order.requirement.preferredSoundType && (
                          <span>希望の音: <strong>{getSoundLabel(order.requirement.preferredSoundType)}</strong></span>
                        )}
                        <span style={{ color: '#d97706', fontWeight: 700 }}>報酬: 🪙 {order.requirement.rewardCoins}</span>
                      </div>
                    </div>

                    <div>
                      {!isCompleted ? (
                        <button
                          className="btn-primary"
                          onClick={() => {
                            game.startCraftingForOrder(order.id.value)
                            setActiveStep(1)
                          }}
                        >
                          <span>🛠️</span>
                          <span>この注文を作る</span>
                        </button>
                      ) : (
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            game.startCraftingForOrder(order.id.value)
                            setActiveStep(1)
                          }}
                        >
                          <span>🔄 もう一度作る</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* SCREEN 2: CRAFT TABLE */}
        {game.currentScreen === 'craft' && (
          <div className="glass-card panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="panel-title" style={{ margin: 0 }}>
                <span>🧪</span>
                <span>スクイーズ調合・制作作業台</span>
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    onClick={() => setActiveStep(step as any)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: 'none',
                      background: activeStep === step ? 'var(--primary)' : '#e5e7eb',
                      color: activeStep === step ? '#fff' : '#4b5563',
                      fontWeight: 800,
                    }}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 1: BASE MATERIAL */}
            {activeStep === 1 && (
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 8, color: 'var(--primary)' }}>
                  ステップ 1: ベースウレタン（主剤）の選択
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  柔らかさや基本的な復元弾力を決めるメイン素材です。
                </p>
                <div className="selection-list">
                  {BASE_MATERIALS.map((mat) => {
                    const isSelected = game.craftingSession.baseMaterialId === mat.id
                    return (
                      <div
                        key={mat.id}
                        className={`selection-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => game.selectBaseMaterial(mat.id)}
                      >
                        <div>
                          <strong style={{ fontSize: 15 }}>{mat.name}</strong>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            柔らかさ: {Math.round(mat.tactileProperty.softness * 100)}% | 
                            スローライジング復元遅延: {Math.round(mat.tactileProperty.slowRisingRate * 100)}% | 
                            弾性: {Math.round(mat.tactileProperty.elasticity * 100)}%
                          </div>
                        </div>
                        <span style={{ fontSize: 24 }}>{isSelected ? '✅' : '⚪'}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 24, textAlign: 'right' }}>
                  <button className="btn-primary" onClick={() => setActiveStep(2)}>
                    <span>次へ: サウンド素材選択 🔊</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SOUND FILLING (ASMR SPECIAL MATERIALS) */}
            {activeStep === 2 && (
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 8, color: 'var(--primary)' }}>
                  ステップ 2: サウンド素材（特殊フィリング）の配合 🔊【ASMR特化】
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  スクイーズを押したときに心地よい音が鳴る特殊ビーズや通気孔パウダーを混ぜ込みます！
                </p>
                <div className="selection-list">
                  {/* Option for pure / no filling */}
                  <div
                    className={`selection-card ${!game.craftingSession.soundFillingId ? 'selected' : ''}`}
                    onClick={() => game.selectSoundFilling(undefined)}
                  >
                    <div>
                      <strong style={{ fontSize: 15 }}>🍃 フィリングなし（スタンダード低反発エア音）</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        余計な音を入れず、空気がフワ〜っと抜ける自然な触感。
                      </div>
                    </div>
                    <span style={{ fontSize: 24 }}>{!game.craftingSession.soundFillingId ? '✅' : '⚪'}</span>
                  </div>

                  {/* Sound Filling Presets */}
                  {SOUND_FILLINGS.map((filling) => {
                    const isSelected = game.craftingSession.soundFillingId === filling.id
                    return (
                      <div
                        key={filling.id}
                        className={`selection-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => game.selectSoundFilling(filling.id)}
                      >
                        <div style={{ flex: 1, paddingRight: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong style={{ fontSize: 15 }}>{filling.name}</strong>
                            <button
                              type="button"
                              className="btn-sound-preview"
                              onClick={(e) => previewSound(e, filling.id)}
                            >
                              <span>🔊 音を試聴</span>
                            </button>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            音のタイプ: {getSoundLabel(filling.soundProfile.soundType)}
                          </div>
                        </div>
                        <span style={{ fontSize: 24 }}>{isSelected ? '✅' : '⚪'}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                  <button className="btn-secondary" onClick={() => setActiveStep(1)}>
                    戻る
                  </button>
                  <button className="btn-primary" onClick={() => setActiveStep(3)}>
                    <span>次へ: 型（モールド）選択 🧁</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: MOLD SELECTION */}
            {activeStep === 3 && (
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 8, color: 'var(--primary)' }}>
                  ステップ 3: 型（モールド）の選択
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  流し込んで成形する形を選びます。
                </p>
                <div className="selection-list">
                  {MOLDS.map((mold) => {
                    const isUnlocked = game.workshop.isMoldUnlocked(mold.id)
                    const isSelected = game.craftingSession.moldId === mold.id

                    return (
                      <div
                        key={mold.id}
                        className={`selection-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`}
                        onClick={() => {
                          if (isUnlocked) game.selectMold(mold.id)
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: 15 }}>
                            {mold.name} {!isUnlocked && '🔒 (ショップでアンロック可能)'}
                          </strong>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            {mold.description}
                          </div>
                        </div>
                        <span style={{ fontSize: 24 }}>
                          {!isUnlocked ? '🔒' : isSelected ? '✅' : '⚪'}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                  <button className="btn-secondary" onClick={() => setActiveStep(2)}>
                    戻る
                  </button>
                  <button className="btn-primary" onClick={() => setActiveStep(4)}>
                    <span>次へ: デコレーション＆完成 ✨</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: DECORATION & FINISH */}
            {activeStep === 4 && (
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 8, color: 'var(--primary)' }}>
                  ステップ 4: デコレーション＆命名
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  色付けスプレーやトッピングをトッピングして可愛く仕上げましょう！
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
                  {DECORATIONS.map((deco) => {
                    const isSelected = game.craftingSession.decorationIds.includes(deco.id)
                    return (
                      <div
                        key={deco.id}
                        className={`selection-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => game.toggleDecoration(deco.id)}
                        style={{ padding: 10 }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 20 }}>{deco.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{deco.name}</span>
                        </div>
                        <span>{isSelected ? '✅' : '➕'}</span>
                      </div>
                    )
                  })}
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontWeight: 800, marginBottom: 8, fontSize: 14 }}>
                    スクイーズの名前:
                  </label>
                  <input
                    type="text"
                    value={squishyName}
                    onChange={(e) => setSquishyName(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: 400,
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: '2px solid #e5e7eb',
                      fontSize: 16,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button className="btn-secondary" onClick={() => setActiveStep(3)}>
                    戻る
                  </button>
                  <button
                    className="btn-primary"
                    style={{ padding: '16px 36px', fontSize: 18 }}
                    onClick={() => game.finishCrafting(squishyName)}
                  >
                    <span>🎉 成形＆完成！ASMRで遊ぶ</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 3: INSPECT & ASMR PLAY */}
        {game.currentScreen === 'inspect' && game.activeSquishy && (
          <div className="glass-card panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 className="panel-title" style={{ margin: 0 }}>
                  <span>✨</span>
                  <span>{game.activeSquishy.name}</span>
                </h2>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {getSoundLabel(game.activeSquishy.soundProfile.soundType)}
                </div>
              </div>

              {/* Delivery Action Button if Order is matched */}
              {game.selectedOrderId && (
                <button
                  className="btn-primary"
                  onClick={() => handleDeliver(game.selectedOrderId!)}
                >
                  <span>📦 このスクイーズを納品する！</span>
                </button>
              )}
            </div>

            <div className="grid-2">
              {/* Interactive Squishy Stage */}
              <div className="inspection-stage">
                <SquishyToy
                  squishy={game.activeSquishy}
                  soundPlayer={soundPlayer}
                  size={260}
                />
              </div>

              {/* Tactile & Acoustic Properties Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="glass-card" style={{ padding: 18, background: '#ffffff' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 15, color: 'var(--primary)' }}>
                    📊 触感ステータス
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>柔らかさ (Softness)</span>
                        <strong>{Math.round(game.activeSquishy.tactileProperty.softness * 100)}%</strong>
                      </div>
                      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${game.activeSquishy.tactileProperty.softness * 100}%`, height: '100%', background: '#f43f5e' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>復元遅延 (Slow-Rising)</span>
                        <strong>{Math.round(game.activeSquishy.tactileProperty.slowRisingRate * 100)}%</strong>
                      </div>
                      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${game.activeSquishy.tactileProperty.slowRisingRate * 100}%`, height: '100%', background: '#a855f7' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>弾力 (Elasticity)</span>
                        <strong>{Math.round(game.activeSquishy.tactileProperty.elasticity * 100)}%</strong>
                      </div>
                      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${game.activeSquishy.tactileProperty.elasticity * 100}%`, height: '100%', background: '#3b82f6' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: 18, background: '#ffffff' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: 15, color: '#4338ca' }}>
                    🎧 ASMR音響プロファイル
                  </h4>
                  <p style={{ fontSize: 13, color: '#4b5563', margin: 0 }}>
                    {getSoundLabel(game.activeSquishy.soundProfile.soundType)}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    クリック・ドラッグで強く押すほど、音量と粒立ちがダイナミックに変化します。
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      game.startCrafting()
                      setActiveStep(1)
                    }}
                  >
                    別のスクイーズを作る
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => game.navigateTo('showroom')}
                  >
                    ショールームを見る
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 4: SHOWROOM */}
        {game.currentScreen === 'showroom' && (
          <div className="glass-card panel">
            <h2 className="panel-title">
              <span>🏆</span>
              <span>工房コレクション・ショールーム</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
              これまでに制作した自慢のスクイーズたちです。選ぶといつでも触って遊べます！
            </p>

            {game.workshop.showroom.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: 48 }}>🧁</span>
                <p style={{ marginTop: 12 }}>まだショールームにスクイーズがありません。注文を納品すると展示されます！</p>
                <button
                  className="btn-primary"
                  style={{ marginTop: 16 }}
                  onClick={() => game.navigateTo('orders')}
                >
                  注文を見てみる
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                {game.workshop.showroom.map((squishy, idx) => (
                  <div
                    key={idx}
                    className="glass-card"
                    style={{
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    onClick={() => game.setActiveSquishy(squishy)}
                  >
                    <SquishyToy
                      squishy={squishy}
                      soundPlayer={soundPlayer}
                      size={150}
                      interactive={false}
                    />
                    <strong style={{ fontSize: 16, marginTop: 10 }}>{squishy.name}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {getSoundLabel(squishy.soundProfile.soundType)}
                    </div>
                    <button
                      className="btn-secondary"
                      style={{ marginTop: 12, padding: '6px 14px', fontSize: 12 }}
                      onClick={() => game.setActiveSquishy(squishy)}
                    >
                      👆 この子をぷにぷにする
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SCREEN 5: SHOP */}
        {game.currentScreen === 'shop' && (
          <div className="glass-card panel">
            <h2 className="panel-title">
              <span>🛒</span>
              <span>工房ショップ（型＆新素材のアンロック）</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
              獲得したコインを使って、新しいモールド（型）を解放しましょう！
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {MOLDS.map((mold) => {
                const isUnlocked = game.workshop.isMoldUnlocked(mold.id)
                const canAfford = game.workshop.coins.value >= mold.unlockCost

                return (
                  <div
                    key={mold.id}
                    className="glass-card"
                    style={{
                      padding: 20,
                      background: '#ffffff',
                      border: isUnlocked ? '2px solid #86efac' : '2px solid #e5e7eb',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: 16 }}>{mold.name}</strong>
                        {isUnlocked && <span style={{ fontSize: 12, color: '#166534', fontWeight: 700 }}>✓ 解放済み</span>}
                      </div>
                      <p style={{ fontSize: 13, color: '#4b5563', margin: '8px 0 16px' }}>
                        {mold.description}
                      </p>
                    </div>

                    <div>
                      {isUnlocked ? (
                        <button
                          className="btn-secondary"
                          style={{ width: '100%' }}
                          onClick={() => {
                            game.startCrafting(mold.id)
                            setActiveStep(1)
                          }}
                        >
                          この型で作る
                        </button>
                      ) : (
                        <button
                          className="btn-primary"
                          style={{
                            width: '100%',
                            opacity: canAfford ? 1 : 0.6,
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                          }}
                          disabled={!canAfford}
                          onClick={() => game.unlockMold(mold)}
                        >
                          <span>🪙 {mold.unlockCost} コインで解放</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* DELIVERY EVALUATION RESULT MODAL */}
      {showDeliveryModal && game.lastDeliveryResult && (
        <div className="modal-backdrop" onClick={() => setShowDeliveryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 48 }}>🎉</span>
              <h3 style={{ fontSize: 22, margin: '8px 0' }}>納品完了！</h3>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)', margin: '12px 0' }}>
                スコア: {game.lastDeliveryResult.totalScore} 点
              </div>

              {/* Feedback Dialogue */}
              <div
                style={{
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: 12,
                  padding: '14px 18px',
                  color: '#9f1239',
                  fontStyle: 'italic',
                  margin: '16px 0',
                }}
              >
                {game.lastDeliveryResult.feedback}
              </div>

              {/* Score Breakdown */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  padding: '12px 0',
                  borderTop: '1px solid #f3f4f6',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: 13,
                  color: '#4b5563',
                }}
              >
                <div>見た目: <strong>{game.lastDeliveryResult.appearanceScore}点</strong></div>
                <div>ASMR音: <strong>{game.lastDeliveryResult.soundScore}点</strong></div>
                <div>触感: <strong>{game.lastDeliveryResult.tactileScore}点</strong></div>
              </div>

              {/* Coins Earned */}
              <div
                style={{
                  margin: '18px 0',
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>🪙</span>
                <span>+{game.lastDeliveryResult.earnedCoins} コイン獲得！</span>
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  setShowDeliveryModal(false)
                  game.navigateTo('orders')
                }}
              >
                次の注文を受ける
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
