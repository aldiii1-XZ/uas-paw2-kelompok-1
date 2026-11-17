function notFound(req, res) {
  res.status(404).json({ message: `Rute ${req.originalUrl} tidak ditemukan` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Format JSON tidak valid' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID tidak valid' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Data tidak valid',
      detail: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'data';
    return res.status(409).json({ message: `${field} sudah dipakai` });
  }
  if (err.status) return res.status(err.status).json({ message: err.message });

  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server' });
}

module.exports = { notFound, errorHandler };