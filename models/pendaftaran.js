const mongoose = require('mongoose');
const { Schema } = mongoose;

const pasien = new Schema(
  {
    nama: { type: String, required: [true, 'Nama pasien wajib diisi'], trim: true },
    nim: { type: String, required: [true, 'NIM/NIP pasien wajib diisi'], trim: true },
    telepon: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

const skema = new Schema(
  {
    kode: { type: String, required: true, unique: true, trim: true },
    pasien: { type: pasien, required: true },
    poliId: { type: Schema.Types.ObjectId, ref: 'Poli', required: [true, 'Poli wajib dipilih'] },
    dokterId: { type: Schema.Types.ObjectId, ref: 'Dokter', required: [true, 'Dokter wajib dipilih'] },
    tanggal: { type: Date, required: true, default: Date.now },
    nomor: { type: Number, required: true, min: 1 },
    keluhan: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['menunggu', 'dipanggil', 'selesai', 'batal'], default: 'menunggu' },
    dipanggilAt: { type: Date, default: null },
    selesaiAt: { type: Date, default: null },
  },
  { timestamps: true },
);

skema.index({ poliId: 1, tanggal: 1, nomor: 1 }, { unique: true });

module.exports = mongoose.model('Pendaftaran', skema);