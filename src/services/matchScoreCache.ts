import api from './api';

// Module-level cache — persists across component mounts within the same session
const cache: Record<string, { score: number; reason: string }> = {};
const pending: Record<string, Promise<{ score: number; reason: string }>> = {};

export const getMatchScore = async (
  jobId: string,
): Promise<{ score: number; reason: string }> => {
  // Return from local cache if available
  if (cache[jobId]) return cache[jobId];

  // If already fetching this jobId, reuse the same promise (deduplication)
  if (await pending[jobId]) return pending[jobId];

  // Fetch from backend (which checks DB cache first)
  pending[jobId] = api
    .get(`/jobs/${jobId}/match`)
    .then((res) => {
      const result = res.data.data;
      cache[jobId] = result;
      delete pending[jobId];
      return result;
    })
    .catch(() => {
      delete pending[jobId];
      const fallback = { score: 0, reason: 'Unable to compute score' };
      cache[jobId] = fallback;
      return fallback;
    });

  return pending[jobId];
};

export const clearMatchCache = () => {
  Object.keys(cache).forEach((k) => delete cache[k]);
};