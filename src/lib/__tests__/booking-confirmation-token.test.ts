import { afterEach, describe, expect, it } from "vitest";
import {
  createBookingConfirmationToken,
  verifyBookingConfirmationToken,
} from "../booking-confirmation-token";

const originalSecret = process.env.AUTH_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.AUTH_SECRET;
  } else {
    process.env.AUTH_SECRET = originalSecret;
  }
});

describe("booking confirmation token", () => {
  it("round-trips a booking id with a server secret", () => {
    process.env.AUTH_SECRET = "test-secret-for-booking-confirmations";
    const token = createBookingConfirmationToken("booking_123");

    expect(verifyBookingConfirmationToken(token)).toBe("booking_123");
  });

  it("rejects a token modified by a client", () => {
    process.env.AUTH_SECRET = "test-secret-for-booking-confirmations";
    const token = createBookingConfirmationToken("booking_123");
    const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

    expect(verifyBookingConfirmationToken(tampered)).toBeNull();
  });
});
