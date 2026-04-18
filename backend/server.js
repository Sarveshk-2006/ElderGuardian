require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const emergencyRoutes = require('./routes/emergencies');
const settingsRoutes = require('./routes/settings');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => res.json({ ok: true, message: 'Smart Emergency API running' }));
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/settings', settingsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Network: use http://YOUR_IP:${PORT}/api in app .env`);
});
