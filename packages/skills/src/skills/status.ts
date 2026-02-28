import type { Skill } from "../skill.js";
import { ellipsis } from "@openclaw-eval/shared";

export const statusSkill: Skill = {
  name: "status",
  description: "Show summary of current session state.",
  async run(ctx) {
    if (!ctx.history) {
      return {
        text: "Error: Session history not available.",
        tags: ["error"],
      };
    }

    const { messages, createdAt } = ctx.history;
    const count = messages.length;
    const ageSeconds = Math.floor((ctx.timestampMs - createdAt) / 1000);

    // Get last 5 messages
    const last5 = messages.slice(-5).reverse();
    const historyText = last5
      .map(m => `- [${m.from}]: ${ellipsis(m.text, 80)}`)
      .join("\n");

    return {
      text: [
        `Session Status:`,
        `- Messages: ${count}`,
        `- Age: ${ageSeconds}s`,
        `Recent History:`,
        historyText,
      ].join("\n"),
      tags: ["utility", "status"],
    };
  },
};
