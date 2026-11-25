const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;
let server;
let api;
let poliId;
let dokterId;
let daftarId;
let token;

async function panggil(jalur, opsi = {}) {
  const { tanpaToken, ...sisa } = opsi;
  const headers = { 'content-type': 'application/json', ...(sisa.headers || {}) };
  if (token && !tanpaToken) headers.authorization = `Bearer ${token}`;
  const res = await fetch(api + jalur, { ...sisa, headers });
  return { status: res.status, body: await res.json() };
}

const tanggalHariIni = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('siklinik');
  const app = require('../app');
  server = app.listen(0);
  await once(server, 'listening');
  api = `http://127.0.0.1:${server.address().port}/api`;

  const daftar = await fetch(`${api}/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ nama: 'Admin Uji', email: 'admin@uji.local', password: 'rahasia123' }),
  });
  token = (await daftar.json()).token;
});

after(async () => {
  if (server) server.close();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

test('SiKlinik API', async (t) => {
  await t.test('health', async () => {
    const r = await panggil('/health');
    assert.equal(r.status, 200);
    assert.equal(r.body.ok, true);
  });

  await t.test('autentikasi JWT', async () => {
    const dobel = await panggil('/auth/register', {
      tanpaToken: true,
      method: 'POST',
      body: JSON.stringify({ nama: 'Admin Uji', email: 'admin@uji.local', password: 'rahasia123' }),
    });
    assert.equal(dobel.status, 409);

    const salah = await panggil('/auth/login', {
      tanpaToken: true,
      method: 'POST',
      body: JSON.stringify({ email: 'admin@uji.local', password: 'salahbanget' }),
    });
    assert.equal(salah.status, 401);

    const masuk = await panggil('/auth/login', {
      tanpaToken: true,
      method: 'POST',
      body: JSON.stringify({ email: 'admin@uji.local', password: 'rahasia123' }),
    });
    assert.equal(masuk.status, 200);
    assert.ok(masuk.body.token);
    assert.equal(masuk.body.user.password, undefined);

    const tanpa = await panggil('/poli', { tanpaToken: true, method: 'POST', body: JSON.stringify({ kode: 'X', nama: 'X' }) });
    assert.equal(tanpa.status, 401);

    const palsu = await panggil('/auth/me', { tanpaToken: true, headers: { authorization: 'Bearer palsu' } });
    assert.equal(palsu.status, 401);

    const saya = await panggil('/auth/me');
    assert.equal(saya.body.user.email, 'admin@uji.local');
  });

  await t.test('validasi poli gagal', async () => {
    const r = await panggil('/poli', { method: 'POST', body: JSON.stringify({ kode: 'X' }) });
    assert.equal(r.status, 400);
    assert.ok(r.body.detail.includes('Nama poli wajib diisi'));
  });

  await t.test('buat poli', async () => {
    const r = await panggil('/poli', { method: 'POST', body: JSON.stringify({ kode: 'umum', nama: 'Poli Umum', kapasitas: 30 }) });
    assert.equal(r.status, 201);
    assert.equal(r.body.kode, 'UMUM');
    poliId = r.body._id;
  });

  await t.test('kode poli duplikat ditolak', async () => {
    const r = await panggil('/poli', { method: 'POST', body: JSON.stringify({ kode: 'UMUM', nama: 'Poli Umum 2' }) });
    assert.equal(r.status, 409);
  });

  await t.test('cari poli', async () => {
    const r = await panggil('/poli?q=umum');
    assert.equal(r.body.length, 1);
  });

  await t.test('buat dokter + populate poli', async () => {
    const r = await panggil('/dokter', {
      method: 'POST',
      body: JSON.stringify({
        nama: 'dr. Sari Wulandari',
        sip: 'SIP-001',
        spesialisasi: 'Dokter Umum',
        poliId,
        jadwal: [{ hari: 'senin', mulai: '08:00', selesai: '12:00' }],
      }),
    });
    assert.equal(r.status, 201);
    dokterId = r.body._id;

    const d = await panggil(`/dokter?poliId=${poliId}`);
    assert.equal(d.body.length, 1);
    assert.equal(d.body[0].poliId.nama, 'Poli Umum');
  });

  await t.test('validasi pendaftaran gagal', async () => {
    const r = await panggil('/pendaftaran', {
      method: 'POST',
      body: JSON.stringify({ dokterId, pasien: { nim: '2428240089' } }),
    });
    assert.equal(r.status, 400);
  });

  await t.test('daftar antrean nomor 1 dan 2', async () => {
    const data = {
      pasien: { nama: 'Aldi Yonatan', nim: '2428240089', telepon: '08123456789' },
      dokterId,
      keluhan: 'Demam',
    };
    const satu = await panggil('/pendaftaran', { method: 'POST', body: JSON.stringify(data) });
    assert.equal(satu.status, 201);
    assert.equal(satu.body.nomor, 1);
    assert.equal(satu.body.status, 'menunggu');
    daftarId = satu.body._id;

    const dua = await panggil('/pendaftaran', { method: 'POST', body: JSON.stringify(data) });
    assert.equal(dua.body.nomor, 2);
  });

  await t.test('filter status dan tanggal', async () => {
    const status = await panggil('/pendaftaran?status=menunggu&sort=nomor');
    assert.equal(status.body.length, 2);
    assert.equal(status.body[0].nomor, 1);

    const tanggal = await panggil(`/pendaftaran?tanggal=${tanggalHariIni}`);
    assert.equal(tanggal.body.length, 2);
  });

  await t.test('detail pendaftaran ter-populate', async () => {
    const r = await panggil(`/pendaftaran/${daftarId}`);
    assert.equal(r.body.dokterId.nama, 'dr. Sari Wulandari');
    assert.equal(r.body.poliId.nama, 'Poli Umum');
  });

  await t.test('ubah status jadi dipanggil', async () => {
    const r = await panggil(`/pendaftaran/${daftarId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'dipanggil' }) });
    assert.equal(r.body.status, 'dipanggil');
    assert.ok(r.body.dipanggilAt);
  });

  await t.test('status tidak dikenal ditolak', async () => {
    const r = await panggil(`/pendaftaran/${daftarId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'hilang' }) });
    assert.equal(r.status, 400);
  });

  await t.test('ID tidak valid dan data tidak ditemukan', async () => {
    assert.equal((await panggil('/poli/123')).status, 400);
    assert.equal((await panggil('/poli/000000000000000000000000')).status, 404);
  });

  await t.test('rute dan JSON tidak valid', async () => {
    assert.equal((await panggil('/tidak-ada')).status, 404);
    const rusak = await fetch(api + '/poli', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
    assert.equal(rusak.status, 400);
  });

  await t.test('hapus pendaftaran', async () => {
    assert.equal((await panggil(`/pendaftaran/${daftarId}`, { method: 'DELETE' })).status, 200);
    assert.equal((await panggil(`/pendaftaran/${daftarId}`)).status, 404);
  });
});