require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const sambung = require('./db');

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }),
);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: ['terputus', 'tersambung', 'menyambung', 'memutus'][mongoose.connection.readyState] || 'tidak dikenal' });
});

// Serverless: sambung saat request pertama, bukan saat modul dimuat.
app.use(async (req, res, next) => {
  try {
    await sambung();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/poli', require('./routes/poli'));
app.use('/api/dokter', require('./routes/dokter'));
app.use('/api/pendaftaran', require('./routes/pendaftaran'));

app.use(require('./middlewares/error').notFound);
app.use(require('./middlewares/error').errorHandler);

module.exports = app;