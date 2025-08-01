// 1. Import library
import express from 'express';
import mysql from 'mysql2/promise'; // Menggunakan versi promise
import cors from 'cors';
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken'; 

// 2. Setup aplikasi Express
const app = express();
const port = 3001;
const JWT_SECRET_KEY = 'cacamovieday26'; 

// 3. Middleware
app.use(cors());
app.use(express.json());

// 4. Konfigurasi Database
// Pastikan kredensial ini sesuai dengan yang ada di docker-compose.yml
const dbPool = mysql.createPool({
  host: 'localhost', 
  port: 3307, 
  user: 'movieday',
  password: 'cacamovieday26', 
  database: 'movieday_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware untuk otentikasi token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user; // Menambahkan payload user ke object request
        next();
    });
};

// === API ENDPOINTS ===

// -- Otentikasi --
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password || password.length < 6) {
            return res.status(400).json({ message: "Data tidak valid. Pastikan semua field terisi dan password minimal 6 karakter." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)';
        await dbPool.query(query, [name, email, hashedPassword]);
        res.status(201).json({ message: "Registrasi berhasil!" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Email sudah terdaftar." });
        }
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await dbPool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ message: "Email atau password salah." });
        
        const user = users[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordCorrect) return res.status(401).json({ message: "Email atau password salah." });

        const userPayload = { id: user.user_id, name: user.name, email: user.email };
        const token = jwt.sign(userPayload, JWT_SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, user: userPayload });
    } catch (error) { res.status(500).json({ message: "Terjadi kesalahan pada server." }); }
});

app.get('/api/cities', async (req, res) => {
    try {
        const [rows] = await dbPool.query('SELECT city_id, city_name FROM cities ORDER BY city_name');
        res.json(rows);
    } catch (err) { res.status(500).json({ message: 'Gagal mengambil data kota' }); }
});

// FUNGSI PEMBANTU YANG SUDAH DIPERBAIKI
const getmoviesByStatus = async (req, res, status) => {
    const { city } = req.query;
    if (!city) {
        return res.status(400).json({ message: 'Parameter kota diperlukan' });
    }
    try {

        const query = `
            SELECT DISTINCT m.*
            FROM movies m
            JOIN showtimes s ON m.movie_id = s.movie_id
            JOIN cinemas c ON s.cinema_id = c.cinema_id
            JOIN cities ci ON c.city_id = ci.city_id
            WHERE ci.city_name = ? AND m.status = ?
            LIMIT 7;
        `;

        const [movies] = await dbPool.query(query, [city, status]);
        res.json(movies);
    } catch (err) {
        console.error(`Error saat mengambil film ${status} untuk kota ${city}:`, err);
        res.status(500).json({ message: `Gagal mengambil film ${status}` });
    }
};

app.get('/api/movies/now-showing', (req, res) => getmoviesByStatus(req, res, 'now_showing'));

app.get('/api/movies/upcoming', async (req, res) => {
    try {
        const query = `
            SELECT * FROM movies
            WHERE status = 'upcoming'
            LIMIT 7;
        `;
        const [movies] = await dbPool.query(query);
        res.json(movies);
    } catch (err) {
        console.error(`Error saat mengambil film upcoming:`, err);
        res.status(500).json({ message: 'Gagal mengambil film upcoming' });
    }
});


app.get('/api/cinemas', async (req, res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: 'Parameter kota diperlukan' });
    try {
        const query = `SELECT c.cinema_id, c.cinema_name FROM cinemas c JOIN cities ci ON c.city_id = ci.city_id WHERE ci.city_name = ? ORDER BY c.cinema_name LIMIT 3;`;
        const [cinemas] = await dbPool.query(query, [city]);
        res.json(cinemas);
    } catch (err) { res.status(500).json({ message: 'Gagal mengambil data bioskop' }); }
});

app.get('/api/showtimes', async (req, res) => {
    const { movieId, cinemaId } = req.query;
    if (!movieId || !cinemaId) return res.status(400).json({ message: 'Parameter movieId dan cinemaId diperlukan' });
    try {
        const query = `
            SELECT showtime_id, show_datetime FROM showtimes
            WHERE movie_id = ? AND cinema_id = ?
            ORDER BY show_datetime
            LIMIT 4;
        `;
        const [showtimes] = await dbPool.query(query, [movieId, cinemaId]);
        const formattedshowtimes = showtimes.map(st => ({
            showtime_id: st.showtime_id,
            time_string: new Date(st.show_datetime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
        }));
        res.json(formattedshowtimes);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil jadwal tayang' });
    }
});

app.get('/api/booked-seats', async (req, res) => {
    const { showtimeId } = req.query;
    if (!showtimeId) return res.status(400).json({ message: 'Parameter showtimeId diperlukan' });
    try {
        const [seats] = await dbPool.query('SELECT seat_id FROM bookseats WHERE showtime_id = ?', [showtimeId]);
        res.json(seats.map(s => s.seat_id));
    } catch (err) { res.status(500).json({ message: 'Gagal mengambil data kursi' }); }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
    const { showtimeId, seats } = req.body;
    const userId = req.user.id; 

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const [showtimeInfo] = await connection.query('SELECT m.price FROM movies m JOIN showtimes s ON m.movie_id = s.movie_id WHERE s.showtime_id = ?', [showtimeId]);
        if(showtimeInfo.length === 0) throw new Error("Jadwal tidak valid");
        
        const pricePerTicket = showtimeInfo[0].price;
        const totalTickets = seats.length;
        const totalPrice = totalTickets * pricePerTicket;
        const bookingCode = `MD${Date.now().toString().slice(-8)}`;

        const [bookingResult] = await connection.query(
            'INSERT INTO bookings (user_id, showtime_id, booking_code, total_tickets, total_price, payment_status) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, showtimeId, bookingCode, totalTickets, totalPrice, 'paid']
        );
        const bookingId = bookingResult.insertId;

        const seatValues = seats.map(seatId => [bookingId, showtimeId, seatId]);
        await connection.query('INSERT INTO bookseats (booking_id, showtime_id, seat_id) VALUES ?', [seatValues]);
        
        await connection.commit();
        
        res.status(201).json({ 
            message: "Booking berhasil!",
            bookingCode: bookingCode,
            totalPrice: totalPrice 
        });
    } catch (error) {
        await connection.rollback();
        if(error.code === 'ER_DUP_ENTRY') return res.status(409).json({message: "Satu atau lebih kursi yang dipilih sudah tidak tersedia."});
        res.status(500).json({ message: "Gagal memproses booking." });
    } finally {
        connection.release();
    }
});


// Jalankan Server
app.listen(port, () => {
  console.log(`Server backend MovieDay berjalan di http://localhost:${port}`);
});
