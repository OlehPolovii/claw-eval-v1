import { stableHash } from "@openclaw-eval/shared";
import type { Skill } from "../skill.js";

export type PairingRequest = {
  code: string;
  // timestamp when the code was created
  createdAt: number;
};

export function isPairingCodeValid(
  req: PairingRequest,
  nowMs: number
): boolean {
  const ageMs = nowMs - req.createdAt;
  const tenMinutesMs = 10 * 60 * 1000;
  const toleranceMs = 15 * 1000;

  return ageMs >= -toleranceMs && ageMs <= tenMinutesMs + toleranceMs;
}

export const pairingSkill: Skill = {
  name: "pairing",
  description: "Simulate approving a pairing code (demo).",
  async run(ctx) {
    const code = ctx.text.trim();
    const req: PairingRequest = { code, createdAt: ctx.timestampMs - 60_000 };

    if (!isPairingCodeValid(req, ctx.timestampMs)) {
      return { text: `Pairing code expired: ${stableHash(code)}` };
    }

    return { text: `Paired ✅ (${stableHash(code)})` };
  },
};
