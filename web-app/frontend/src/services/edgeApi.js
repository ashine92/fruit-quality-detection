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

  /**
   * PATCH /api/v1/inferences/:id/label
   * Assign a human label to an inference result
   */
  assignLabel: async (id, human_label) => {
    const res = await fetch(`${BASE}/inferences/${id}/label`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ human_label }),
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: /inferences/${id}/label`);
    }
    return res.json();
  },

  /**
   * DELETE /api/v1/inferences/:id/label
   * Undo human label — clears human_label and resets is_corrected to 0
   */
  removeLabel: async (id) => {
    const res = await fetch(`${BASE}/inferences/${id}/label`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`API error ${res.status}: /inferences/${id}/label`);
    return res.json();
  },

  /** DELETE /api/v1/inferences/:id — delete single record + file */
  deleteRecord: async (id) => {
    const res = await fetch(`${BASE}/inferences/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`API error ${res.status}: DELETE /inferences/${id}`);
    return res.json();
  },

  /** DELETE /api/v1/inferences — bulk delete */
  bulkDelete: async (ids) => {
    const res = await fetch(`${BASE}/inferences`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}: DELETE /inferences`);
    return res.json();
  },

  /** POST /api/v1/inferences/cleanup — remove orphaned DB records */
  cleanupOrphaned: async () => {
    const res = await fetch(`${BASE}/inferences/cleanup`, { method: 'POST' });
    if (!res.ok) throw new Error(`API error ${res.status}: /inferences/cleanup`);
    return res.json();
  },

  /** DELETE /api/v1/inferences/all — wipe ALL records and snapshot files */
  deleteAll: async () => {
    const res = await fetch(`${BASE}/inferences/all`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`API error ${res.status}: /inferences/all`);
    return res.json();
  },

  /**
   * POST /api/v1/snapshots
   */
  saveSnapshot: async (imageBase64) => {
    const res = await fetch(`${BASE}/snapshots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: /snapshots`);
    }
    return res.json();
  },
  /**
   * POST /api/v1/classify
   * @param {Array<{name:string, dataUrl:string}>} images
   * @returns {Promise<{results: Array}>}
   */
  classifyImages: async (images) => {
    const res = await fetch(`${BASE}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}: /classify`);
    return res.json();
  },
};

