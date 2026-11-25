const router = require('express').Router();
const c = require('../controllers/authController');
const wajibToken = require('../middlewares/auth');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', wajibToken, c.saya);

module.exports = router;