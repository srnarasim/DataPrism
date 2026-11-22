import { pipeline, env } from "@xenova/transformers";

type ProgressCallback = (progress: { file: string; progress: number }) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipelinePromise: Promise<any> | null = null;

function getPipeline(onProgress?: ProgressCallback) {
  if (!pipelinePromise) {
    env.allowLocalModels = false;
    const opts = onProgress
      ? {
          progress_callback: (p: { file: string; progress: number }) =>
            onProgress({ file: p.file, progress: p.progress }),
        }
      : undefined;
    pipelinePromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
      opts,
    );
  }
  return pipelinePromise;
}

export async function embed(
  texts: string[],
  onProgress?: ProgressCallback,
): Promise<number[][]> {
  const pipe = await getPipeline(onProgress);
  const output = await pipe(texts, { pooling: "mean", normalize: true });
  const dim = 384;
  const flat: Float32Array = output.data;
  return Array.from({ length: texts.length }, (_, i) =>
    Array.from(flat.subarray(i * dim, (i + 1) * dim)),
  );
}
