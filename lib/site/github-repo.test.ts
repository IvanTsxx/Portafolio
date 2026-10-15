import { afterEach, describe, expect, spyOn, test } from "bun:test";

import { siteConfig } from "@/lib/site/config";

import { formatStarCount, fetchRepoStars } from "./github-repo";

const originalToken = process.env.GITHUB_TOKEN;

const stubFetch = () => spyOn(globalThis, "fetch");

const lastRequest = (stub: ReturnType<typeof stubFetch>) => {
  const [input, init] = stub.mock.calls.at(-1) ?? [];
  return { headers: new Headers(init?.headers), url: String(input) };
};

afterEach(() => {
  if (originalToken === undefined) {
    delete process.env.GITHUB_TOKEN;
  } else {
    process.env.GITHUB_TOKEN = originalToken;
  }
});

describe("fetchRepoStars", () => {
  test("reads the star count of the configured repository", async () => {
    delete process.env.GITHUB_TOKEN;
    const fetchStub = stubFetch().mockResolvedValue(
      Response.json({ stargazers_count: 42 })
    );

    expect(await fetchRepoStars()).toBe(42);
    expect(lastRequest(fetchStub).url).toBe(
      `https://api.github.com/repos/${siteConfig.repository}`
    );
    fetchStub.mockRestore();
  });

  test("authenticates only when a token is present", async () => {
    const fetchStub = stubFetch()
      .mockResolvedValueOnce(Response.json({ stargazers_count: 1 }))
      .mockResolvedValueOnce(Response.json({ stargazers_count: 1 }));

    process.env.GITHUB_TOKEN = "token-for-test";
    await fetchRepoStars();
    expect(lastRequest(fetchStub).headers.get("authorization")).toBe(
      "Bearer token-for-test"
    );

    delete process.env.GITHUB_TOKEN;
    await fetchRepoStars();
    expect(lastRequest(fetchStub).headers.get("authorization")).toBeNull();
    fetchStub.mockRestore();
  });

  test("returns null when GitHub answers with an error status", async () => {
    const fetchStub = stubFetch().mockResolvedValue(
      new Response("rate limited", { status: 403 })
    );

    expect(await fetchRepoStars()).toBeNull();
    fetchStub.mockRestore();
  });

  test("returns null when the payload has no valid star count", async () => {
    const fetchStub = stubFetch().mockResolvedValue(
      Response.json({ stargazers_count: "many" })
    );

    expect(await fetchRepoStars()).toBeNull();
    fetchStub.mockRestore();
  });

  test("returns null when the request fails", async () => {
    const fetchStub = stubFetch().mockRejectedValue(new Error("offline"));

    expect(await fetchRepoStars()).toBeNull();
    fetchStub.mockRestore();
  });
});

describe("formatStarCount", () => {
  test("keeps small counts exact and compacts thousands", () => {
    expect(formatStarCount(0)).toBe("0");
    expect(formatStarCount(7)).toBe("7");
    expect(formatStarCount(999)).toBe("999");
    expect(formatStarCount(1234)).toBe("1.2K");
  });
});
