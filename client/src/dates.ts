// Helpers for "YYYY-MM-DD" due dates, compared in the user's local time zone.
export function todayISO(): string {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function formatDue(iso: string): string {
  const today = todayISO()
  const tomorrow = new Date(Date.parse(today) + 86400000).toISOString().slice(0, 10)
  if (iso === today) return 'Today'
  if (iso === tomorrow) return 'Tomorrow'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export const isOverdue = (iso: string | null) => Boolean(iso && iso < todayISO())
