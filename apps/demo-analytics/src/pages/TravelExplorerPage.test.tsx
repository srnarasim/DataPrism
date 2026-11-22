import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../contexts/DataPrismContext", () => ({
  useDataPrism: () => ({
    engine: {},
    isInitialized: true,
    loadData: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue({ data: [] }),
  }),
}));
vi.mock("../utils/embeddings", () => ({
  embed: vi.fn().mockResolvedValue([Array(384).fill(0.1)]),
}));
vi.mock("../hooks/useRuVector", () => ({
  useRuVector: () => ({
    isReady: true,
    error: null,
    indexTrips: vi.fn().mockResolvedValue(undefined),
    search: vi.fn().mockReturnValue([{ id: "0", score: 0.9 }]),
  }),
}));

beforeEach(() => vi.clearAllMocks());

describe("TravelExplorerPage", () => {
  it("renders all three panel headings", async () => {
    const { TravelExplorerPage } = await import("./TravelExplorerPage");
    render(<TravelExplorerPage />);
    expect(screen.getByText(/load your trips/i)).toBeInTheDocument();
    expect(screen.getByText(/semantic search/i)).toBeInTheDocument();
    expect(screen.getByText(/cluster view/i)).toBeInTheDocument();
  });

  it("shows error when search submitted before data loaded", async () => {
    const { TravelExplorerPage } = await import("./TravelExplorerPage");
    render(<TravelExplorerPage />);
    const searchBtn = screen.getByRole("button", { name: /search/i });
    await userEvent.click(searchBtn);
    expect(screen.getByText(/load data first/i)).toBeInTheDocument();
  });

  it("validateCsvColumns throws when notes column is missing", async () => {
    const { validateCsvColumns } = await import("./TravelExplorerPage");
    expect(() => validateCsvColumns(["place", "country", "year"])).toThrow(/notes/i);
  });
});
