import { describe, it, expect } from "vitest";
import { performPCA, performKMeans } from "../workers/clustering-fns.js";

describe("performPCA", () => {
  it("reduces 4-dim data to 2 dims", () => {
    const features = Array.from({ length: 10 }, (_, i) =>
      [1 + i * 0.1, 2 + i * 0.2, 3 - i * 0.1, 4 + i * 0.05],
    );
    const result = performPCA(features, 2);
    expect(result).toHaveLength(10);
    expect(result[0]).toHaveLength(2);
  });

  it("handles single-point input without throwing", () => {
    const result = performPCA([[1, 2, 3]], 2);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
  });

  it("returns finite numbers for all output values", () => {
    const features = Array.from({ length: 5 }, (_, i) => [i, i * 2, i * 3]);
    const result = performPCA(features, 2);
    for (const row of result) {
      for (const val of row) {
        expect(Number.isFinite(val)).toBe(true);
      }
    }
  });
});

describe("performKMeans k-clamping", () => {
  it("clamps numClusters to number of points", () => {
    const features = [
      [1, 0],
      [2, 0],
      [3, 0],
    ]; // 3 points
    const result = performKMeans(features, { numClusters: 8 });
    const uniqueClusters = new Set(result.clusters).size;
    expect(uniqueClusters).toBeLessThanOrEqual(3);
  });

  it("handles numClusters equal to number of points", () => {
    const features = [
      [0, 0],
      [10, 0],
    ];
    const result = performKMeans(features, { numClusters: 2 });
    expect(result.clusters).toHaveLength(2);
  });
});
