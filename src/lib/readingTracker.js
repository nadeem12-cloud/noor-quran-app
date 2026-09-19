/**
 * Helpers for daily reading streak calculation, 7-day activity tracking,
 * and Quran reading habits.
 */

export const TOTAL_QURAN_VERSES = 6236;

/**
 * Format Date to "YYYY-MM-DD" in local time.
 * @param {Date} [date]
 * @returns {string}
 */
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculate current streak and longest streak from an array of reading log dates.
 * @param {Array<{date: string, count: number}>} logs
 * @returns {{ currentStreak: number, longestStreak: number, todayVerses: number }}
 */
export function calculateStreak(logs = []) {
  if (!logs || logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0, todayVerses: 0 };
  }

  const logMap = new Map(logs.map((l) => [l.date, l.count || 0]));
  const todayStr = getLocalDateString();
  const todayVerses = logMap.get(todayStr) || 0;

  // Calculate current streak backward from today (or yesterday if haven't read yet today)
  let currentStreak = 0;
  const checkDate = new Date();

  // If read today, streak includes today. If not read today, check if read yesterday.
  const readToday = (logMap.get(todayStr) || 0) > 0;
  if (!readToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = getLocalDateString(checkDate);
    const count = logMap.get(dStr) || 0;
    if (count > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak across all history
  const sortedDates = Array.from(logMap.keys())
    .filter((d) => (logMap.get(d) || 0) > 0)
    .sort();

  let longestStreak = 0;
  let running = 0;
  let prevDate = null;

  for (const dateStr of sortedDates) {
    const curr = new Date(dateStr + "T00:00:00");
    if (!prevDate) {
      running = 1;
    } else {
      const diffDays = Math.round((curr - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    if (running > longestStreak) {
      longestStreak = running;
    }
    prevDate = curr;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    todayVerses,
  };
}

/**
 * Returns activity array for the last 7 days (ending today).
 * @param {Array<{date: string, count: number}>} logs
 * @returns {Array<{ dayName: string, dateStr: string, isToday: boolean, completed: boolean, count: number }>}
 */
export function get7DayActivity(logs = []) {
  const logMap = new Map(logs.map((l) => [l.date, l.count || 0]));
  const todayStr = getLocalDateString();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const count = logMap.get(dateStr) || 0;

    result.push({
      dayName: dayNames[d.getDay()],
      dateStr,
      isToday: dateStr === todayStr,
      completed: count > 0,
      count,
    });
  }

  return result;
}
