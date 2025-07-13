import { describe, it, expect } from "vitest";
import { DataUtils } from "../../src/shared/data-utils.js";
import { Dataset, DataType } from "@dataprism/plugins";

describe("DataUtils", () => {
  const sampleDataset: Dataset = {
    columns: [
      { name: "id", type: "integer" as DataType },
      { name: "name", type: "string" as DataType },
      { name: "age", type: "number" as DataType },
      { name: "active", type: "boolean" as DataType },
    ],
    rows: [
      [1, "Alice", 25, true],
      [2, "Bob", 30, false],
      [3, "Charlie", 35, true],
      [4, null, 28, false],
      [5, "Eve", null, true],
    ],
  };

  describe("inferDataTypes", () => {
    it("should infer correct data types from samples", () => {
      const samples = [
        ["1", "Alice", "25", "true"],
        ["2", "Bob", "30", "false"],
        ["3", "Charlie", "35", "true"],
      ];
      const headers = ["id", "name", "age", "active"];

      const results = DataUtils.inferDataTypes(samples, headers);

      expect(results).toHaveLength(4);
      expect(results[0].suggestedType).toBe("integer");
      expect(results[1].suggestedType).toBe("string");
      expect(results[2].suggestedType).toBe("integer");
      expect(results[3].suggestedType).toBe("boolean");
    });

    it("should handle mixed numeric types", () => {
      const samples = [
        ["1.5", "2.7", "3"],
        ["4.2", "5.1", "6"],
        ["7.8", "8.9", "9"],
      ];
      const headers = ["decimal1", "decimal2", "integer"];

      const results = DataUtils.inferDataTypes(samples, headers);

      expect(results[0].suggestedType).toBe("number");
      expect(results[1].suggestedType).toBe("number");
      expect(results[2].suggestedType).toBe("integer");
    });
  });

  describe("validateDataset", () => {
    it("should validate a clean dataset", () => {
      const cleanDataset: Dataset = {
        columns: [
          { name: "id", type: "integer" as DataType },
          { name: "name", type: "string" as DataType },
        ],
        rows: [
          [1, "Alice"],
          [2, "Bob"],
          [3, "Charlie"],
        ],
      };

      const result = DataUtils.validateDataset(cleanDataset);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.rowCount).toBe(3);
      expect(result.columnCount).toBe(2);
      expect(result.nullCount).toBe(0);
    });

    it("should detect validation issues", () => {
      const result = DataUtils.validateDataset(sampleDataset);

      expect(result.rowCount).toBe(5);
      expect(result.columnCount).toBe(4);
      expect(result.nullCount).toBe(2); // Two null values
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("should reject empty datasets", () => {
      const emptyDataset: Dataset = {
        columns: [],
        rows: [],
      };

      const result = DataUtils.validateDataset(emptyDataset);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Dataset is empty");
    });
  });

  describe("generateStatistics", () => {
    it("should generate statistics for all columns", () => {
      const stats = DataUtils.generateStatistics(sampleDataset);

      expect(stats).toHaveLength(4);

      // Check ID column statistics
      const idStats = stats.find((s) => s.columnName === "id");
      expect(idStats).toBeDefined();
      expect(idStats!.dataType).toBe("integer");
      expect(idStats!.nullCount).toBe(0);
      expect(idStats!.uniqueCount).toBe(5);
      expect(idStats!.min).toBe(1);
      expect(idStats!.max).toBe(5);

      // Check age column statistics (has nulls)
      const ageStats = stats.find((s) => s.columnName === "age");
      expect(ageStats).toBeDefined();
      expect(ageStats!.nullCount).toBe(1);
      expect(ageStats!.min).toBe(25);
      expect(ageStats!.max).toBe(35);
    });
  });

  describe("toCsv", () => {
    it("should convert dataset to CSV format", () => {
      const csv = DataUtils.toCsv(sampleDataset);
      const lines = csv.split("\n");

      expect(lines[0]).toBe("id,name,age,active");
      expect(lines[1]).toBe("1,Alice,25,true");
      expect(lines[2]).toBe("2,Bob,30,false");
      expect(lines.length).toBe(6); // Header + 5 data rows
    });

    it("should handle CSV escaping", () => {
      const datasetWithCommas: Dataset = {
        columns: [{ name: "description", type: "string" as DataType }],
        rows: [
          ["Text with, comma"],
          ['Text with "quotes"'],
          ["Text with\nnewline"],
        ],
      };

      const csv = DataUtils.toCsv(datasetWithCommas);
      const lines = csv.split("\n");

      expect(lines[1]).toBe('"Text with, comma"');
      expect(lines[2]).toBe('"Text with ""quotes"""');
      expect(lines[3]).toBe('"Text with\nnewline"');
    });
  });

  describe("sampleRows", () => {
    it("should sample first N rows", () => {
      const sampled = DataUtils.sampleRows(sampleDataset, 3, "first");

      expect(sampled.rows).toHaveLength(3);
      expect(sampled.columns).toEqual(sampleDataset.columns);
      expect(sampled.rows[0]).toEqual(sampleDataset.rows[0]);
    });

    it("should sample random rows", () => {
      const sampled = DataUtils.sampleRows(sampleDataset, 3, "random");

      expect(sampled.rows).toHaveLength(3);
      expect(sampled.columns).toEqual(sampleDataset.columns);
      // Can't test exact content due to randomness, but verify structure
    });

    it("should handle sampling more rows than available", () => {
      const sampled = DataUtils.sampleRows(sampleDataset, 10, "first");

      expect(sampled.rows).toHaveLength(5); // Original dataset size
    });
  });
});
