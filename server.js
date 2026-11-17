require('dotenv').config();
const app = require('./app');
const sambung = require('./db');

const PORT = process.env.PORT || 3001;

sambung()
  .then(() => {
    app.listen(PORT, () => console.log(`SiKlinik API jalan di http://127.0.0.1:${PORT}`));
  })
  .catch((err) => {
    console.error('Gagal tersambung ke MongoDB:', err.message);
    process.exit(1);
  });