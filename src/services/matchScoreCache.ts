import api from './api';
import type { MatchResult } from '../types';

// One shared store for every match score in the app.
//
// Why: before, each page asked for scores in its own way, cached failures as 0, and
// the company screen used a different formula. Now every screen reads from this store,
// the store reads from the server, and the server keeps one score for each student and job.
// So the same job shows the same number on the feed, dashboard, job page, apply page
// and company review board.

export type ScoreStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ScoreEntry {
  status: ScoreStatus;
  data?: MatchResult;
  failedAt?: number;
}

const IDLE: ScoreEntry = { status: 'idle' };
const RETRY_AFTER_MS = 30_000;
const BATCH_SIZE = 30;
const BATCH_DELAY_MS = 15;

const entries = new Map<string, ScoreEntry>();
const applicantJobs = new Map<string, 'loading' | 'ready' | 'error'>();
const listeners = new Set<() => void>();

let version = 0;
// Bumped by clearMatchCache so answers that arrive late for old requests are ignored.
let epoch = 0;

const emit = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getVersion = () => version;

const jobKey = (jobId: string) => `job:${jobId}`;
const applicationKey = (applicationId: string) => `app:${applicationId}`;

export const getJobEntry = (jobId: string): ScoreEntry => entries.get(jobKey(jobId)) ?? IDLE;

export const getApplicantEntry = (applicationId: string, jobIds: string[]): ScoreEntry => {
  const entry = entries.get(applicationKey(applicationId));
  if (entry) return entry;
  const stillLoading = jobIds.some((id) => {
    const status = applicantJobs.get(id);
    return status === undefined || status === 'loading';
  });
  return stillLoading ? { status: 'loading' } : { status: 'error' };
};

const shouldRequest = (entry: ScoreEntry | undefined): boolean => {
  if (!entry) return true;
  if (entry.status === 'loading' || entry.status === 'ready') return false;
  if (entry.status === 'error') return Date.now() - (entry.failedAt ?? 0) >= RETRY_AFTER_MS;
  return true;
};

// ---------- scores for jobs (student screens) ----------

let queue = new Set<string>();
let timer: ReturnType<typeof setTimeout> | null = null;

const flushJobQueue = async () => {
  timer = null;
  const ids = Array.from(queue);
  queue = new Set();
  const startedIn = epoch;

  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += BATCH_SIZE) chunks.push(ids.slice(i, i + BATCH_SIZE));

  await Promise.all(
    chunks.map(async (chunk) => {
      let scores: Record<string, MatchResult> = {};
      let failed = false;
      try {
        const res = await api.post('/jobs/match-scores', { jobIds: chunk });
        scores = res.data?.data?.scores ?? {};
      } catch {
        failed = true;
      }
      if (startedIn !== epoch) return;
      chunk.forEach((id) => {
        const data = scores[id];
        entries.set(
          jobKey(id),
          !failed && data ? { status: 'ready', data } : { status: 'error', failedAt: Date.now() },
        );
      });
      emit();
    }),
  );
};

export const requestJobScores = (jobIds: string[]) => {
  let added = false;
  jobIds.forEach((id) => {
    if (!id || !shouldRequest(entries.get(jobKey(id)))) return;
    entries.set(jobKey(id), { status: 'loading' });
    queue.add(id);
    added = true;
  });
  if (!added) return;
  emit();
  if (!timer) timer = setTimeout(flushJobQueue, BATCH_DELAY_MS);
};

// ---------- scores for applicants (company screens) ----------

export const requestApplicantScores = (jobIds: string[]) => {
  jobIds.forEach(async (jobId) => {
    const current = applicantJobs.get(jobId);
    if (!jobId || current === 'loading' || current === 'ready') return;
    applicantJobs.set(jobId, 'loading');
    const startedIn = epoch;
    try {
      const res = await api.get(`/applications/job/${jobId}/scores`);
      if (startedIn !== epoch) return;
      const scores: Record<string, MatchResult> = res.data?.data?.scores ?? {};
      Object.entries(scores).forEach(([applicationId, data]) => {
        entries.set(applicationKey(applicationId), { status: 'ready', data });
      });
      applicantJobs.set(jobId, 'ready');
    } catch {
      if (startedIn !== epoch) return;
      applicantJobs.set(jobId, 'error');
      // Allow another try on the next visit.
      setTimeout(() => {
        if (applicantJobs.get(jobId) === 'error') {
          applicantJobs.delete(jobId);
          emit();
        }
      }, RETRY_AFTER_MS);
    }
    emit();
  });
};

// Call after the student's profile changes. The server already notices changed skills,
// this makes the screen ask again straight away instead of showing the old number.
export const clearMatchCache = () => {
  epoch += 1;
  entries.clear();
  applicantJobs.clear();
  queue = new Set();
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  emit();
};