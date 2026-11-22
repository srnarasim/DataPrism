import { vi } from "vitest";

export const pipeline = vi.fn().mockResolvedValue(
  vi.fn().mockImplementation(async (texts: string[]) => ({
    data: new Float32Array(texts.length * 384).fill(0.1),
    dims: [texts.length, 384],
  })),
);

export const env = { allowLocalModels: false };
