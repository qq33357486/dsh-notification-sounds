import z from '@deepseek-ai/schemastery'

export const NOTIFY_REMIND = ['any', 'background-only'] as const
export type NotifyRemind = typeof NOTIFY_REMIND[number]

export interface NotifySettings {
  enabled: boolean
  waitingEnabled: boolean
  completedEnabled: boolean
  volume: number
  remind: NotifyRemind
  minRunMs: number
}

export const NotifySettingsSchema: z<NotifySettings> = z.object({
  enabled: z.boolean().default(true),
  waitingEnabled: z.boolean().default(true),
  completedEnabled: z.boolean().default(true),
  volume: z.number().min(0).max(1).default(0.7),
  remind: z.union([...NOTIFY_REMIND]).default('any'),
  minRunMs: z.natural().default(0),
})

export const DEFAULT_NOTIFY_SETTINGS: NotifySettings = {
  enabled: true,
  waitingEnabled: true,
  completedEnabled: true,
  volume: 0.7,
  remind: 'any',
  minRunMs: 0,
}

export const NOTIFY_STORAGE_KEY = 'dsh-notification-sounds.settings'

export interface NotifyStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function loadNotifySettings(storage: NotifyStorage = globalThis.localStorage): NotifySettings {
  try {
    const raw = storage.getItem(NOTIFY_STORAGE_KEY)
    if (raw === null) return DEFAULT_NOTIFY_SETTINGS
    return NotifySettingsSchema(JSON.parse(raw)) as never
  } catch {
    return DEFAULT_NOTIFY_SETTINGS
  }
}

export function saveNotifySettings(settings: NotifySettings, storage: NotifyStorage = globalThis.localStorage): void {
  try { storage.setItem(NOTIFY_STORAGE_KEY, JSON.stringify(settings)) } catch { /* in-memory settings still work */ }
}
