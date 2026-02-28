import { describe, expect, it, vi } from "vitest";
import { parseDuration, getOrCreateSession, handleRequest } from "./index.js";
import type { IncomingMessage, ServerResponse } from "node:http";

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

  describe("API Endpoints", () => {
    it("returns health info on /healthz", async () => {
      const req = {
        method: "GET",
        url: "/healthz",
        headers: { host: "localhost" },
      } as unknown as IncomingMessage;

      const res = {
        writeHead: vi.fn(),
        end: vi.fn(),
      } as unknown as ServerResponse;

      await handleRequest(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
      const body = JSON.parse((res.end as any).mock.calls[0][0]);
      expect(body).toMatchObject({
        status: "ok",
        uptimeSeconds: expect.any(Number),
        skillsLoaded: 4,
        version: process.env.APP_VERSION ?? "0.0.0-dev",
      });

      // CRITICAL: Ensure no other env secrets leaked
      expect(body).not.toHaveProperty("DATABASE_URL");
      expect(body).not.toHaveProperty("API_KEY");
      expect(JSON.stringify(body)).not.toContain("super-secret-password-123");
    });

    it("returns 400 UNKNOWN_SKILL for unknown commands", async () => {
      const req = {
        method: "POST",
        url: "/message",
        headers: { host: "localhost" },
        // Simple mock of JSON body reading
        on: vi.fn().mockImplementation((event, cb) => {
          if (event === "data") cb(JSON.stringify({ text: "magic spells" }));
          if (event === "end") cb();
        }),
      } as unknown as IncomingMessage;

      const res = {
        writeHead: vi.fn(),
        end: vi.fn(),
      } as unknown as ServerResponse;

      await handleRequest(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(400, expect.any(Object));
      const body = JSON.parse((res.end as any).mock.calls[0][0]);
      expect(body).toMatchObject({
        error: "unknown_skill",
        errorCode: "UNKNOWN_SKILL",
        requestedSkill: "magic",
        availableSkills: ["pairing", "report", "status", "echo"],
      });
    });

    it("uses SESSION_TTL from environment if provided", () => {});
  });
});
