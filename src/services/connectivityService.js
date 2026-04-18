/**
 * Connectivity detection for A1-C3 Emergency Response Matrix.
 * Class A: Active (Within City - good network)
 * Class B: Bad (Poor Network)
 * Class C: Cut-off (Dead Zone - no network)
 */

const CONNECTIVITY_CHECK_URL = 'https://www.google.com/generate_204';
const TIMEOUT_MS = 4000;

/**
 * Detect connectivity class via fetch + timeout heuristic.
 * @returns {Promise<'A'|'B'|'C'>} - Class A (Active), B (Bad), or C (Cut-off)
 */
export async function getConnectivityClass() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(CONNECTIVITY_CHECK_URL, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    if (res && res.status < 400) return 'A';
    return 'B';
  } catch (e) {
    if (e?.name === 'AbortError') return 'B';
    try {
      const retry = await fetch(CONNECTIVITY_CHECK_URL, {
        method: 'HEAD',
        cache: 'no-store',
      });
      if (retry && retry.status < 400) return 'A';
    } catch {
      // Still failing
    }
    return 'C';
  }
}

/**
 * Get tier from triage (red=1, yellow=2, green=3).
 * Tier 1: Critical (Severe Injury)
 * Tier 2: Urgent (Breakdown)
 * Tier 3: Routine (Minor Accident)
 */
export function getTierFromTriage(triage) {
  switch (triage) {
    case 'red':
      return 1;
    case 'yellow':
      return 2;
    case 'green':
    default:
      return 3;
  }
}

export const CONNECTIVITY_LABELS = {
  A: 'Active (Within City)',
  B: 'Bad (Poor Network)',
  C: 'Cut-off (Dead Zone)',
};
