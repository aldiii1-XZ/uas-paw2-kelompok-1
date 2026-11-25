const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skema = new mongoose.Schema(
  {
    nama: { type: String, required: [true, 'Nama wajib diisi'], trim: true },
    email: {
      type: String,
      required: [true, 'Email wajib diisi'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Format email tidak valid'],
    },
    password: {
      type: String,
      required: [true, 'Password wajib diisi'],
      minlength: [6, 'Password minimal 6 karakter'],
      select: false,
    },
    role: { type: String, enum: ['admin', 'petugas'], default: 'admin' },
  },
  { timestamps: true },
);

skema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
});

skema.methods.cekPassword = function (teks) {
  return bcrypt.compare(teks, this.password);
};

skema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', skema);