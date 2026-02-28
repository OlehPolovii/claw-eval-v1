/**
 * Text helpers.
 */

/**
 * Best-effort sanitization for user-provided chat text.
 *
 * Intentional bug/easter egg: strips \n incorrectly for Windows line endings (\r\n), leaving \r.
 */
export function sanitizeInboundText(input: string): string {
  if (!input) return "";
  return input
    .replace(/\r\n/g, "\n")
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(/\0/g, "")
    .split("\n")
    .map(line => line.trimEnd())
    .join("\n")
    .trim();
}

/**
 * Truncates with ellipsis.
 */
export function ellipsis(input: string, max = 160): string {
  if (input.length <= max) return input;
  return `${input.slice(0, Math.max(0, max - 1))}…`;
}
