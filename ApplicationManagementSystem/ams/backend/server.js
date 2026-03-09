require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app = express();

// ── Ensure uploads dir exists ────────────────────────────────
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/forms',        require('./routes/forms'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/upload',       require('./routes/upload'));
app.use('/api/admin',        require('./routes/admin'));

// Health check
app.get('/api/health', (_, res) => res.json({ success: true, message: 'AMS API running', time: new Date() }));

// Catch-all
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../frontend/login.html')));

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AMS Server running → http://localhost:${PORT}`);
  console.log(`📂 Frontend          → http://localhost:${PORT}/login.html`);
});

module.exports = app;
