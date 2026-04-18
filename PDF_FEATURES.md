# Smart Emergency Response System – PDF Feature Mapping

Implementation aligns with all requirements from the PDF specification and the **A1-C3 Emergency Response Matrix** (Techathon flow diagram).

## A1-C3 Matrix (Techathon PDF)

| Cell | Connectivity | Tier | Roles | Actions |
|------|--------------|------|-------|---------|
| A1 | Active (City) | 1 Critical | Hospital (108), Police (100) | Auto-dial 108 & 100, SMS with medical details & live GPS |
| B1 | Poor Network | 1 Critical | Hospital, Police | SMS with medical details & location, audio beacon |
| C1 | Dead Zone | 1 Critical | Hospital, Police | V2V signal relay (critical emergency) |
| A2 | Active | 2 Urgent | Towing, Hospital | Notify towing via app, prompt to dial 108 if needed |
| B2 | Poor | 2 Urgent | Towing, Hospital | SMS with Car No, Name, Location, audio beacon |
| C2 | Dead | 2 Urgent | Towing | V2V signal relay (breakdown to passing cars) |
| A3 | Active | 3 Routine | Police (Optional) | "Are you okay?" prompt; if no response → SMS to 100 |
| B3 | Poor | 3 Routine | System Log | Queue SMS to send when connectivity improves |
| C3 | Dead | 3 Routine | System Log | Log crash via sensors; no relay unless manual |

## Core Features (10/10)

| # | PDF Feature | Implementation |
|---|-------------|----------------|
| 1 | Automatic Crash Detection using accelerometer and gyroscope | `src/services/crashDetection.js` – uses expo-sensors (Accelerometer, Gyroscope). Starts when monitoring ON. |
| 2 | CSI from G-force, impact duration, motion patterns | `computeCSIFromSensors()` in crashDetection.js + AI analysis in aiAnalysis.js |
| 3 | 10-second smart cancel window | CrashAlertScreen – CountdownTimer with Cancel button |
| 4 | AI-based visual trauma (heavy bleeding, pale skin) | VitalsScreen – trauma detection badges; aiAnalysis computes bleeding/pale skin probabilities |
| 5 | Camera-based remote heart rate estimation | VitalsScreen – expo-camera preview + AI vitals (heart rate, respiration, SpO₂) |
| 6 | Structured Emergency Data Packet | `src/services/emergencyPacket.js` – `createEmergencyDataPacket()` for responder dashboard |
| 7 | Live responder dashboard, color-coded triage, Golden Hour | EmergencyActivatedScreen – triage colors (R/Y/G), Golden Hour timer; AnalyticsScreen for authority dashboard |
| 8 | Emergency contact auto-call and SMS alert | `src/services/contactAlert.js` – `notifyContact()`, `autoCallContact()`; EmergencyActivatedScreen "Notify Contacts" |
| 9 | Offline SMS fallback | `contactAlert.js` – queues SMS when network unavailable; `flushOfflineQueue()` |
| 10 | Golden Hour Timer displayed to responders | EmergencyActivatedScreen – 60-minute countdown |

## Unique Enhancements

| Enhancement | Implementation |
|-------------|----------------|
| Pre-Accident Risk Alert (aggressive driving) | `src/services/aggressiveDriving.js` – Accelerometer-based hard braking/acceleration detection. HomeScreen shows alert when enabled in Settings. |
| Severity Trend Monitoring (first 3 min) | EmergencyActivatedScreen – tracks vitals every 15s for 3 minutes post-crash |
| Hospital Pre-Arrival Notification | `emergencyPacket.js` – `hospitalPreArrival` object with CSI, triage, vitals |
| Volunteer First-Responder Alert 500m | Data structure in packet; location + backend needed for full implementation |
| AI-based triage (Red, Yellow, Green) | `aiAnalysis.js` + `triage.js` – deterministic + heuristic classification |
| Emergency Performance Analytics Dashboard | AnalyticsScreen – severity distribution, avg CSI, measurable impact metrics |

## System Architecture

- **Mobile App**: Sensor collection (Accel, Gyro), crash detection, camera AI vitals, emergency packet generation
- **Backend**: Supabase (optional) – receives emergency data, stores logs
- **Responder Dashboard**: AnalyticsScreen – live severity colors, Golden Hour, injury probability summary

## Measurable Impact (from PDF)

- Auto detection saves 2–3 minutes
- Severity prioritization saves 3–5 minutes
- Pre-hospital preparation saves 5–8 minutes
- Total potential reduction: 10–15 minutes

These metrics are shown in the Analytics screen.
