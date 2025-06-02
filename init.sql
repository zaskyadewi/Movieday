USE movieday_db; 

-- Cities Table
CREATE TABLE IF NOT EXISTS Cities (
    city_id INT AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cinemas Table
CREATE TABLE IF NOT EXISTS Cinemas (
    cinema_id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    cinema_name VARCHAR(150) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES Cities(city_id) ON DELETE CASCADE
);

-- Movies Table
CREATE TABLE IF NOT EXISTS Movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    synopsis TEXT,
    poster_url VARCHAR(255),
    duration_minutes INT,
    release_date DATE,
    rating VARCHAR(10),
    status ENUM('now_showing', 'upcoming', 'ended') DEFAULT 'upcoming',
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Showtimes Table
CREATE TABLE IF NOT EXISTS Showtimes (
    showtime_id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    cinema_id INT NOT NULL,
    show_datetime DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (cinema_id) REFERENCES Cinemas(cinema_id) ON DELETE CASCADE,
    UNIQUE KEY unique_showtime (movie_id, cinema_id, show_datetime)
);

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS Bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    showtime_id INT NOT NULL,
    booking_code VARCHAR(20) NOT NULL UNIQUE,
    total_tickets INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    qris_data TEXT,
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (showtime_id) REFERENCES Showtimes(showtime_id) ON DELETE RESTRICT
);

-- BookedSeats Table
CREATE TABLE IF NOT EXISTS BookedSeats (
    booked_seat_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    showtime_id INT NOT NULL, 
    seat_row CHAR(1) NOT NULL,
    seat_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (showtime_id) REFERENCES Showtimes(showtime_id) ON DELETE CASCADE,
    UNIQUE KEY unique_booked_seat_per_showtime (showtime_id, seat_row, seat_number)
);

-- Data Awal

-- Contoh memasukkan kota
INSERT INTO Cities (city_name) VALUES ('Jakarta') ON DUPLICATE KEY UPDATE city_name=VALUES(city_name);
INSERT INTO Cities (city_name) VALUES ('Bandung') ON DUPLICATE KEY UPDATE city_name=VALUES(city_name);
INSERT INTO Cities (city_name) VALUES ('Surabaya') ON DUPLICATE KEY UPDATE city_name=VALUES(city_name);

-- Contoh memasukkan bioskop (asumsi city_id sudah ada dan sesuai)
-- Pastikan nilai city_id (1, 2, 3) sesuai dengan ID yang sebenarnya dihasilkan saat INSERT INTO Cities.
-- Untuk skrip inisialisasi sederhana, kita bisa berasumsi urutannya.
INSERT INTO Cinemas (city_id, cinema_name, address) VALUES
(1, 'Movieday Grand Indonesia', 'Jl. MH Thamrin No.1, Jakarta Pusat'),
(1, 'Movieday Plaza Senayan', 'Jl. Asia Afrika No.8, Jakarta Pusat'),
(2, 'Movieday Paris Van Java', 'Jl. Sukajadi No.131-139, Bandung'),
(3, 'Movieday Tunjungan Plaza 5', 'Jl. Jend. Basuki Rachmat No.8-12, Surabaya');

-- Contoh memasukkan film
INSERT INTO Movies (title, synopsis, poster_url, duration_minutes, release_date, rating, status, price) VALUES
('Petualangan Si Kucing Kota', 'Seekor kucing pemberani menjelajahi hiruk pikuk kota Jakarta.', 'https://via.placeholder.com/200x300.png?text=Kucing+Kota+NS', 90, '2025-01-15', 'SU', 'now_showing', 50000.00),
('Misteri Jembatan Lama', 'Sekelompok remaja mengungkap rahasia kelam di balik jembatan tua.', 'https://via.placeholder.com/200x300.png?text=Misteri+Jembatan+NS', 105, '2025-02-01', 'R13+', 'now_showing', 55000.00),
('Robot Genesis: Awakening', 'Pertarungan antar robot raksasa menentukan nasib umat manusia.', 'https://via.placeholder.com/200x300.png?text=Robot+Genesis+UC', 120, '2025-06-20', 'R13+', 'upcoming', 60000.00);

-- Contoh memasukkan pengguna (password di-hash di aplikasi, ini hanya contoh)
INSERT INTO Users (name, email, password_hash, phone_number) VALUES
('Andi Budi', 'andi@example.com', 'hashed_password_andi', '081234567890'),
('Citra Dewi', 'citra@example.com', 'hashed_password_citra', '081209876543');

-- Contoh memasukkan jadwal tayang (asumsi movie_id dan cinema_id sudah ada dan sesuai)
-- Pastikan nilai movie_id (1, 2) dan cinema_id (1, 3) sesuai dengan ID yang sebenarnya.
INSERT INTO Showtimes (movie_id, cinema_id, show_datetime) VALUES
(1, 1, '2025-05-28 12:00:00'),
(1, 1, '2025-05-28 15:00:00'),
(1, 1, '2025-05-28 18:00:00'),
(1, 1, '2025-05-28 21:00:00'),
(2, 1, '2025-05-28 13:00:00'), 
(1, 3, '2025-05-28 14:00:00');