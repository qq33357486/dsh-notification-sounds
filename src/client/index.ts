import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { loadNotifySettings, saveNotifySettings, type NotifySettings } from '../notify-settings.ts'
import { createNotifyPlayer } from './audio.ts'
import { collectNotificationEdges, emptyNotificationEdgeState, taskGroups } from './notification-edges.ts'
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
  const COMPLETION_STABLE_MS = 1_000
  let edgeState = emptyNotificationEdgeState()
  const completionTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const cancelCompletion = (rootSessionId: string): void => {
    const timer = completionTimers.get(rootSessionId)
    if (timer !== undefined) clearTimeout(timer)
    completionTimers.delete(rootSessionId)
  }
  const scheduleCompletion = (rootSessionId: string): void => {
    cancelCompletion(rootSessionId)
    const timer = setTimeout(() => {
      completionTimers.delete(rootSessionId)
      const rows = Object.values(ctx.sessions.list.getSnapshot().byId)
      const group = taskGroups(rows).get(rootSessionId)
      if (group === undefined || group.busy || group.pending) return
      if (!current.enabled || !current.completedEnabled) return
      if (current.remind === 'background-only' && !group.backgroundCompleted) return
      player.play('completed', current.volume)
    }, COMPLETION_STABLE_MS)
    completionTimers.set(rootSessionId, timer)
  }
  const onListChange = (): void => {
    const snapshot = ctx.sessions.list.getSnapshot()
    const rows = Object.values(snapshot.byId)
    const result = collectNotificationEdges(edgeState, rows, {
      now: Date.now(), minRunMs: current.minRunMs, remind: current.remind,
    })
    edgeState = result.state
    for (const [rootSessionId, timer] of completionTimers) {
      const group = result.groups.get(rootSessionId)
      if (group === undefined || group.busy || group.pending) {
        clearTimeout(timer)
        completionTimers.delete(rootSessionId)
      }
    }
    if (current.enabled && current.waitingEnabled && result.edges.length > 0) {
      player.play('waiting', current.volume)
    }
    for (const completion of result.completions) scheduleCompletion(completion.rootSessionId)
  }
  ctx.effect(() => {
    onListChange()
    const unsubscribe = ctx.sessions.list.subscribe(onListChange)
    return () => {
      unsubscribe()
      for (const timer of completionTimers.values()) clearTimeout(timer)
      completionTimers.clear()
    }
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
