export type Channel = "telegram" | "whatsapp" | "slack" | "webchat";

export interface MessageContext {
  channel: Channel;
  sender: string; // channel-specific sender id
  text: string;
  timestampMs: number;
  history?: {
    createdAt: number;
    messages: Array<{ from: string; text: string; at: number }>;
  };
}

export interface SkillResult {
  text: string;
  tags?: string[];
}

export interface Skill {
  name: string;
  description: string;
  run(ctx: MessageContext): Promise<SkillResult>;
}
