import { describe, expect, it } from 'vitest'
import { DEFAULT_NOTIFY_SETTINGS, loadNotifySettings, NOTIFY_STORAGE_KEY, NotifySettingsSchema, saveNotifySettings, type NotifyStorage } from '../src/notify-settings.ts'
function storage(): NotifyStorage & { data: Record<string, string> } {
  const data: Record<string,string> = {}; return { data, getItem:key => data[key] ?? null, setItem:(key,value) => { data[key]=value } }
}
describe('settings', () => {
  it('applies defaults', () => expect(NotifySettingsSchema({} as never)).toEqual(DEFAULT_NOTIFY_SETTINGS))
  it('round trips storage', () => { const s=storage(); saveNotifySettings(DEFAULT_NOTIFY_SETTINGS,s); expect(loadNotifySettings(s)).toEqual(DEFAULT_NOTIFY_SETTINGS); expect(s.data[NOTIFY_STORAGE_KEY]).toBeTruthy() })
  it('rejects invalid volume', () => expect(() => NotifySettingsSchema({ volume: 2 } as never)).toThrow())
})
