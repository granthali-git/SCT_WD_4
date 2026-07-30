/**
 * Lightweight natural language date parser for due dates.
 * Handles phrases like:
 * - "today", "tomorrow"
 * - "next monday", "next tuesday", etc. or "monday", "tuesday", etc.
 * - "in X days", "in X day"
 * - 12-hour times: "5pm", "5:30pm", "11am", "11:15 am"
 * - 24-hour times: "17:00", "09:30"
 *
 * Returns formatted ISO local datetime string "YYYY-MM-THH:mm" or null if unparsed.
 */

const WEEKDAYS = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thur: 4,
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

export function parseNaturalLanguageDate(inputStr) {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const raw = inputStr.trim().toLowerCase();
  if (!raw) return null;

  let str = raw;
  let parsedHour = null;
  let parsedMinute = null;
  let hasTime = false;

  // 1. Extract 12-hour time (e.g. 5pm, 5:30pm, 11am, 11:30 am)
  const time12Regex = /\b(1[0-2]|0?[1-9])(?::([0-5][0-9]))?\s*(am|pm)\b/;
  const match12 = str.match(time12Regex);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = match12[2] ? parseInt(match12[2], 10) : 0;
    const period = match12[3];

    if (period === 'pm' && h < 12) h += 12;
    if (period === 'am' && h === 12) h = 0;

    parsedHour = h;
    parsedMinute = m;
    hasTime = true;

    // Remove matched time expression
    str = str.replace(match12[0], '').trim();
  }

  // 2. Extract 24-hour time (e.g. 17:00, 09:30, 9:00) if 12-hour wasn't found
  if (!hasTime) {
    const time24Regex = /\b([01]?[0-9]|2[0-3]):([0-5][0-9])\b/;
    const match24 = str.match(time24Regex);
    if (match24) {
      parsedHour = parseInt(match24[1], 10);
      parsedMinute = parseInt(match24[2], 10);
      hasTime = true;

      str = str.replace(match24[0], '').trim();
    }
  }

  // Clean remaining text
  str = str.replace(/\s+/g, ' ').trim();

  let targetDate = new Date();
  let hasDate = false;

  // 3. Match Date Expressions
  if (str === 'today' || str === '') {
    hasDate = true;
  } else if (str === 'tomorrow') {
    targetDate.setDate(targetDate.getDate() + 1);
    hasDate = true;
  } else {
    // Check "in X days" / "in X day"
    const inDaysMatch = str.match(/^in\s+(\d+)\s+days?$/);
    if (inDaysMatch) {
      const daysToAdd = parseInt(inDaysMatch[1], 10);
      targetDate.setDate(targetDate.getDate() + daysToAdd);
      hasDate = true;
    } else {
      // Check "next [weekday]" or "[weekday]"
      const weekdayMatch = str.match(/^(?:next\s+)?(sunday|sun|monday|mon|tuesday|tue|tues|wednesday|wed|thursday|thu|thur|thurs|friday|fri|saturday|sat)$/);
      if (weekdayMatch) {
        const targetDay = WEEKDAYS[weekdayMatch[1]];
        if (targetDay !== undefined) {
          const currentDay = targetDate.getDay();
          let diff = targetDay - currentDay;
          if (diff <= 0) diff += 7;
          targetDate.setDate(targetDate.getDate() + diff);
          hasDate = true;
        }
      }
    }
  }

  // If neither date phrase nor time expression matched, return null
  if (!hasDate && !hasTime) {
    return null;
  }

  // If time was specified, set it; otherwise default to 17:00 (5:00 PM) if only date phrase was given
  if (hasTime) {
    targetDate.setHours(parsedHour, parsedMinute, 0, 0);
  } else {
    targetDate.setHours(17, 0, 0, 0);
  }

  // Format to local "YYYY-MM-THH:mm"
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
