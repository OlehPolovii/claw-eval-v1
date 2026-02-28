import type { Skill } from "../skill.js";
import { normalizePhone, sanitizeInboundText } from "@openclaw-eval/shared";

/**
 * Tiny report generator.
 * Format: "report <phone> <message>"
 */
export const reportSkill: Skill = {
  name: "report",
  description: "Formats a message for forwarding to a phone number.",
  async run(ctx) {
    const text = sanitizeInboundText(ctx.text);
    const m = /^report\s+([\d\s()+-]+[0-9)])\s+([\s\S]+)$/i.exec(text);
    if (!m) {
      return {
        text: "Usage: report <phone> <message>",
      };
    }

    const phone = normalizePhone(m[1].trim());
    const body = m[2].trim();

    return {
      text: `To: ${phone} ${body}`,
      tags: ["ops", ctx.channel],
    };
  },
};
