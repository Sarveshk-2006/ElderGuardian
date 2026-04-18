# Full Steps to Run Smart Emergency Response

## Prerequisites

- **Node.js** (v18+)
- **MySQL** (running with user `root`, password `123456789`)
- **Expo Go** app on your phone (for physical device testing)
- **Same Wi-Fi** for phone and computer (if using physical device)

---

## Step 1: MySQL Database Setup

1. Ensure MySQL is installed and running.
2. Create the database and tables. In PowerShell, from the project root:

   ```powershell
   Get-Content .\backend\schema.sql | mysql -u root -p123456789
   ```

   Or use CMD:
   ```cmd
   cmd /c "mysql -u root -p123456789 < backend\schema.sql"
   ```

3. Verify: `mysql -u root -p123456789 -e "USE smart_emergency; SHOW TABLES;"`  
   You should see `users`, `emergencies`, and `user_settings`.

   If `user_settings` is missing (older setup), run:
   ```powershell
   Get-Content .\backend\migrations\001_user_settings.sql | mysql -u root -p123456789 smart_emergency
   ```

---

## Step 2: Backend Setup

1. Open a terminal and go to the backend folder:
   ```powershell
   cd "d:\New folder\smart-emergency-response\backend"
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Ensure `backend\.env` exists with:
   ```
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=123456789
   DB_NAME=smart_emergency
   JWT_SECRET=smart-emergency-jwt-secret
   ```

4. Start the backend:
   ```powershell
   npm start
   ```

5. You should see: `Backend running on http://localhost:3001`  
   **Keep this terminal open.**

---

## Step 3: App Configuration

1. Get your computer's IP (for physical device):
   ```powershell
   ipconfig
   ```
   Find **IPv4 Address** under **Wireless LAN adapter Wi-Fi** (e.g. `10.53.156.176`).

2. Create `.env` in the project root (`d:\New folder\smart-emergency-response\.env`):
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3001/api
   ```
   Replace `YOUR_IP` with your IP. Example: `http://10.53.156.176:3001/api`

   - **Android emulator:** use `http://10.0.2.2:3001/api`
   - **iOS simulator / web:** use `http://localhost:3001/api`

---

## Step 4: Run the App

1. Open a **new** terminal and go to the project root:
   ```powershell
   cd "d:\New folder\smart-emergency-response"
   ```

2. Install app dependencies (if not done):
   ```powershell
   npm install
   ```

3. Start the app:
   ```powershell
   npx expo start
   ```

   If you get `TypeError: fetch failed`, try:
   ```powershell
   npx expo start --offline
   ```

4. Run the app:
   - **Physical device:** Scan the QR code with Expo Go (phone and PC on same Wi‑Fi)
   - **Android emulator:** Press `a` in the terminal
   - **iOS simulator:** Press `i` in the terminal (Mac only)
   - **Web:** Press `w` in the terminal

---

## Step 5: Create an Account

1. On first launch you'll see the **Login** screen.
2. Tap **Register**.
3. Enter name, email, password.
4. Choose a role:
   - **Person (Driver/Passenger)** – crash detection, emergency flow
   - **Police** – authority dashboard
   - **Hospital** – authority dashboard
   - **Towing Service** – authority dashboard
5. Tap **Register** – you’ll be logged in.

---

## Quick Reference

| What       | Command / Action                                  |
|------------|---------------------------------------------------|
| Start backend | `cd backend` → `npm start`                     |
| Start app  | `npx expo start` (or `npx expo start --offline`)  |
| Phone + PC | Same Wi‑Fi, use PC IP in `.env`                   |

---

## Troubleshooting

| Problem              | Fix |
|----------------------|-----|
| "Cannot connect to backend" | Backend running? Same Wi‑Fi? Correct IP in `.env`? |
| "TypeError: fetch failed"   | Run `npx expo start --offline` |
| MySQL schema error         | Run schema again; DB may already exist |
| Login/Register fails       | Backend running on port 3001? Check `.env` API URL |
