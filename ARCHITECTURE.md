# Smart Emergency Response – Updated Architecture

## Overview

Automatic crash detection app with background monitoring, auto-notification, and nearby hospital navigation.

## Features Implemented

### 1. Fully Automatic Emergency Trigger
- Monitoring starts automatically on app launch
- No "Start Monitoring" button required
- 10-second cancel window (optional user cancel)
- Emergency triggers automatically after crash detection

### 2. Background Monitoring
- Uses `expo-task-manager` + `expo-location` for background location updates
- Uses `AppState` to handle foreground/background transitions
- **Note:** Full sensor-based crash detection in background requires a development build; Expo Go limits sensor access when app is backgrounded

### 3. Automatic Emergency Contact Notification
- Contacts notified immediately when crash is confirmed (after 10s countdown)
- No manual "Notify Contacts" button
- Auto-opens SMS compose with prefilled message (Live location link, CSI, Timestamp)
- Auto-triggers phone call to contact
- Smart retry: 3 attempts, 10 seconds apart

### 4. Network-Independent Messaging
- Priority: Internet API (Twilio if `EXPO_PUBLIC_TWILIO_API_URL` set) → Native SMS (Linking)
- Offline: queues to AsyncStorage, opens SMS compose when possible
- Fallback: `Linking.openURL(sms:...)` works without internet
- Retry logic with status indicator: Sent / Failed / Retrying

### 5. Simplified System (No Heart Rate / Bleeding)
- Removed heart rate estimation
- Removed bleeding detection
- Focus: Crash detection, CSI, Location, Auto-alerts

### 6. Nearby Hospitals Map Feature
- Uses OpenStreetMap Overpass API (no API key)
- Shows: name, distance, ETA, Navigate button
- Opens Google Maps for directions
- Accessible from Home tab and Emergency Activated screen

### 7. Authority Callback Simulation
- Simulated "Emergency Authority Contacting You" after ~15s
- Accept / Reject buttons
- Logs response

### 8. Improved Crash Detection Logic
- CSI factors: G-force peak, orientation change, impact duration, motion component
- Reduced false positives via stricter thresholds

### 9. Smart Retry System
- 3 attempts, 10 seconds apart
- Status: Sent / Failed / Retrying
- Logs failures

### 10. UI State Flow
- `monitoring` → `crash_detected` → `cancel_window` → `emergency_triggered` → `alerts_sent` → `authority_callback` → `hospital_nav`

## Required Packages

```json
{
  "expo-task-manager": "~14.0.9",
  "expo-background-fetch": "~14.0.9",
  "expo-sms": "~14.0.0"
}
```

## Folder Structure

```
src/
├── context/
│   ├── AppContext.js       # Settings, history
│   └── EmergencyContext.js # Emergency state flow
├── services/
│   ├── crashDetection.js   # Improved CSI, sensors
│   ├── aiAnalysis.js       # Simplified (CSI, triage only)
│   ├── contactAlert.js     # SMS, retry, location link
│   ├── emergencyService.js # Create emergency, auto-notify
│   ├── emergencyPacket.js  # Data packet (no vitals)
│   ├── backgroundMonitor.js# AppState, TaskManager
│   └── hospitalService.js  # OSM Overpass API
├── screens/
│   ├── HomeScreen.js       # Auto-start, no manual button
│   ├── CrashAlertScreen.js # 10s cancel, auto-notify
│   ├── EmergencyActivatedScreen.js # CSI, alerts, authority, hospitals
│   ├── HospitalsMapScreen.js
│   ├── HistoryScreen.js
│   ├── AnalyticsScreen.js
│   └── SettingsScreen.js
└── navigation/
    └── RootNavigator.js    # MainTabs + CrashAlert + EmergencyActivated + Hospitals
```

## SMS Integration (Twilio)

Set `EXPO_PUBLIC_TWILIO_API_URL` to your backend endpoint that accepts:
- `POST` with `{ to: string, body: string }`
- Returns 200 on success

If not set, app falls back to native SMS (opens compose).

## Background Task Setup

- `backgroundMonitor.js` uses `expo-task-manager` + `expo-location`
- Task name: `emergency_background_location`
- For full background sensor detection, use a development build with native modules.

## Hospital Map Integration

- `hospitalService.js` fetches from Overpass API
- No API key required
- Radius: 15km, limit: 15 hospitals
- ETA estimated at ~40 km/h urban speed
