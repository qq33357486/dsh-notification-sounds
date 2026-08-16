import { describe, expect, it } from 'vitest'
import type { PendingInteractionStatus, SessionId, SessionSummary } from '@deepseek-ai/dsh-client-runtime/client'
import { collectNotificationEdges, emptyNotificationEdgeState } from '../src/client/notification-edges.ts'
const sid = (value: string): SessionId => value as SessionId
function row(id: string, running: boolean, pendingInteraction?: PendingInteractionStatus, completed?: boolean): SessionSummary {
  return { id: sid(id), displayTitle: id, running, blank: false, updatedAt: 0,
    ...(pendingInteraction === undefined ? {} : { pendingInteraction }),
    ...(completed === undefined ? {} : { completed }) }
}
const options = { now: 10_000, minRunMs: 0, remind: 'any' } as const
describe('collectNotificationEdges', () => {
  it('seeds without ringing on first observation', () => {
    const result = collectNotificationEdges(emptyNotificationEdgeState(), [row('s', true, 'question')], options)
    expect(result.edges).toEqual([])
  })
  it.each(['question', 'approval', 'plan-review'] as const)('rings waiting for %s', pending => {
    const first = collectNotificationEdges(emptyNotificationEdgeState(), [row('s', true)], options)
    const next = collectNotificationEdges(first.state, [row('s', true, pending)], options)
    expect(next.edges).toEqual([{ sessionId: 's', sound: 'waiting' }])
  })
  it('does not repeat waiting while interaction remains pending', () => {
    const first = collectNotificationEdges(emptyNotificationEdgeState(), [row('s', true)], options)
    const pending = collectNotificationEdges(first.state, [row('s', true, 'question')], options)
    const repeated = collectNotificationEdges(pending.state, [row('s', true, 'question')], options)
    expect(repeated.edges).toEqual([])
  })
  it('rings completed for running to idle', () => {
    const first = collectNotificationEdges(emptyNotificationEdgeState(), [row('s', true)], { ...options, now: 1_000 })
    const next = collectNotificationEdges(first.state, [row('s', false)], options)
    expect(next.edges).toEqual([{ sessionId: 's', sound: 'completed' }])
  })
  it('does not ring completed while user interaction is pending', () => {
    const first = collectNotificationEdges(emptyNotificationEdgeState(), [row('s', true)], options)
    const next = collectNotificationEdges(first.state, [row('s', false, 'question')], options)
    expect(next.edges).toEqual([{ sessionId: 's', sound: 'waiting' }])
  })
  it('honors background-only completion scope', () => {
    const first = collectNotificationEdges(emptyNotificationEdgeState(), [row('s', true)], options)
    expect(collectNotificationEdges(first.state, [row('s', false)], { ...options, remind: 'background-only' }).edges).toEqual([])
    expect(collectNotificationEdges(first.state, [row('s', false, undefined, true)], { ...options, remind: 'background-only' }).edges)
      .toEqual([{ sessionId: 's', sound: 'completed' }])
  })
})
