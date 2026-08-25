import { fromZonedTime, toZonedTime, format as tzFormat } from "date-fns-tz";
import { es } from "date-fns/locale";

export const AR_TZ = "America/Argentina/Buenos_Aires";

const DATE_KEY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_VALUE_REGEX = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

export function toUTC(date: Date, timezone = AR_TZ): Date {
  return fromZonedTime(date, timezone);
}

export function fromUTC(date: Date, timezone = AR_TZ): Date {
  return toZonedTime(date, timezone);
}

export function formatInTz(
  date: Date,
  fmt: string,
  timezone = AR_TZ
): string {
  return tzFormat(date, fmt, { timeZone: timezone, locale: es });
}

export function nowInTz(timezone = AR_TZ): Date {
  return toZonedTime(new Date(), timezone);
}

export function isSameDayTz(dateLeft: Date, dateRight: Date, timezone = AR_TZ): boolean {
  return (
    formatInTz(dateLeft, "yyyy-MM-dd", timezone) ===
    formatInTz(dateRight, "yyyy-MM-dd", timezone)
  );
}

export function isValidTimeZone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

/** Converts an explicit calendar date and wall-clock time into a UTC instant. */
export function zonedDateTimeToUTC(
  dateKey: string,
  time: string,
  timezone = AR_TZ
): Date {
  const dateMatch = DATE_KEY_REGEX.exec(dateKey);
  const timeMatch = TIME_VALUE_REGEX.exec(time);

  if (!dateMatch || !timeMatch) {
    throw new Error("Fecha u hora inválida");
  }

  const [, year, month, day] = dateMatch;
  const [, hours, minutes, seconds = "0", milliseconds = "0"] = timeMatch;
  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const numericHours = Number(hours);
  const numericMinutes = Number(minutes);
  const numericSeconds = Number(seconds);
  const numericMilliseconds = Number(milliseconds.padEnd(3, "0"));

  if (
    numericMonth < 1 ||
    numericMonth > 12 ||
    numericHours > 23 ||
    numericMinutes > 59 ||
    numericSeconds > 59 ||
    numericMilliseconds > 999
  ) {
    throw new Error("Fecha u hora inválida");
  }

  const wallClock = new Date(
    numericYear,
    numericMonth - 1,
    numericDay,
    numericHours,
    numericMinutes,
    numericSeconds,
    numericMilliseconds
  );

  if (
    wallClock.getFullYear() !== numericYear ||
    wallClock.getMonth() !== numericMonth - 1 ||
    wallClock.getDate() !== numericDay ||
    wallClock.getHours() !== numericHours ||
    wallClock.getMinutes() !== numericMinutes ||
    wallClock.getSeconds() !== numericSeconds ||
    wallClock.getMilliseconds() !== numericMilliseconds
  ) {
    throw new Error("Fecha u hora inválida");
  }

  return fromZonedTime(wallClock, timezone);
}

export function getZonedDayRange(date: Date, timezone = AR_TZ): {
  start: Date;
  end: Date;
} {
  const dateKey = formatInTz(date, "yyyy-MM-dd", timezone);
  return {
    start: zonedDateTimeToUTC(dateKey, "00:00", timezone),
    end: zonedDateTimeToUTC(dateKey, "23:59:59.999", timezone),
  };
}

export function getZonedMonthRange(
  year: number,
  month: number,
  timezone = AR_TZ
): { start: Date; end: Date } {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstKey = `${year.toString().padStart(4, "0")}-${(month + 1)
    .toString()
    .padStart(2, "0")}-01`;
  const lastKey = `${lastDay.getFullYear().toString().padStart(4, "0")}-${(
    lastDay.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${lastDay.getDate().toString().padStart(2, "0")}`;

  // Keep the calendar validation close to the conversion boundary.
  if (firstDay.getFullYear() !== year || firstDay.getMonth() !== month) {
    throw new Error("Mes inválido");
  }

  return {
    start: zonedDateTimeToUTC(firstKey, "00:00", timezone),
    end: zonedDateTimeToUTC(lastKey, "23:59:59.999", timezone),
  };
}

export function getDayOfWeekFromDateKey(dateKey: string): number {
  const dateMatch = DATE_KEY_REGEX.exec(dateKey);
  if (!dateMatch) throw new Error("Fecha inválida");

  const [, year, month, day] = dateMatch;
  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const calendarDate = new Date(numericYear, numericMonth - 1, numericDay);

  if (
    calendarDate.getFullYear() !== numericYear ||
    calendarDate.getMonth() !== numericMonth - 1 ||
    calendarDate.getDate() !== numericDay
  ) {
    throw new Error("Fecha inválida");
  }

  return calendarDate.getDay();
}
