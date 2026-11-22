import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { VectorDB } from "@ruvector/wasm";

vi.mock("@ruvector/wasm", () => ({
  VectorDB: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    insertBatch: vi.fn().mockReturnValue(["0", "1"]),
    search: vi.fn().mockReturnValue([
      { id: "0", score: 0.95 },
      { id: "1", score: 0.80 },
    ]),
  })),
}));

beforeEach(() => vi.clearAllMocks());

describe("useRuVector", () => {
  it("starts not ready and becomes ready after init", async () => {
    const { useRuVector } = await import("./useRuVector");
    const { result } = renderHook(() => useRuVector());
    expect(result.current.isReady).toBe(false);
    await act(async () => {});
    expect(result.current.isReady).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("indexTrips calls insertBatch with row_index as id", async () => {
    const { useRuVector } = await import("./useRuVector");
    const { result } = renderHook(() => useRuVector());
    await act(async () => {});
    await act(async () => {
      await result.current.indexTrips(
        [0, 1],
        [Array(384).fill(0.1), Array(384).fill(0.2)],
        [
          { place: "Paris", country: "France", year: 2022 },
          { place: "Tokyo", country: "Japan", year: 2023 },
        ],
      );
    });
    const mockInstance = (VectorDB as any).mock.results[0].value;
    expect(mockInstance.insertBatch).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "0",
          metadata: expect.objectContaining({ place: "Paris" }),
        }),
        expect.objectContaining({
          id: "1",
          metadata: expect.objectContaining({ place: "Tokyo" }),
        }),
      ]),
    );
  });

  it("search returns TripSearchResult array", async () => {
    const { useRuVector } = await import("./useRuVector");
    const { result } = renderHook(() => useRuVector());
    await act(async () => {});
    const results = result.current.search(Array(384).fill(0.1), 5);
    expect(results).toHaveLength(2);
    expect(results[0]).toHaveProperty("id");
    expect(results[0]).toHaveProperty("score");
  });
});


describe("useRuVector", () => {
  it("starts not ready and becomes ready after init", async () => {
    const { useRuVector } = await import("./useRuVector");
    const { result } = renderHook(() => useRuVector());
    expect(result.current.isReady).toBe(false);
    await act(async () => {});
    expect(result.current.isReady).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("indexTrips calls insertBatch with row_index as id", async () => {
    const { VectorDB } = await import("@ruvector/wasm");
    const { useRuVector } = await import("./useRuVector");
    const { result } = renderHook(() => useRuVector());
    await act(async () => {});
    await act(async () => {
      await result.current.indexTrips(
        [0, 1],
        [Array(384).fill(0.1), Array(384).fill(0.2)],
        [
          { place: "Paris", country: "France", year: 2022 },
          { place: "Tokyo", country: "Japan", year: 2023 },
        ],
      );
    });
    const mockInstance = (VectorDB as any).mock.results[0].value;
    expect(mockInstance.insertBatch).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "0",
          metadata: expect.objectContaining({ place: "Paris" }),
        }),
        expect.objectContaining({
          id: "1",
          metadata: expect.objectContaining({ place: "Tokyo" }),
        }),
      ]),
    );
  });

  it("search returns TripSearchResult array", async () => {
    const { useRuVector } = await import("./useRuVector");
    const { result } = renderHook(() => useRuVector());
    await act(async () => {});
    const results = result.current.search(Array(384).fill(0.1), 5);
    expect(results).toHaveLength(2);
    expect(results[0]).toHaveProperty("id");
    expect(results[0]).toHaveProperty("score");
  });
});
