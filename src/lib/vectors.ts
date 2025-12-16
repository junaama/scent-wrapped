/**
 * Vector similarity and math utilities for the recommendation engine
 */

/**
 * Computes cosine similarity between two vectors
 * Returns value between -1 and 1 (1 = identical, 0 = orthogonal, -1 = opposite)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * Computes Euclidean distance between two vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Adds two vectors element-wise
 */
export function addVectors(a: number[], b: number[]): number[] {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }
  return a.map((val, i) => val + b[i]);
}

/**
 * Computes the average of multiple vectors
 */
export function averageVectors(vectors: number[][]): number[] {
  if (vectors.length === 0) {
    throw new Error("Cannot average empty vector list");
  }

  const dimension = vectors[0].length;
  const sum = new Array(dimension).fill(0);

  for (const vec of vectors) {
    for (let i = 0; i < dimension; i++) {
      sum[i] += vec[i];
    }
  }

  return sum.map((val) => val / vectors.length);
}

/**
 * Normalizes a vector to unit length (L2 normalization)
 */
export function normalizeVector(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) return v;
  return v.map((val) => val / norm);
}

/**
 * Concatenates multiple vectors into one
 */
export function concatenateVectors(...vectors: number[][]): number[] {
  return vectors.flat();
}

/**
 * Applies weights to a vector
 */
export function weightVector(v: number[], weight: number): number[] {
  return v.map((val) => val * weight);
}

/**
 * Creates a weighted combination of multiple vectors
 */
export function weightedSum(
  vectors: number[][],
  weights: number[]
): number[] {
  if (vectors.length !== weights.length) {
    throw new Error("Vectors and weights must have same length");
  }

  const dimension = vectors[0].length;
  const result = new Array(dimension).fill(0);

  for (let i = 0; i < vectors.length; i++) {
    for (let j = 0; j < dimension; j++) {
      result[j] += vectors[i][j] * weights[i];
    }
  }

  return result;
}

/**
 * Finds the top N most similar vectors
 */
export function findTopSimilar<T extends { vector: number[] }>(
  query: number[],
  candidates: T[],
  topN: number = 3,
  vectorKey: keyof T = "vector" as keyof T
): { item: T; similarity: number }[] {
  const scored = candidates.map((item) => ({
    item,
    similarity: cosineSimilarity(query, item[vectorKey] as unknown as number[]),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topN);
}

/**
 * Computes combined similarity score using multiple vector components
 */
export function computeCompositeSimilarity(
  queryVectors: { vector: number[]; weight: number }[],
  candidateVectors: { vector: number[]; weight: number }[]
): number {
  if (queryVectors.length !== candidateVectors.length) {
    throw new Error("Query and candidate must have same number of components");
  }

  let totalSimilarity = 0;
  let totalWeight = 0;

  for (let i = 0; i < queryVectors.length; i++) {
    const sim = cosineSimilarity(queryVectors[i].vector, candidateVectors[i].vector);
    totalSimilarity += sim * queryVectors[i].weight;
    totalWeight += queryVectors[i].weight;
  }

  return totalWeight > 0 ? totalSimilarity / totalWeight : 0;
}

/**
 * Selects pairs with maximum dissimilarity (for quiz stage 1)
 */
export function findMaxDissimilarPair<T extends { vector: number[] }>(
  items: T[]
): [T, T] | null {
  if (items.length < 2) return null;

  let maxDistance = -Infinity;
  let pair: [T, T] | null = null;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const sim = cosineSimilarity(items[i].vector, items[j].vector);
      const distance = 1 - sim; // Convert similarity to distance

      if (distance > maxDistance) {
        maxDistance = distance;
        pair = [items[i], items[j]];
      }
    }
  }

  return pair;
}

/**
 * Finds pairs with medium dissimilarity based on a reference vector
 */
export function findMediumDissimilarPair<T extends { vector: number[] }>(
  reference: number[],
  items: T[],
  targetSimilarityRange: [number, number] = [0.3, 0.7]
): [T, T] | null {
  // Find items similar to reference but different from each other
  const scored = items.map((item) => ({
    item,
    similarity: cosineSimilarity(reference, item.vector),
  }));

  // Filter to items in the target range
  const filtered = scored.filter(
    (s) =>
      s.similarity >= targetSimilarityRange[0] &&
      s.similarity <= targetSimilarityRange[1]
  );

  if (filtered.length < 2) return null;

  // Find the most dissimilar pair within this set
  let maxDistance = -Infinity;
  let pair: [T, T] | null = null;

  for (let i = 0; i < filtered.length; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      const sim = cosineSimilarity(
        filtered[i].item.vector,
        filtered[j].item.vector
      );
      const distance = 1 - sim;

      if (distance > maxDistance) {
        maxDistance = distance;
        pair = [filtered[i].item, filtered[j].item];
      }
    }
  }

  return pair;
}

/**
 * Extracts top N indices with highest values from a vector
 */
export function getTopIndices(v: number[], topN: number): number[] {
  const indexed = v.map((val, idx) => ({ val, idx }));
  indexed.sort((a, b) => b.val - a.val);
  return indexed.slice(0, topN).map((item) => item.idx);
}
