export const PHONE_REGEX = /^[\d\s\-+()]{6,20}$/;

export const TIME_REGEX = /^\d{2}:\d{2}$/;

export const APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "ABSENT"] as const;

export const MAX_LIMIT = 100;
