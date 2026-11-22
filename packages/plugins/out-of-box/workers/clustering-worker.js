// Clustering Web Worker
// Handles CPU-intensive clustering operations via pure functions in clustering-fns.js.
// Worker message handler is registered only when running inside a Web Worker context.

import {
  performClustering,
  performPCA,
} from "./clustering-fns.js";

if (typeof self !== "undefined" && typeof self.postMessage === "function") {
  self.onmessage = function (event) {
    const { type, task } = event.data;

    if (type === "task") {
      try {
        let result;
        if (task.type === "dimensionality-reduction") {
          const reduced = performPCA(
            task.data.embeddings,
            task.data.config.dimensions || 2,
          );
          result = { reducedEmbeddings: reduced };
        } else {
          result = performClustering(task.data);
        }
        self.postMessage({
          type: "task-complete",
          taskId: task.id,
          result,
        });
      } catch (error) {
        self.postMessage({
          type: "task-complete",
          taskId: task.id,
          error: error.message,
        });
      }
    } else if (type === "terminate") {
      self.postMessage({ type: "terminated" });
      self.close();
    }
  };

  self.onerror = function (error) {
    self.postMessage({
      type: "error",
      error: error.message,
    });
  };
}
