// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NotifyRow, type NotifyRowComponentProps, type NotifyRowInjected } from '../src/client/NotifyRow.tsx'
import { DEFAULT_NOTIFY_SETTINGS } from '../src/notify-settings.ts'
import { zh } from '../src/client/locales.ts'
import type { NotifyRowState } from '../src/client/settings-store.ts'
afterEach(cleanup)
function props() {
 const injected: NotifyRowInjected={setEnabled:vi.fn(),setWaitingEnabled:vi.fn(),setCompletedEnabled:vi.fn(),setVolume:vi.fn(),setRemind:vi.fn(),previewWaiting:vi.fn(),previewCompleted:vi.fn()}
 const state:NotifyRowState={settings:DEFAULT_NOTIFY_SETTINGS}
 return { injected, value:{t:((key:string)=>zh[key as keyof typeof zh]??key),useStore:((selector:(s:NotifyRowState)=>unknown)=>selector(state)),...injected} as unknown as NotifyRowComponentProps }
}
describe('NotifyRow',()=>{
 it('renders two previews and routes actions',()=>{const p=props();render(<NotifyRow {...p.value}/>);expect(screen.getByText('DSH 通知声音')).toBeTruthy();const buttons=screen.getAllByRole('button',{name:'试听'});fireEvent.click(buttons[0]!);fireEvent.click(buttons[1]!);expect(p.injected.previewWaiting).toHaveBeenCalledOnce();expect(p.injected.previewCompleted).toHaveBeenCalledOnce()})
})
