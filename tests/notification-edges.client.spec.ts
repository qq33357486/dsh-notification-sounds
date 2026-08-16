import { describe, expect, it } from 'vitest'
import type { PendingInteractionStatus, SessionId, SessionSummary } from '@deepseek-ai/dsh-client-runtime/client'
import { collectNotificationEdges, emptyNotificationEdgeState, taskGroups } from '../src/client/notification-edges.ts'

const sid = (value: string): SessionId => value as SessionId
interface RowOptions { pending?: PendingInteractionStatus; completed?: boolean; parentId?: string; origin?: 'subagent' }
function row(id: string, running: boolean, options: RowOptions = {}): SessionSummary {
  return {
    id: sid(id), displayTitle: id, running, blank: false, updatedAt: 0,
    ...(options.pending === undefined ? {} : { pendingInteraction: options.pending }),
    ...(options.completed === undefined ? {} : { completed: options.completed }),
    ...(options.parentId === undefined ? {} : { parentId: sid(options.parentId) }),
    ...(options.origin === undefined ? {} : { origin: options.origin }),
  }
}
const options = { now: 10_000, minRunMs: 0, remind: 'any' } as const

describe('taskGroups', () => {
  it('groups nested subagents under their root session', () => {
    const groups = taskGroups([
      row('root', false),
      row('child', false, { parentId: 'root', origin: 'subagent' }),
      row('grandchild', true, { parentId: 'child', origin: 'subagent' }),
    ])
    expect([...groups.keys()]).toEqual(['root'])
    expect(groups.get('root')).toMatchObject({ busy: true, pending: false })
  })
})

describe('collectNotificationEdges', () => {
  it('seeds without ringing on first observation', () => {
    const result = collectNotificationEdges(emptyNotificationEdgeState(), [row('s', true, { pending: 'question' })], options)
    expect(result.edges).toEqual([])
    expect(result.completions).toEqual([])
  })
  it.each(['question', 'approval', 'plan-review'] as const)('rings waiting for %s', pending => {
    const first = collectNotificationEdges(emptyNotificationEdgeState(), [row('s', true)], options)
    const next = collectNotificationEdges(first.state, [row('s', true, { pending })], options)
    expect(next.edges).toEqual([{ sessionId: 's', sound: 'waiting' }])
  })
  it('does not repeat waiting while interaction remains pending', () => {
    const first = collectNotificationEdges(emptyNotificationEdgeState(), [row('s', true)], options)
    const pending = collectNotificationEdges(first.state, [row('s', true, { pending: 'question' })], options)
    const repeated = collectNotificationEdges(pending.state, [row('s', true, { pending: 'question' })], options)
    expect(repeated.edges).toEqual([])
  })
  it('creates a completion candidate when a root task group becomes idle', () => {
    const first = collectNotificationEdges(emptyNotificationEdgeState(), [row('root', true)], { ...options, now: 1_000 })
    const next = collectNotificationEdges(first.state, [row('root', false)], options)
    expect(next.completions).toEqual([{ rootSessionId: 'root' }])
  })
  it('does not complete when only a subagent becomes idle', () => {
    const first = collectNotificationEdges(emptyNotificationEdgeState(), [
      row('root', true), row('child', true, { parentId: 'root', origin: 'subagent' }),
    ], options)
    const next = collectNotificationEdges(first.state, [
      row('root', true), row('child', false, { parentId: 'root', origin: 'subagent' }),
    ], options)
    expect(next.completions).toEqual([])
  })
  it('waits for all subagents after the root becomes idle', () => {
    const first = collectNotificationEdges(emptyNotificationEdgeState(), [
      row('root', true), row('child', true, { parentId: 'root', origin: 'subagent' }),
    ], options)
    const rootIdle = collectNotificationEdges(first.state, [
      row('root', false), row('child', true, { parentId: 'root', origin: 'subagent' }),
    ], options)
    expect(rootIdle.completions).toEqual([])
    const allIdle = collectNotificationEdges(rootIdle.state, [
      row('root', false), row('child', false, { parentId: 'root', origin: 'subagent' }),
    ], options)
    expect(allIdle.completions).toEqual([{ rootSessionId: 'root' }])
  })
  it('allows one root task to complete while another root remains running', () => {
    const first = collectNotificationEdges(emptyNotificationEdgeState(), [row('a', true), row('b', true)], options)
    const next = collectNotificationEdges(first.state, [row('a', false), row('b', true)], options)
    expect(next.completions).toEqual([{ rootSessionId: 'a' }])
  })
  it('does not complete while any group member needs user interaction', () => {
    const first = collectNotificationEdges(emptyNotificationEdgeState(), [row('root', true)], options)
    const next = collectNotificationEdges(first.state, [row('root', false, { pending: 'question' })], options)
    expect(next.completions).toEqual([])
    expect(next.edges).toEqual([{ sessionId: 'root', sound: 'waiting' }])
  })
  it('honors background-only completion scope using the root session', () => {
    const first = collectNotificationEdges(emptyNotificationEdgeState(), [row('root', true)], options)
    expect(collectNotificationEdges(first.state, [row('root', false)], { ...options, remind: 'background-only' }).completions).toEqual([])
    expect(collectNotificationEdges(first.state, [row('root', false, { completed: true })], { ...options, remind: 'background-only' }).completions)
      .toEqual([{ rootSessionId: 'root' }])
  })
})
