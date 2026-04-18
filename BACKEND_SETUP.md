# Backend Setup

## 1. MySQL + Express Backend (Required for Auth & Role-Based App)

### Setup MySQL
1. Install MySQL and ensure it's running.
2. Create the database and tables:
   ```bash
   mysql -u root -p123456789 < backend/schema.sql
   ```
   Or manually run the SQL in `backend/schema.sql`.

### Start the Backend
```bash
cd backend
npm install
npm start
```
Backend runs on http://localhost:3001

### Configure the App
Create `.env` in the project root:
```
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```
For testing on a **physical device**, use your computer's IP:
```
EXPO_PUBLIC_API_URL=http://192.168.1.5:3001/api
```

### Roles
- **person** – Driver/passenger; sees crash detection, emergency flow
- **police** – Authority; sees Police, Hospital, Towing tabs with relevant emergencies
- **hospital** – Authority; sees Hospital dashboard
- **towing** – Authority; sees Towing dashboard

---

## 2. Supabase (Optional - Legacy Cloud Backend)

1. Create a free project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key from **Settings → API**
4. Create `.env` in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Restart Expo: `npx expo start --clear`

## 2. AI Edge Function (Optional)

The app uses **local AI analysis** by default. To run analysis on Supabase:

1. Install Supabase CLI: `npm i -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref your-project-ref`
4. Deploy: `supabase functions deploy analyze-emergency`
5. Call the function from your app when needed (optional enhancement)

## 3. What Works Without Supabase

- **Monitoring state** – persisted via AsyncStorage
- **Settings & contacts** – saved locally
- **Emergency history** – stored locally
- **AI analysis** – runs in-app (heuristic model)
- **Crash detection flow** – full flow with AI-computed CSI, triage, bleeding probability

## 4. Data Flow

- **Crash Alert** → countdown → `createEmergency()` runs AI analysis → saves to AsyncStorage (+ Supabase if configured)
- **History** → loads from AsyncStorage, merges with Supabase if configured
- **Settings** → load/save to AsyncStorage, sync to Supabase if configured
