/**
 * DailyVerseScheduler — deterministic, no state or storage needed.
 * Every device lands on the same verse on the same calendar day, and the
 * pool advances by one entry per day so it doesn't feel random/jumpy.
 */
export function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function pickVerseOfTheDay(pool, date = new Date()) {
  if (!pool || pool.length === 0) return null;
  const index = dayOfYear(date) % pool.length;
  return pool[index];
}

/** YYYY-MM-DD in the visitor's local time, used as a cache/display key. */
export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
