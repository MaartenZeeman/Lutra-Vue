export type { BackgroundCommand } from '@/shared/api/contract'

/** Wire values match `Lutra.Domain.Entities.BackgroundCommandStatus`. */
export const BackgroundCommandStatus = {
  Queued: 0,
  Processing: 1,
  RetryScheduled: 2,
  Succeeded: 3,
  Failed: 4,
} as const

export type BackgroundCommandStatus =
  (typeof BackgroundCommandStatus)[keyof typeof BackgroundCommandStatus]

export const BACKGROUND_COMMAND_STATUS_LABELS: Record<BackgroundCommandStatus, string> = {
  [BackgroundCommandStatus.Queued]: 'In de wachtrij',
  [BackgroundCommandStatus.Processing]: 'Bezig met importeren',
  [BackgroundCommandStatus.RetryScheduled]: 'Opnieuw gepland',
  [BackgroundCommandStatus.Succeeded]: 'Voltooid',
  [BackgroundCommandStatus.Failed]: 'Mislukt',
}

export function isTerminaleStatus(status: number): boolean {
  return status === BackgroundCommandStatus.Succeeded || status === BackgroundCommandStatus.Failed
}
