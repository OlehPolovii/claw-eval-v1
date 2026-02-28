import { describe, expect, it } from "vitest";
import { parseDuration, getOrCreateSession } from "./index.js";

describe("gateway", () => {
  describe("parseDuration", () => {
    it("parses seconds", () => {
      expect(parseDuration("10s")).toBe(10000);
    });
    it("parses minutes", () => {
      expect(parseDuration("5m")).toBe(300000);
    });
  });

  describe("session expiration", () => {
    it("expires session after TTL", () => {
      const start = 1000;
      const ttl = 10000; // 10s
      // We can't easily mock process.env here without more setup,
      // but we can test the function logic if we could pass TTL or if we rely on default.
      // Default is 30m = 1800000ms.

      const session = getOrCreateSession("test", "user", start);
      expect(session).not.toBeNull();

      // 30m + 1ms later
      const expired = getOrCreateSession(
        "test",
        "user",
        start + 30 * 60 * 1000 + 1
      );
      expect(expired).toBeNull();
    });

    it("updates lastSeenAt if not expired", () => {
      const start = 1000;
      const session = getOrCreateSession("test", "user2", start);
      const active = getOrCreateSession("test", "user2", start + 1000);
      expect(active).not.toBeNull();
      expect(active?.lastSeenAt).toBe(start + 1000);
    });
  });
});
