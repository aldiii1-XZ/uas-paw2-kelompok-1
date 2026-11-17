const mongoose = require('mongoose');

let koneksi = null;

/** Sambung sekali saja; dipakai ulang oleh request berikutnya (termasuk serverless). */
async function sambung() {
  if (!koneksi) {
    koneksi = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  }
  try {
    await koneksi;
  } catch (err) {
    koneksi = null; // biar request berikutnya mencoba lagi, bukan memakai promise gagal
    throw err;
  }
  return mongoose.connection;
}

module.exports = sambung;