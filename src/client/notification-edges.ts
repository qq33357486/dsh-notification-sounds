import type { PendingInteractionStatus, SessionId, SessionSummary } from '@deepseek-ai/dsh-client-runtime/client'
import type { NotifyRemind } from '../notify-settings.ts'

export interface NotificationEdge {
  sessionId: string
  sound: 'waiting'
}

export interface CompletionCandidate {
  rootSessionId: string
}

export interface NotificationEdgeOptions {
  now: number
  minRunMs: number
  remind: NotifyRemind
}

export interface TaskGroupSnapshot {
  rootSessionId: string
  busy: boolean
  pending: boolean
  backgroundCompleted: boolean
}

export interface NotificationEdgeState {
  groupBusy: Map<string, boolean>
  groupBusySince: Map<string, number>
  pending: Map<string, PendingInteractionStatus | undefined>
}

export function emptyNotificationEdgeState(): NotificationEdgeState {
  return { groupBusy: new Map(), groupBusySince: new Map(), pending: new Map() }
}

function rootId(row: SessionSummary, byId: ReadonlyMap<string, SessionSummary>): string {
  let current = row
  const seen = new Set<string>()
  while (current.parentId !== undefined && !seen.has(current.id)) {
    seen.add(current.id)
    const parent = byId.get(current.parentId)
    if (parent === undefined) return current.parentId
    current = parent
  }
  return current.id
}

export function taskGroups(rows: readonly SessionSummary[]): Map<string, TaskGroupSnapshot> {
  const byId = new Map(rows.map(row => [row.id, row]))
  const groups = new Map<string, TaskGroupSnapshot>()
  for (const row of rows) {
    const rootSessionId = rootId(row, byId)
    const group = groups.get(rootSessionId) ?? {
      rootSessionId,
      busy: false,
      pending: false,
      backgroundCompleted: false,
    }
    group.busy ||= row.running
    group.pending ||= row.pendingInteraction !== undefined
    if (row.id === rootSessionId) group.backgroundCompleted = row.completed === true
    groups.set(rootSessionId, group)
  }
  return groups
}

export function collectNotificationEdges(
  previous: NotificationEdgeState,
  rows: readonly SessionSummary[],
  options: NotificationEdgeOptions,
): { edges: NotificationEdge[]; completions: CompletionCandidate[]; groups: Map<string, TaskGroupSnapshot>; state: NotificationEdgeState } {
  const state = emptyNotificationEdgeState()
  const edges: NotificationEdge[] = []
  const completions: CompletionCandidate[] = []
  const groups = taskGroups(rows)

  for (const row of rows) {
    const wasObserved = previous.pending.has(row.id)
    const prevPending = previous.pending.get(row.id)
    state.pending.set(row.id, row.pendingInteraction)
    if (wasObserved && prevPending === undefined && row.pendingInteraction !== undefined) {
      edges.push({ sessionId: row.id, sound: 'waiting' })
    }
  }

  for (const group of groups.values()) {
    const prevBusy = previous.groupBusy.get(group.rootSessionId)
    state.groupBusy.set(group.rootSessionId, group.busy)
    if (prevBusy === undefined) {
      if (group.busy) state.groupBusySince.set(group.rootSessionId, options.now)
      continue
    }
    if (group.busy) {
      state.groupBusySince.set(group.rootSessionId, previous.groupBusySince.get(group.rootSessionId) ?? options.now)
      continue
    }
    if (prevBusy && !group.pending) {
      const since = previous.groupBusySince.get(group.rootSessionId)
      const durationMs = since === undefined ? 0 : options.now - since
      if (durationMs >= options.minRunMs && (options.remind === 'any' || group.backgroundCompleted)) {
        completions.push({ rootSessionId: group.rootSessionId })
      }
    }
  }
  return { edges, completions, groups, state }
}
