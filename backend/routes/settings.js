const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// GET current user's settings
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT contact_name, contact_phone, car_number, user_name, aggressive_alert FROM user_settings WHERE user_id = ?',
      [req.userId]
    );
    if (rows.length === 0) {
      return res.json({
        aggressiveAlert: true,
        contactName: 'Dr. Emergency',
        contactPhone: '+1 (555) 010-9999',
        carNumber: '',
        userName: '',
      });
    }
    const r = rows[0];
    res.json({
      aggressiveAlert: !!r.aggressive_alert,
      contactName: r.contact_name || 'Dr. Emergency',
      contactPhone: r.contact_phone || '+1 (555) 010-9999',
      carNumber: r.car_number || '',
      userName: r.user_name || r.contact_name || '',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT save current user's settings
router.put('/', async (req, res) => {
  try {
    const { aggressiveAlert, contactName, contactPhone, carNumber, userName } = req.body;
    await pool.query(
      `INSERT INTO user_settings (user_id, contact_name, contact_phone, car_number, user_name, aggressive_alert)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         contact_name = VALUES(contact_name),
         contact_phone = VALUES(contact_phone),
         car_number = VALUES(car_number),
         user_name = VALUES(user_name),
         aggressive_alert = VALUES(aggressive_alert)`,
      [
        req.userId,
        contactName ?? 'Dr. Emergency',
        contactPhone ?? '+1 (555) 010-9999',
        carNumber ?? '',
        userName ?? contactName ?? '',
        aggressiveAlert !== false ? 1 : 0,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

module.exports = router;
