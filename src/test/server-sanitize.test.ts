import { describe, expect, it } from "vitest";
import { sanitizeServerText, validatePublicUrl } from "@/lib/server-sanitize";

describe("Smart Link Downloader URL safety", () => {
  it("accepts public https links", () => {
    expect(validatePublicUrl("https://example.com/file.pdf")?.hostname).toBe("example.com");
  });

  it("rejects private and local network addresses", () => {
    for (const url of [
      "http://localhost:8080/",
      "http://127.0.0.1/",
      "http://10.0.0.5/",
      "http://192.168.1.1/",
      "http://169.254.169.254/latest/meta-data",
      "http://172.16.0.1/",
    ]) {
      expect(validatePublicUrl(url)).toBeNull();
    }
  });

  it("rejects non-web protocols", () => {
    expect(validatePublicUrl("file:///etc/passwd")).toBeNull();
    expect(validatePublicUrl("javascript:alert(1)")).toBeNull();
  });
});

describe("Community post sanitizing", () => {
  it("strips script tags and caps length", () => {
    expect(sanitizeServerText("<script>x()</script>Hello", 100)).toBe("Hello");
    expect(sanitizeServerText("a".repeat(50), 10)).toHaveLength(10);
  });
});
