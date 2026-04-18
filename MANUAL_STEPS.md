# Manual steps – Run the project

Follow these steps to run **smart-emergency-response** on your machine and open it in Expo Go.

---

## 1. Open terminal in the project folder

- **In Cursor/VS Code:** `Terminal` → `New Terminal`, or press **Ctrl+`**
- Or open **Command Prompt** or **PowerShell** and go to the project:

```text
cd "d:\New folder\smart-emergency-response"
```

---

## 2. Install dependencies (only if you haven’t already)

```text
npm install
```

Wait until it finishes. You can skip this if you already ran it before.

---

## 3. Start the Expo dev server

```text
npm start
```

Wait until you see:

- **“Metro waiting on …”** or **“Bundler ready”**
- A **QR code** in the terminal
- A URL like **`exp://192.168.x.x:8081`**

Keep this terminal open; closing it stops the app.

---

## 4. Open the app on your phone (Expo Go)

**On Android:**

1. Install **Expo Go** from the Play Store (if not installed).
2. Open **Expo Go**.
3. Tap **“Scan QR code”**.
4. Scan the **QR code** shown in the terminal (from step 3).
5. The app will load in Expo Go.

**On iPhone:**

1. Install **Expo Go** from the App Store (if not installed).
2. Open the **Camera** app.
3. Point at the **QR code** in the terminal.
4. Tap the notification that appears to open the project in **Expo Go**.

---

## 5. (Optional) Open in web browser

In the **same terminal** where `npm start` is running, press:

```text
w
```

The app will open in your default browser.

---

## 6. If the app doesn’t load on the phone

**Option A – Clear cache and restart**

1. In the terminal, press **Ctrl+C** to stop the server.
2. Run:

```text
npm run start:clear
```

3. When the new QR code appears, scan it again in Expo Go.

**Option B – Use tunnel (different Wi‑Fi / mobile data)**

1. In the terminal, press **Ctrl+C** to stop the server.
2. Run:

```text
npm run start:tunnel
```

3. Wait for **“Tunnel ready”** and the new QR code.
4. Scan this **tunnel** QR code in Expo Go.
5. If it asks to install `@expo/ngrok`, type **Y** and press Enter.

---

## 7. Stop the project

In the terminal where the server is running, press **Ctrl+C**.

---

## Quick reference

| What you want to do   | Command / action        |
|-----------------------|-------------------------|
| Start the app         | `npm start`             |
| Start with clean cache| `npm run start:clear`   |
| Start with tunnel     | `npm run start:tunnel`  |
| Open in browser       | Press `w` in terminal  |
| Stop the server       | Press `Ctrl+C`          |
