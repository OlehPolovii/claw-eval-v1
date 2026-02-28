import { describe, expect, it } from "vitest";
import { sanitizeInboundText } from "../src/text.js";

describe("text sanitization", () => {
  it("converts CRLF to LF", () => {
    expect(sanitizeInboundText("hello\r\nworld")).toBe("hello\nworld");
  });

  it("replaces Unicode separators with LF", () => {
    expect(sanitizeInboundText("line1\u2028line2\u2029line3")).toBe(
      "line1\nline2\nline3"
    );
  });

  it("trims trailing whitespace per line", () => {
    // Note: the final trim() might remove trailing newlines of the whole block too
    expect(sanitizeInboundText("line1   \nline2 \t")).toBe("line1\nline2");
  });

  it("handles mixed inputs", () => {
    const input = "  start  \r\n  middle \u2028  end   ";
    // Expected:
    // "  start" + \n
    // "  middle" + \n
    // "  end"
    // Leading space on lines should be preserved based on "Trim trailing whitespace per line"
    // but the final trim() will remove the very first and very last whitespace.
    expect(sanitizeInboundText(input)).toBe("start\n  middle\n  end");
  });
});
