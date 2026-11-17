const router = require('express').Router();
const c = require('../controllers/pendaftaranController');

router.get('/', c.daftar);
router.get('/:id', c.satu);
router.post('/', c.buat);
router.put('/:id', c.ubah);
router.patch('/:id/status', c.ubahStatus);
router.delete('/:id', c.hapus);

module.exports = router;