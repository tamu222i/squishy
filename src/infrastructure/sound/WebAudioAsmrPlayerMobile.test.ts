import { describe, it, expect, vi } from 'vitest'
import { WebAudioAsmrPlayer } from './WebAudioAsmrPlayer'

describe('WebAudioAsmrPlayer Mobile Audio Unlock (TDD)', () => {
  it('unlocks audio context on initial user interaction', async () => {
    let resumed = false
    const mockCtx = {
      state: 'suspended',
      resume: vi.fn().mockImplementation(async () => {
        resumed = true
      }),
    }
    const player = new WebAudioAsmrPlayer(() => mockCtx as any)

    await player.unlockAudio()

    expect(mockCtx.resume).toHaveBeenCalled()
    expect(resumed).toBe(true)
  })
})
