import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import { DEFAULT_NOTIFY_SETTINGS, type NotifySettings } from '../notify-settings.ts'
export interface NotifyRowState { settings: NotifySettings }
type NotifyRowActions = { set: (draft: NotifyRowState, next: NotifySettings) => void }
export function createNotifyRowStore(): EngineStoreHandle<NotifyRowState, NotifyRowActions> {
  return defineStore({
    init: (): NotifyRowState => ({ settings: DEFAULT_NOTIFY_SETTINGS }),
    actions: { set: (draft, next) => { draft.settings = next } },
  })
}
