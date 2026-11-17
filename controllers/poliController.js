const Poli = require('../models/poli');

function filterCari(q) {
  return q ? { nama: new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } : {};
}

exports.daftar = async (req, res) => {
  const filter = { ...filterCari(req.query.q) };
  if (req.query.aktif !== undefined) filter.aktif = req.query.aktif === 'true';
  const sort = req.query.sort ? { [req.query.sort]: 1 } : { kode: 1 };
  res.json(await Poli.find(filter).sort(sort));
};

exports.satu = async (req, res) => {
  const poli = await Poli.findById(req.params.id);
  if (!poli) return res.status(404).json({ message: 'Poli tidak ditemukan' });
  res.json(poli);
};

exports.buat = async (req, res) => {
  res.status(201).json(await Poli.create(req.body));
};

exports.ubah = async (req, res) => {
  const poli = await Poli.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
  if (!poli) return res.status(404).json({ message: 'Poli tidak ditemukan' });
  res.json(poli);
};

exports.hapus = async (req, res) => {
  const poli = await Poli.findByIdAndDelete(req.params.id);
  if (!poli) return res.status(404).json({ message: 'Poli tidak ditemukan' });
  res.json({ message: 'Poli dihapus' });
};