const mongoose = require('mongoose');
const { Schema } = mongoose;

const jadwal = new Schema(
  {
    hari: { type: String, required: true, enum: ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'] },
    mulai: { type: String, required: true, match: [/^\d{2}:\d{2}$/, 'Format jam harus HH:MM'] },
    selesai: { type: String, required: true, match: [/^\d{2}:\d{2}$/, 'Format jam harus HH:MM'] },
  },
  { _id: false },
);

const skema = new Schema(
  {
    nama: { type: String, required: [true, 'Nama dokter wajib diisi'], trim: true },
    sip: { type: String, required: [true, 'SIP wajib diisi'], unique: true, trim: true },
    spesialisasi: { type: String, required: [true, 'Spesialisasi wajib diisi'], trim: true },
    poliId: { type: Schema.Types.ObjectId, ref: 'Poli', required: [true, 'Poli wajib dipilih'] },
    telepon: { type: String, trim: true, default: '' },
    jadwal: { type: [jadwal], default: [] },
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Dokter', skema);