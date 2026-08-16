import { describe, expect, it, vi } from 'vitest'
import { createNotifyPlayer, type NotifyPlayerDeps } from '../src/client/audio.ts'
function fakeAudio(rejectName?: string) {
  return { src: '', volume: 1, pause: vi.fn(), play: vi.fn(() => rejectName ? Promise.reject(new DOMException('blocked', rejectName)) : Promise.resolve()) }
}
function makePlayer(rejectName?: string) {
  const elements: Array<ReturnType<typeof fakeAudio>> = []
  const deps: NotifyPlayerDeps = { audio: () => { const el = fakeAudio(rejectName); elements.push(el); return el as unknown as HTMLAudioElement } }
  return { player: createNotifyPlayer(deps), elements }
}
describe('audio player', () => {
  it('plays embedded WAV sounds', () => {
    const { player, elements } = makePlayer(); player.play('waiting', 0.4)
    expect(elements[0]?.src).toMatch(/^data:audio\/wav;base64,/); expect(elements[0]?.volume).toBe(0.4)
  })
  it('replaces an in-flight sound', () => {
    const { player, elements } = makePlayer(); player.play('waiting', 0.4); player.play('completed', 0.8)
    expect(elements[0]?.pause).toHaveBeenCalledOnce(); expect(elements).toHaveLength(2)
  })
  it('queues autoplay rejection until unlock', async () => {
    const { player, elements } = makePlayer('NotAllowedError'); player.play('waiting', 0.5); await Promise.resolve(); player.unlock()
    expect(elements).toHaveLength(2)
  })
})
