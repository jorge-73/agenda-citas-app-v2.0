export const PHONE_REGEX = /^[\d\s\-+()]{6,20}$/;

export const TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "ABSENT"] as const;

export const MAX_LIMIT = 100;
