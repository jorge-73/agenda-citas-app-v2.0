import { fromZonedTime, toZonedTime, format as tzFormat } from "date-fns-tz";
import { isSameDay as dfIsSameDay } from "date-fns";
import { es } from "date-fns/locale";

export const AR_TZ = "America/Argentina/Buenos_Aires";

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
  return fromZonedTime(new Date(), timezone);
}

export function isSameDayTz(dateLeft: Date, dateRight: Date, timezone = AR_TZ): boolean {
  const left = fromZonedTime(dateLeft, timezone);
  const right = fromZonedTime(dateRight, timezone);
  return dfIsSameDay(left, right);
}
