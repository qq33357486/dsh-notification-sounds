import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { loadNotifySettings, saveNotifySettings, type NotifySettings } from '../notify-settings.ts'
import { createNotifyPlayer } from './audio.ts'
import { collectNotificationEdges, emptyNotificationEdgeState } from './notification-edges.ts'
import { createNotifyRowStore } from './settings-store.ts'
import { NotifyRow, type NotifyRowInjected } from './NotifyRow.tsx'
import { en, zh, type NotifyKey } from './locales.ts'

export { NotifyRow, type NotifyRowInjected } from './NotifyRow.tsx'
const NS = 'settings.notificationSounds'
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { 'settings.notificationSounds': NotifyKey }
}
export const inject = ['sessions', 'slots', 'locale']

export function apply(ctx: ClientContext): void {
  const player = createNotifyPlayer()
  const store = createNotifyRowStore()
  let current: NotifySettings = loadNotifySettings()
  let edgeState = emptyNotificationEdgeState()
  const onListChange = (): void => {
    const snapshot = ctx.sessions.list.getSnapshot()
    const result = collectNotificationEdges(edgeState, Object.values(snapshot.byId), {
      now: Date.now(), minRunMs: current.minRunMs, remind: current.remind,
    })
    edgeState = result.state
    if (!current.enabled) return
    if (current.waitingEnabled && result.edges.some(edge => edge.sound === 'waiting')) {
      player.play('waiting', current.volume)
      return
    }
    if (current.completedEnabled && result.edges.some(edge => edge.sound === 'completed')) {
      player.play('completed', current.volume)
    }
  }
  ctx.effect(() => {
    onListChange()
    return ctx.sessions.list.subscribe(onListChange)
  }, 'notification-sounds: session watch')

  const unlock = (): void => { player.unlock() }
  ctx.effect(() => {
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, 'notification-sounds: audio unlock')

  let bound: BoundActions<typeof store> | undefined
  const commit = (next: NotifySettings): void => {
    current = next
    saveNotifySettings(next)
    bound?.set(next)
  }
  const injected = (actions: BoundActions<typeof store>): NotifyRowInjected => {
    bound = actions
    bound.set(current)
    return {
      setEnabled: enabled => commit({ ...current, enabled }),
      setWaitingEnabled: waitingEnabled => commit({ ...current, waitingEnabled }),
      setCompletedEnabled: completedEnabled => commit({ ...current, completedEnabled }),
      setVolume: volume => commit({ ...current, volume }),
      setRemind: remind => commit({ ...current, remind }),
      previewWaiting: () => player.play('waiting', current.volume),
      previewCompleted: () => player.play('completed', current.volume),
    }
  }
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item', id: 'notification-sounds', order: 20, store, locale: NS, inject: injected,
  }, NotifyRow))
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'notification-sounds: dictionaries')
}
