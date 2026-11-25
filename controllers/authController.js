const jwt = require('jsonwebtoken');
const User = require('../models/user');

function buatToken(user) {
  if (!process.env.JWT_SECRET) throw Object.assign(new Error('JWT_SECRET belum diatur di environment'), { status: 500 });
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
}

exports.register = async (req, res) => {
  const { nama, email, password, role } = req.body;
  const user = await User.create({ nama, email, password, role });
  res.status(201).json({ user, token: buatToken(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email dan password wajib diisi' });

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.cekPassword(String(password)))) {
    return res.status(401).json({ message: 'Email atau password salah' });
  }
  res.json({ user, token: buatToken(user) });
};

exports.saya = async (req, res) => {
  res.json({ user: req.user });
};