import type { PendingInteractionStatus, SessionSummary } from '@deepseek-ai/dsh-client-runtime/client'
import type { NotifyRemind } from '../notify-settings.ts'

export interface NotificationEdge {
  sessionId: string
  sound: 'waiting' | 'completed'
}

export interface NotificationEdgeOptions {
  now: number
  minRunMs: number
  remind: NotifyRemind
}

export interface NotificationEdgeState {
  running: Map<string, boolean>
  runningSince: Map<string, number>
  pending: Map<string, PendingInteractionStatus | undefined>
}

export function emptyNotificationEdgeState(): NotificationEdgeState {
  return { running: new Map(), runningSince: new Map(), pending: new Map() }
}

export function collectNotificationEdges(
  previous: NotificationEdgeState,
  rows: readonly SessionSummary[],
  options: NotificationEdgeOptions,
): { edges: NotificationEdge[]; state: NotificationEdgeState } {
  const state = emptyNotificationEdgeState()
  const edges: NotificationEdge[] = []
  for (const row of rows) {
    const prevRunning = previous.running.get(row.id)
    const prevPending = previous.pending.get(row.id)
    state.running.set(row.id, row.running)
    state.pending.set(row.id, row.pendingInteraction)

    if (prevRunning === undefined) {
      if (row.running) state.runningSince.set(row.id, options.now)
      continue
    }

    if (row.running) state.runningSince.set(row.id, previous.runningSince.get(row.id) ?? options.now)

    if (prevPending === undefined && row.pendingInteraction !== undefined) {
      edges.push({ sessionId: row.id, sound: 'waiting' })
    }

    if (prevRunning && !row.running && row.pendingInteraction === undefined) {
      const since = previous.runningSince.get(row.id)
      const durationMs = since === undefined ? 0 : options.now - since
      if (durationMs >= options.minRunMs && (options.remind === 'any' || row.completed === true)) {
        edges.push({ sessionId: row.id, sound: 'completed' })
      }
    }
  }
  return { edges, state }
}
