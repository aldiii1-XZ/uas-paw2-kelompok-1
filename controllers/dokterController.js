const Dokter = require('../models/dokter');

exports.daftar = async (req, res) => {
  const filter = {};
  if (req.query.poliId) filter.poliId = req.query.poliId;
  if (req.query.aktif !== undefined) filter.aktif = req.query.aktif === 'true';
  if (req.query.q) filter.nama = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const sort = req.query.sort ? { [req.query.sort]: 1 } : { nama: 1 };
  res.json(await Dokter.find(filter).sort(sort).populate('poliId', 'kode nama'));
};

exports.satu = async (req, res) => {
  const dokter = await Dokter.findById(req.params.id).populate('poliId', 'kode nama');
  if (!dokter) return res.status(404).json({ message: 'Dokter tidak ditemukan' });
  res.json(dokter);
};

exports.buat = async (req, res) => {
  res.status(201).json(await Dokter.create(req.body));
};

exports.ubah = async (req, res) => {
  const dokter = await Dokter.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
  if (!dokter) return res.status(404).json({ message: 'Dokter tidak ditemukan' });
  res.json(dokter);
};

exports.hapus = async (req, res) => {
  const dokter = await Dokter.findByIdAndDelete(req.params.id);
  if (!dokter) return res.status(404).json({ message: 'Dokter tidak ditemukan' });
  res.json({ message: 'Dokter dihapus' });
};