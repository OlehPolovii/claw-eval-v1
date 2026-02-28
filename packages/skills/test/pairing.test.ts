import { describe, expect, it } from "vitest";
import { isPairingCodeValid } from "../src/skills/pairing.js";

describe("pairing", () => {
  const createdAt = 1_000_000;
  const tenMinutesMs = 10 * 60 * 1000;
  const toleranceMs = 15 * 1000;

  it("is valid within 10 minutes", () => {
    const nowMs = createdAt + tenMinutesMs;
    expect(isPairingCodeValid({ code: "1234", createdAt }, nowMs)).toBe(true);
  });

  it("is valid within 15s negative tolerance (clock skew)", () => {
    const nowMs = createdAt - toleranceMs;
    expect(isPairingCodeValid({ code: "1234", createdAt }, nowMs)).toBe(true);
  });

  it("is valid within 15s positive tolerance", () => {
    const nowMs = createdAt + tenMinutesMs + toleranceMs;
    expect(isPairingCodeValid({ code: "1234", createdAt }, nowMs)).toBe(true);
  });

  it("expires after 10 minutes + 15s tolerance", () => {
    const nowMs = createdAt + tenMinutesMs + toleranceMs + 1;
    expect(isPairingCodeValid({ code: "1234", createdAt }, nowMs)).toBe(false);
  });

  it("is invalid before createdAt - 15s tolerance", () => {
    const nowMs = createdAt - toleranceMs - 1;
    expect(isPairingCodeValid({ code: "1234", createdAt }, nowMs)).toBe(false);
  });
});
