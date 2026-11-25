const jwt = require('jsonwebtoken');
const User = require('../models/user');

/** Verifikasi header "Authorization: Bearer <token>", lalu tempel dokumen user di req.user. */
module.exports = async function wajibToken(req, res, next) {
  const [skema, token] = (req.headers.authorization || '').split(' ');
  if (skema !== 'Bearer' || !token) return res.status(401).json({ message: 'Token tidak ada, silakan login' });

  try {
    const isi = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(isi.id);
    if (!user) return res.status(401).json({ message: 'Token tidak valid' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa' });
  }
};