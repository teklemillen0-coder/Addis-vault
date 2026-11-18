import { describe, expect, it } from "vitest";
import { getChatModerationReason } from "../utils/chatModeration";

describe("chat moderation", () => {
  it("blocks self-harm, violence, hate, and abusive language", () => {
    expect(getChatModerationReason("I want to kill myself")).toBe("self_harm");
    expect(getChatModerationReason("I will attack you")).toBe("violence");
    expect(getChatModerationReason("I hate those people")).toBe("hate_or_abuse");
    expect(getChatModerationReason("you are an asshole")).toBe("hate_or_abuse");
  });

  it("allows ordinary community messages", () => {
    expect(
      getChatModerationReason("Can someone share the school application deadline?"),
    ).toBeNull();
  });
});
