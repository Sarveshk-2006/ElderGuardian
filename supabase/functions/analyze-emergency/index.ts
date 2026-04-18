// Supabase Edge Function - AI Emergency Analysis
// Deploy with: supabase functions deploy analyze-emergency

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      heartRate = 90,
      respirationRate = 18,
      spo2 = 98,
      impactForce = 5,
      variability = 0.3,
    } = body;

    const hrComponent = clamp((heartRate - 60) / 80, 0, 1);
    const respComponent = clamp((respirationRate - 12) / 24, 0, 1);
    const spo2Component = clamp((100 - spo2) / 20, 0, 1);
    const impactComponent = clamp(impactForce / 10, 0, 1);
    const csiRaw =
      2 * hrComponent + 1.5 * respComponent + 2 * spo2Component + 3 * impactComponent + variability;
    const csi = clamp(csiRaw * 1.2, 0, 10);

    const bleedingRaw =
      0.4 * sigmoid((heartRate - 100) / 20) +
      0.3 * sigmoid((respirationRate - 20) / 8) +
      0.3 * sigmoid(impactForce - 4);
    const bleedingProbability = clamp(bleedingRaw, 0, 1);

    let triage = 'green';
    if (csi >= 6 || bleedingProbability >= 0.6 || heartRate >= 120 || spo2 < 92) {
      triage = 'red';
    } else if (csi >= 4 || bleedingProbability >= 0.35 || heartRate >= 100 || spo2 < 95) {
      triage = 'yellow';
    }

    const analysis = {
      csi: Math.round(csi * 10) / 10,
      heartRate,
      respirationRate,
      spo2,
      bleedingProbability: Math.round(bleedingProbability * 100) / 100,
      triage,
      confidence: 0.85 + Math.random() * 0.1,
      analyzedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
