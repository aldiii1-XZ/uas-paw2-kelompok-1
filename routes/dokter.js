const router = require('express').Router();
const c = require('../controllers/dokterController');
const wajibToken = require('../middlewares/auth');

router.get('/', c.daftar);
router.get('/:id', c.satu);
router.post('/', wajibToken, c.buat);
router.put('/:id', wajibToken, c.ubah);
router.delete('/:id', wajibToken, c.hapus);

module.exports = router;