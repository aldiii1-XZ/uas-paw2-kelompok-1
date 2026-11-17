const Pendaftaran = require('../models/pendaftaran');
const Dokter = require('../models/dokter');

const STATUS = ['menunggu', 'dipanggil', 'selesai', 'batal'];

function batasHari(nilai) {
  const mulai = new Date(`${nilai}T00:00:00.000+07:00`);
  if (Number.isNaN(mulai.getTime())) return null;
  return { $gte: mulai, $lt: new Date(mulai.getTime() + 86400000) };
}

exports.daftar = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.poliId) filter.poliId = req.query.poliId;
  if (req.query.dokterId) filter.dokterId = req.query.dokterId;
  if (req.query.tanggal) {
    const batas = batasHari(req.query.tanggal);
    if (!batas) return res.status(400).json({ message: 'Format tanggal harus YYYY-MM-DD' });
    filter.tanggal = batas;
  }
  const sort = req.query.sort ? { [req.query.sort]: 1 } : { tanggal: 1, nomor: 1 };
  res.json(
    await Pendaftaran.find(filter)
      .sort(sort)
      .populate('poliId', 'kode nama')
      .populate('dokterId', 'nama sip spesialisasi'),
  );
};

exports.satu = async (req, res) => {
  const data = await Pendaftaran.findById(req.params.id)
    .populate('poliId', 'kode nama')
    .populate('dokterId', 'nama sip spesialisasi');
  if (!data) return res.status(404).json({ message: 'Pendaftaran tidak ditemukan' });
  res.json(data);
};

exports.buat = async (req, res) => {
  const { dokterId, poliId, tanggal } = req.body;
  const dokter = await Dokter.findById(dokterId);
  if (!dokter) return res.status(404).json({ message: 'Dokter tidak ditemukan' });
  if (poliId && String(dokter.poliId) !== String(poliId)) {
    return res.status(400).json({ message: 'Dokter tidak bertugas di poli tersebut' });
  }

  const hari = tanggal ? new Date(tanggal) : new Date();
  const awalHari = new Date(hari);
  awalHari.setHours(0, 0, 0, 0);
  const akhirHari = new Date(awalHari.getTime() + 86400000);
  const terakhir = await Pendaftaran.findOne({
    poliId: dokter.poliId,
    tanggal: { $gte: awalHari, $lt: akhirHari },
  }).sort({ nomor: -1 });
  const nomor = (terakhir?.nomor || 0) + 1;

  const data = await Pendaftaran.create({
    ...req.body,
    poliId: dokter.poliId,
    nomor,
    kode: `K${Date.now().toString(36).toUpperCase()}${nomor}`,
  });
  res.status(201).json(data);
};

exports.ubah = async (req, res) => {
  const boleh = ['pasien', 'keluhan', 'tanggal'];
  const perubahan = {};
  for (const kunci of boleh) if (req.body[kunci] !== undefined) perubahan[kunci] = req.body[kunci];
  const data = await Pendaftaran.findByIdAndUpdate(req.params.id, perubahan, { returnDocument: 'after', runValidators: true });
  if (!data) return res.status(404).json({ message: 'Pendaftaran tidak ditemukan' });
  res.json(data);
};

exports.ubahStatus = async (req, res) => {
  const { status } = req.body;
  if (!STATUS.includes(status)) {
    return res.status(400).json({ message: `Status harus salah satu dari: ${STATUS.join(', ')}` });
  }
  const perubahan = { status };
  if (status === 'dipanggil') perubahan.dipanggilAt = new Date();
  if (status === 'selesai') perubahan.selesaiAt = new Date();

  const data = await Pendaftaran.findByIdAndUpdate(req.params.id, perubahan, { returnDocument: 'after', runValidators: true });
  if (!data) return res.status(404).json({ message: 'Pendaftaran tidak ditemukan' });
  res.json(data);
};

exports.hapus = async (req, res) => {
  const data = await Pendaftaran.findByIdAndDelete(req.params.id);
  if (!data) return res.status(404).json({ message: 'Pendaftaran tidak ditemukan' });
  res.json({ message: 'Pendaftaran dihapus' });
};