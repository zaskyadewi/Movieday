// Di dalam file Movieday/server/server.js

// 1. Import library yang dibutuhkan
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// 2. Buat instance aplikasi Express
const app = express();
const port = 3001; // Port backend Anda

// 3. Middleware
app.use(cors()); // Mengizinkan Cross-Origin Resource Sharing
const path = require('path'); // Import modul 'path' di bagian atas file Anda

// 4. Konfigurasi Koneksi Database MySQL menggunakan Pool
const dbPool = mysql.createPool({
  host: process.env.DB_HOST,       // Akan menjadi 'mysqldb' dari environment Docker Compose
  port: 3306,                      // Port INTERNAL MySQL di jaringan Docker
  user: process.env.DB_USER,       // Akan menjadi 'movieday' dari environment
  password: process.env.DB_PASSWORD, // Akan menjadi password untuk 'movieday' dari environment
  database: process.env.DB_NAME,   // Akan menjadi 'movieday_db' dari environment
  // ...
}).promise();

// 5. Fungsi untuk Tes Koneksi Database (opsional, tapi bagus untuk debugging awal)
async function testDbConnection() {
  try {
    const connection = await dbPool.getConnection();
    console.log('Berhasil terhubung ke database MySQL (movieday_db)!');
    connection.release(); // Kembalikan koneksi ke pool
  } catch (err) {
    console.error('Error saat menghubungkan ke database:', err);
  }
}
testDbConnection(); // Panggil fungsi tes koneksi saat server dimulai

// --- API ENDPOINTS ---

// Endpoint untuk mengambil daftar kota
app.get('/api/cities', async (req, res) => {
  try {
    const [rows] = await dbPool.query('SELECT city_id, city_name FROM Cities');
    res.json(rows);
  } catch (err) {
    console.error('Error saat mengambil data kota:', err);
    res.status(500).json({ error: 'Gagal mengambil data kota dari server.' });
  }
});

// Endpoint untuk mengambil film "Now Showing" berdasarkan nama kota
app.get('/api/movies/now-showing', async (req, res) => {
  const cityName = req.query.city;
  if (!cityName) {
    return res.status(400).json({ error: 'Parameter query "city" diperlukan.' });
  }
  try {
    const query = `
      SELECT DISTINCT m.movie_id, m.title, m.synopsis, m.poster_url, m.duration_minutes, m.release_date, m.rating, m.status, m.price
      FROM Movies m
      JOIN Showtimes s ON m.movie_id = s.movie_id
      JOIN Cinemas cn ON s.cinema_id = cn.cinema_id
      JOIN Cities ct ON cn.city_id = ct.city_id
      WHERE ct.city_name = ? AND m.status = 'now_showing';
    `;
    const [movies] = await dbPool.query(query, [cityName]);
    res.json(movies.length > 0 ? movies : []); // Kirim array kosong jika tidak ada
  } catch (err) {
    console.error(`Error saat mengambil film "Now Showing" untuk kota ${cityName}:`, err);
    res.status(500).json({ error: 'Gagal mengambil data film "Now Showing".' });
  }
});

// Endpoint untuk mengambil film "Upcoming" berdasarkan nama kota
app.get('/api/movies/upcoming', async (req, res) => {
  const cityName = req.query.city;
  if (!cityName) {
    return res.status(400).json({ error: 'Parameter query "city" diperlukan.' });
  }
  try {
    // Query ini mengambil film yang statusnya 'upcoming'.
    // Jika film upcoming belum tentu punya jadwal/bioskop, Anda bisa menyederhanakan query ini
    // atau menggunakan LEFT JOIN jika ingin tetap mencoba menghubungkan dengan kota.
    const query = `
      SELECT DISTINCT m.movie_id, m.title, m.synopsis, m.poster_url, m.duration_minutes, m.release_date, m.rating, m.status, m.price
      FROM Movies m
      LEFT JOIN Showtimes s ON m.movie_id = s.movie_id
      LEFT JOIN Cinemas cn ON s.cinema_id = cn.cinema_id
      LEFT JOIN Cities ct ON cn.city_id = ct.city_id
      WHERE (ct.city_name = ? OR cn.cinema_id IS NULL) AND m.status = 'upcoming';
      -- (ct.city_name = ? OR cn.cinema_id IS NULL) -> untuk kasus film upcoming global atau spesifik kota
      -- Jika hanya ingin upcoming yang sudah ada jadwalnya di kota itu, gunakan INNER JOIN dan hilangkan OR cn.cinema_id IS NULL
    `;
    const [movies] = await dbPool.query(query, [cityName]);
    res.json(movies.length > 0 ? movies : []);
  } catch (err) {
    console.error(`Error saat mengambil film "Upcoming" untuk kota ${cityName}:`, err);
    res.status(500).json({ error: 'Gagal mengambil data film "Upcoming".' });
  }
});

// Endpoint untuk mengambil daftar bioskop berdasarkan nama kota
app.get('/api/cinemas', async (req, res) => {
  const cityName = req.query.city;
  if (!cityName) {
    return res.status(400).json({ error: 'Parameter query "city" diperlukan.' });
  }
  try {
    const query = `
      SELECT cn.cinema_id, cn.cinema_name, cn.address
      FROM Cinemas cn
      JOIN Cities ct ON cn.city_id = ct.city_id
      WHERE ct.city_name = ?;
    `;
    const [cinemas] = await dbPool.query(query, [cityName]);
    res.json(cinemas.length > 0 ? cinemas : []);
  } catch (err) {
    console.error(`Error saat mengambil data bioskop untuk kota ${cityName}:`, err);
    res.status(500).json({ error: 'Gagal mengambil data bioskop.' });
  }
});

// Endpoint untuk mengambil jadwal tayang berdasarkan ID film dan ID bioskop
// Contoh URL: /api/showtimes?movieId=1&cinemaId=1
app.get('/api/showtimes', async (req, res) => {
  const movieId = req.query.movieId;
  const cinemaId = req.query.cinemaId;

  if (!movieId || !cinemaId) {
    return res.status(400).json({ error: 'Parameter query "movieId" dan "cinemaId" diperlukan.' });
  }

  try {
    // Query untuk mengambil jadwal tayang yang relevan
    // Anda mungkin ingin memfilter berdasarkan tanggal juga di masa depan
    const query = `
      SELECT showtime_id, show_datetime
      FROM Showtimes
      WHERE movie_id = ? AND cinema_id = ?
      ORDER BY show_datetime ASC;
    `;
    const [showtimesData] = await dbPool.query(query, [movieId, cinemaId]);

    // Format hanya jam dan menit (HH:MM)
    const formattedShowtimes = showtimesData.map(st => {
        const dateObj = new Date(st.show_datetime);
        return `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
    });

    res.json(formattedShowtimes.length > 0 ? formattedShowtimes : []);
  } catch (err) {
    console.error(`Error saat mengambil jadwal tayang untuk movieId ${movieId} dan cinemaId ${cinemaId}:`, err);
    res.status(500).json({ error: 'Gagal mengambil data jadwal tayang.' });
  }
});


// Anda perlu menambahkan endpoint untuk:
// - POST /api/register (registrasi user)
// - POST /api/login (login user)
// - POST /api/bookings (membuat booking)
// - GET /api/bookings/:bookingId (detail booking user tertentu, memerlukan otentikasi)
// - GET /api/movies/:movieId (untuk detail spesifik satu film jika diperlukan di halaman booking)

// Jalankan Server Backend
app.listen(port, () => {
  console.log(`Server backend MovieDay berjalan di http://localhost:${port}`);
  console.log('Gunakan Ctrl+C untuk menghentikan server.');
});