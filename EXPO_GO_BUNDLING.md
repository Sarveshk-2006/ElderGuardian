# Expo Go – app not bundling: what to try

If the app doesn’t load in Expo Go (stuck on “Downloading…”, “Connecting…”, or a blank screen), try these in order.

---

## 1. Clear Metro cache and restart

From the project root:

```bash
npm run start:clear
```

Or:

```bash
npx expo start -c
```

Then scan the QR code again in Expo Go.

---

## 2. Use tunnel (phone and PC on different networks)

If your phone and PC are on different Wi‑Fi networks (or you’re on mobile data), use tunnel:

```bash
npm run start:tunnel
```

Wait until you see “Tunnel ready” and the tunnel URL. Scan the new QR code in Expo Go.  
You may need to install `@expo/ngrok` when prompted.

---

## 3. Same Wi‑Fi and firewall

- Phone and PC must be on the **same Wi‑Fi** when not using tunnel.
- **Windows Firewall:** allow Node/Metro on private networks (port **8081**).
- Temporarily turn off VPN on both PC and phone.

---

## 4. Disable New Architecture (for Expo Go)

In **`app.json`**, set:

```json
"newArchEnabled": false
```

Then:

```bash
npm run start:clear
```

and open the project again in Expo Go.

---

## 5. Update Expo Go

Your project uses **Expo SDK 54**. Use the **latest Expo Go** from the App Store / Play Store so it matches SDK 54.

---

## 6. Run and open in Expo Go

```bash
cd d:\New folder\smart-emergency-response
npm run start:clear
```

- **Android:** Open Expo Go → “Scan QR code” and scan the QR from the terminal.
- **iOS:** Open Camera app, scan the QR code, tap the banner to open in Expo Go.

If it still doesn’t bundle, run with tunnel:

```bash
npm run start:tunnel
```

and scan the tunnel QR code.
