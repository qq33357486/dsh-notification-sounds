export const zh = {
  'notify.title': 'DSH 通知声音',
  'notify.enabled': '启用通知声音',
  'notify.waiting': '需要操作',
  'notify.completed': '任务完成',
  'notify.preview': '试听',
  'notify.volume': '音量',
  'notify.remind': '完成提醒范围',
  'notify.remindAny': '所有会话',
  'notify.remindBackground': '仅后台会话',
} satisfies Record<string, string>
export type NotifyKey = keyof typeof zh
export const en = {
  'notify.title': 'DSH Notification Sounds',
  'notify.enabled': 'Enable notification sounds',
  'notify.waiting': 'User action required',
  'notify.completed': 'Task completed',
  'notify.preview': 'Preview',
  'notify.volume': 'Volume',
  'notify.remind': 'Completion scope',
  'notify.remindAny': 'All sessions',
  'notify.remindBackground': 'Background sessions only',
} satisfies Record<NotifyKey, string>
