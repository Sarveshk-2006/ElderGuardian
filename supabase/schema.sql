-- Smart Emergency Response System - Supabase Schema
-- Run this in Supabase SQL Editor to enable cloud sync

-- Emergencies table
CREATE TABLE IF NOT EXISTS emergencies (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  csi NUMERIC(4,2) NOT NULL,
  heart_rate INTEGER NOT NULL,
  respiration_rate INTEGER NOT NULL,
  spo2 INTEGER NOT NULL,
  bleeding_probability NUMERIC(4,2) NOT NULL,
  triage TEXT NOT NULL CHECK (triage IN ('red', 'yellow', 'green')),
  status TEXT NOT NULL DEFAULT 'Emergency Activated',
  contacts_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'user_settings',
  aggressive_alert BOOLEAN DEFAULT TRUE,
  contact_name TEXT DEFAULT 'Dr. Emergency',
  contact_phone TEXT DEFAULT '+1 (555) 010-9999',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (optional - disable for demo)
ALTER TABLE emergencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow all for anonymous demo (replace with proper auth in production)
CREATE POLICY "Allow all emergencies" ON emergencies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- Index for fast history queries
CREATE INDEX IF NOT EXISTS idx_emergencies_timestamp ON emergencies(timestamp DESC);
