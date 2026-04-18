# 🛡️ ElderGuardian: Smart Emergency Response System

**A Hybrid AI-Powered Protection Suite for the Elderly.**

ElderGuardian is a next-generation safety ecosystem designed to protect senior citizens from silent emergencies. It combines advanced mobile AI, physics-based fall detection, and resilient hardware to ensure that help is dispatched even in zero-connectivity "black zones."

---

## 🚀 Key Features

### 🏥 Medical & Safety Dashboard
*   **Real-Time Monitoring**: Pulsing biometrics and system health status.
*   **Vitals AI Scanner**: Camera-based AI analysis for remote heart rate estimation and trauma detection (Bleeding/Pale Skin).
*   **Medicine Scheduler**: Interactive daily prescription planner to ensure high health adherence.
*   **Analytics Hub**: Safety scores and weekly mobility trends for family oversight.

### 🚨 Emergency Intelligence (A1-C3 Matrix)
The system uses a sophisticated **Connectivity-Severity Matrix** to determine the best response:
*   **Tier 1 (Red)**: Severe falls – immediate automated SMS + 10-second proof-of-life audio recording.
*   **Tier 2 (Yellow)**: Shakes/Minor impacts – "Are you okay?" prompt before dispatch.
*   **Tier 3 (Green)**: System self-logs for daily mobility tracking.

### 📍 Intelligent Navigation
*   **Data Science Lab Specialized Training**: The emergency navigation logic is fine-tuned for high-accuracy dispatch within our **Data Science (DS) Lab** environment, ensuring responders find the exact wing/room in record time.
*   **Nearby Rescue**: One-tap navigation to the nearest critical-care hospitals with specialized tags (Emergency 24/7 / ICU).

---

## 📡 Hardware Integration (Hybrid Resilience)
For scenarios where mobile connectivity is unavailable or the phone is out of reach, our custom hardware module takes over:

| Component | Function |
| :--- | :--- |
| **ESP32 Microcontroller** | The "Brain" – handles local data processing and low-power communication. |
| **MPU6050 (IMU)** | High-precision 6-axis accelerometer/gyroscope for secondary fall detection. |
| **GPS Neo6M** | Satellite-based positioning to provide coordinates in "offline" zones. |
| **Relay Module** | Triggering physical alarms or emergency lighting within the home. |

---

## 💻 Tech Stack
*   **Frontend**: React Native (Expo) with custom-built premium UI components.
*   **Backend**: Node.js & Express API with MySQL database for secure history logging.
*   **AI Engine**: Medical triage and image processing (Simulated via local logic and Camera Stream).
*   **Navigation**: Google Maps API with Data Science Lab specific coordinate training.

---

## 🛠️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Android Studio (for local builds)
*   Java JDK 17+ (Set `JAVA_HOME` to your Android Studio `jbr` folder)

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

### 3. Generate APK
```powershell
cd android
./gradlew assembleDebug
```
*Locate the APK at: `android/app/build/outputs/apk/debug/app-debug.apk`*

---

## 🏆 Techathon Project
*Built with ❤️ for the technological advancement of elderly safety.*
**Location Data Trained @ Data Science Lab**
