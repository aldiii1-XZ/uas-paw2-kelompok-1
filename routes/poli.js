const router = require('express').Router();
const c = require('../controllers/poliController');

router.get('/', c.daftar);
router.get('/:id', c.satu);
router.post('/', c.buat);
router.put('/:id', c.ubah);
router.delete('/:id', c.hapus);

module.exports = router;