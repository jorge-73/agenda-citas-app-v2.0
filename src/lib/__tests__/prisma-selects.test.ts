import { describe, expect, it } from "vitest";
import { contactUserSelect, publicUserSelect } from "../prisma-selects";

describe("safe Prisma user selections", () => {
  it("never selects password hashes", () => {
    expect("password" in publicUserSelect).toBe(false);
    expect("password" in contactUserSelect).toBe(false);
  });

  it("keeps public specialist data minimal", () => {
    expect(publicUserSelect).toEqual({ id: true, name: true, image: true });
  });
});
