const mongoose = require('mongoose');

const skema = new mongoose.Schema(
  {
    kode: { type: String, required: [true, 'Kode poli wajib diisi'], unique: true, uppercase: true, trim: true },
    nama: { type: String, required: [true, 'Nama poli wajib diisi'], trim: true },
    deskripsi: { type: String, trim: true, default: '' },
    kapasitas: { type: Number, min: [0, 'Kapasitas tidak boleh negatif'], default: 0 },
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Poli', skema);