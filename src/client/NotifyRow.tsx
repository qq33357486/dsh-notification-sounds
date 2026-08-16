import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { NotifyRemind } from '../notify-settings.ts'
import type { NotifyKey } from './locales.ts'
import type { createNotifyRowStore } from './settings-store.ts'
import css from './NotifyRow.module.css'

export interface NotifyRowInjected {
  setEnabled(enabled: boolean): void
  setWaitingEnabled(enabled: boolean): void
  setCompletedEnabled(enabled: boolean): void
  setVolume(volume: number): void
  setRemind(remind: NotifyRemind): void
  previewWaiting(): void
  previewCompleted(): void
}
export type NotifyRowComponentProps = PropsRuntime<'settings.general.item'>
  & PropsStore<ReturnType<typeof createNotifyRowStore>>
  & PropsLocale<'settings.notificationSounds'>
  & NotifyRowInjected

export function NotifyRow(props: NotifyRowComponentProps) {
  const { t, useStore } = props
  const { settings } = useStore(state => state)
  return <div className={css.row}>
    <div className={css.title}>{t('notify.title')}</div>
    <label className={css.field}>
      <span>{t('notify.enabled')}</span>
      <input type="checkbox" checked={settings.enabled} onChange={event => props.setEnabled(event.target.checked)} />
    </label>
    <label className={css.field}>
      <span>{t('notify.waiting')}</span>
      <input type="checkbox" checked={settings.waitingEnabled} onChange={event => props.setWaitingEnabled(event.target.checked)} />
      <button type="button" className={css.preview} onClick={props.previewWaiting}>{t('notify.preview')}</button>
    </label>
    <label className={css.field}>
      <span>{t('notify.completed')}</span>
      <input type="checkbox" checked={settings.completedEnabled} onChange={event => props.setCompletedEnabled(event.target.checked)} />
      <button type="button" className={css.preview} onClick={props.previewCompleted}>{t('notify.preview')}</button>
    </label>
    <label className={css.field}>
      <span>{t('notify.volume')}</span>
      <input type="range" min={0} max={1} step={0.05} value={settings.volume} onChange={event => props.setVolume(Number(event.target.value))} />
      <span className={css.muted}>{Math.round(settings.volume * 100)}%</span>
    </label>
    <label className={css.field}>
      <span>{t('notify.remind')}</span>
      <select value={settings.remind} onChange={event => props.setRemind(event.target.value as NotifyRemind)}>
        <option value="any">{t('notify.remindAny')}</option>
        <option value="background-only">{t('notify.remindBackground')}</option>
      </select>
    </label>
  </div>
}
