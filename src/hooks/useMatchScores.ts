import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  getApplicantEntry,
  getJobEntry,
  getVersion,
  requestApplicantScores,
  requestJobScores,
  subscribe,
  type ScoreEntry,
} from '../services/matchScoreCache';

// Scores for jobs, for the logged in student.
// Returns a function: getScore(jobId) gives { status, data }.
export const useJobScores = (jobIds: string[]) => {
  const version = useSyncExternalStore(subscribe, getVersion);
  const key = jobIds.filter(Boolean).join('|');

  useEffect(() => {
    if (key) requestJobScores(key.split('|'));
  }, [key, version]);

  return useCallback((jobId: string): ScoreEntry => getJobEntry(jobId), [version]);
};

// Scores for the applicants of one or more jobs, for the logged in company.
// Returns a function: getScore(applicationId) gives { status, data }.
export const useApplicantScores = (jobIds: string[]) => {
  const version = useSyncExternalStore(subscribe, getVersion);
  const key = jobIds.filter(Boolean).join('|');

  useEffect(() => {
    if (key) requestApplicantScores(key.split('|'));
  }, [key, version]);

  return useCallback(
    (applicationId: string): ScoreEntry =>
      getApplicantEntry(applicationId, key ? key.split('|') : []),
    [version, key],
  );
};