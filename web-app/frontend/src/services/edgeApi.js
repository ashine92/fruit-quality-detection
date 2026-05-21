/**
 * edgeApi.js — API Adapter Service
 *
 * Adapter Pattern: abstracts all HTTP communication with the backend.
 * Container components call these functions without knowing about fetch/URLs.
 *
 * All requests go to /api/v1/... which Vite proxy forwards to http://localhost:5000
 */

const BASE = '/api/v1';

async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json();
}

export const edgeApi = {
  /**
   * GET /api/v1/stats
   * → { totalInspected, yieldRate, counts: { Ripe, Unripe, Overripe, Rotten } }
   */
  getProductionStats: async () => {
    return apiFetch('/stats');
  },

  /**
   * GET /api/v1/telemetry
   * → { fps, inferenceTimeMs, status }
   */
  getTelemetry: async () => {
    return apiFetch('/telemetry');
  },

  /**
   * GET /api/v1/inferences?confidence=<threshold>
   * → [{ id, timestamp, className, confidence, snapshotUrl, ... }]
   */
  getInferenceLogs: async (confidenceThreshold = 0) => {
    return apiFetch(`/inferences?confidence=${confidenceThreshold}`);
  },

  /**
   * GET /api/v1/yield-trend
   * → [{ name, yield, gradeA, gradeB, rejected }]
   */
  getYieldTrend: async () => {
    return apiFetch('/yield-trend');
  },

  /**
   * POST /api/v1/inferences
   * Called by Edge AI device to submit a detection result.
   * (Not called from UI — here for completeness)
   */
  updateCameraConfig: async (config) => {
    console.log('[edgeApi] Camera config update (not yet implemented):', config);
    return true;
  },
};

