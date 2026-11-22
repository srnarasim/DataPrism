import { describe, it, expect } from "vitest";
import { SemanticClusteringPlugin } from "../src/plugins/processing/semantic-clustering.js";
import type { ClusteringConfig } from "../src/plugins/processing/semantic-clustering.js";

describe("ClusteringConfig.precomputedEmbeddings", () => {
  it("accepts precomputedEmbeddings in ClusteringConfig type", () => {
    const config: ClusteringConfig = {
      algorithm: "kmeans",
      features: [],
      normalize: false,
      precomputedEmbeddings: [[0.1, 0.2], [0.3, 0.4]],
    };
    expect(config.precomputedEmbeddings).toHaveLength(2);
  });
});

describe("tooltip scoping", () => {
  it("showTooltip does not append to document.body", () => {
    const plugin = new SemanticClusteringPlugin();
    const container = document.createElement("div");
    document.body.appendChild(container);
    (plugin as any).container = container;
    (plugin as any).currentResult = { clusters: [0] };
    (plugin as any).showTooltip(
      { pageX: 0, pageY: 0 } as MouseEvent,
      { index: 0, label: "Paris" },
    );
    const bodyTooltips = document.querySelectorAll("body > .cluster-tooltip");
    expect(bodyTooltips).toHaveLength(0);
    const containerTooltips = container.querySelectorAll(".cluster-tooltip");
    expect(containerTooltips).toHaveLength(1);
    expect(containerTooltips[0].textContent).toContain("Paris");
    document.body.removeChild(container);
  });
});
