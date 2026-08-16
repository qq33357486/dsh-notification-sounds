import { NOTIFY_AUDIO } from '../audio/audio-data.ts'

export type NotificationSound = keyof typeof NOTIFY_AUDIO
export interface NotifyPlayerDeps { audio?: () => HTMLAudioElement }
export interface NotifyPlayer { unlock(): void; play(sound: NotificationSound, volume: number): void }

function isNotAllowed(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'NotAllowedError'
}

export function createNotifyPlayer(deps: NotifyPlayerDeps = {}): NotifyPlayer {
  const audio = deps.audio ?? (() => new Audio())
  let current: HTMLAudioElement | undefined
  let queued: { sound: NotificationSound; volume: number } | undefined
  let unlocked = false
  const playOne = (sound: NotificationSound, volume: number): void => {
    current?.pause()
    const el = audio()
    el.src = `data:audio/wav;base64,${NOTIFY_AUDIO[sound]}`
    el.volume = volume
    current = el
    void el.play().catch((error: unknown) => {
      if (isNotAllowed(error)) queued = { sound, volume }
    })
  }
  return {
    unlock: () => {
      unlocked = true
      const pending = queued
      queued = undefined
      if (pending !== undefined) playOne(pending.sound, pending.volume)
    },
    play: (sound, volume) => {
      if (!unlocked && queued !== undefined) {
        queued = { sound, volume }
        return
      }
      playOne(sound, volume)
    },
  }
}
