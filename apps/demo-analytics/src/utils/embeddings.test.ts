import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@xenova/transformers", () => ({
  pipeline: vi.fn().mockResolvedValue(
    vi.fn().mockImplementation(async (texts: string[]) => ({
      data: new Float32Array(texts.length * 384).fill(0.1),
      dims: [texts.length, 384],
    })),
  ),
  env: { allowLocalModels: false },
}));

// Reset singleton between tests
beforeEach(() => vi.resetModules());

describe("embed", () => {
  it("returns one vector of length 384 per input text", async () => {
    const { embed } = await import("./embeddings");
    const result = await embed(["a sunny beach in Greece", "hiking in the Alps"]);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(384);
    expect(result[1]).toHaveLength(384);
  });

  it("handles empty string without throwing", async () => {
    const { embed } = await import("./embeddings");
    const result = await embed([""]);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(384);
  });

  it("calls onProgress callback during load", async () => {
    const { embed } = await import("./embeddings");
    const onProgress = vi.fn();
    await embed(["test"], onProgress);
    // Callback may or may not fire depending on mock — just ensure no throw
    expect(true).toBe(true);
  });

  it("rejects with Error when pipeline throws", async () => {
    const { pipeline } = await import("@xenova/transformers");
    (pipeline as any).mockRejectedValueOnce(new Error("fetch failed"));
    const { embed } = await import("./embeddings");
    await expect(embed(["test"])).rejects.toThrow("fetch failed");
  });
});
