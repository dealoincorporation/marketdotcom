/**
 * Parse the start time from a time slot string like "9:00 AM - 12:00 PM".
 * Returns { hours, minutes } in 24h format, or null if parsing fails.
 */
export function parseTimeSlotStart(timeSlot: string): { hours: number; minutes: number } | null {
  const firstPart = timeSlot.split(/\s*-\s*/)[0]?.trim() || timeSlot
  const match = firstPart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return null
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = (match[3] || '').toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return { hours, minutes }
}

/**
 * For a slot on a given date with a timeSlot string, get the slot start as a Date (local).
 * Used to check if the slot has already passed (e.g. for "today").
 */
export function getSlotStartDateTime(slotDate: Date, timeSlot: string): Date | null {
  const parsed = parseTimeSlotStart(timeSlot)
  if (!parsed) return null
  const d = new Date(slotDate)
  d.setHours(parsed.hours, parsed.minutes, 0, 0)
  return d
}

/**
 * Return true if this slot is for "today" (same calendar day as now) and the slot's start time has already passed.
 */
export function isSlotStartInPast(slotDate: Date, timeSlot: string, now: Date = new Date()): boolean {
  const slotStart = getSlotStartDateTime(slotDate, timeSlot)
  if (!slotStart) return false
  return slotStart.getTime() <= now.getTime()
}

/**
 * Return true if slot is for today (same calendar day as now) in local time.
 */
export function isSlotDateToday(slotDate: Date, now: Date = new Date()): boolean {
  return (
    slotDate.getFullYear() === now.getFullYear() &&
    slotDate.getMonth() === now.getMonth() &&
    slotDate.getDate() === now.getDate()
  )
}
