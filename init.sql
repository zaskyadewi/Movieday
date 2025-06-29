-- Menggunakan database yang benar yang dibuat oleh Docker Compose
USE movieday_db;

-- (Bagian CREATE TABLE tetap sama, tidak perlu diubah)
CREATE TABLE IF NOT EXISTS Cities ( city_id INT AUTO_INCREMENT PRIMARY KEY, city_name VARCHAR(100) NOT NULL UNIQUE );
CREATE TABLE IF NOT EXISTS Cinemas ( cinema_id INT AUTO_INCREMENT PRIMARY KEY, city_id INT NOT NULL, cinema_name VARCHAR(150) NOT NULL, address TEXT, FOREIGN KEY (city_id) REFERENCES Cities(city_id) ON DELETE CASCADE );
CREATE TABLE IF NOT EXISTS Movies ( movie_id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, synopsis TEXT, poster_url VARCHAR(255), promo_image_url VARCHAR(255), trailer_url VARCHAR(255), duration_minutes INT, rating VARCHAR(10), status ENUM('now_showing', 'upcoming', 'ended') DEFAULT 'upcoming', price DECIMAL(10, 2) NOT NULL );
CREATE TABLE IF NOT EXISTS Showtimes ( showtime_id INT AUTO_INCREMENT PRIMARY KEY, movie_id INT NOT NULL, cinema_id INT NOT NULL, show_datetime DATETIME NOT NULL, FOREIGN KEY (movie_id) REFERENCES Movies(movie_id) ON DELETE CASCADE, FOREIGN KEY (cinema_id) REFERENCES Cinemas(cinema_id) ON DELETE CASCADE, UNIQUE KEY unique_showtime (movie_id, cinema_id, show_datetime) );
CREATE TABLE IF NOT EXISTS Users ( user_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(150) NOT NULL, email VARCHAR(100) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE IF NOT EXISTS Bookings ( booking_id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, showtime_id INT NOT NULL, booking_code VARCHAR(20) NOT NULL UNIQUE, total_tickets INT NOT NULL, total_price DECIMAL(10, 2) NOT NULL, payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending', booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE RESTRICT, FOREIGN KEY (showtime_id) REFERENCES Showtimes(showtime_id) ON DELETE RESTRICT );
CREATE TABLE IF NOT EXISTS BookedSeats ( booked_seat_id INT AUTO_INCREMENT PRIMARY KEY, booking_id INT NOT NULL, showtime_id INT NOT NULL, seat_id VARCHAR(5) NOT NULL, FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE, FOREIGN KEY (showtime_id) REFERENCES Showtimes(showtime_id) ON DELETE CASCADE, UNIQUE KEY unique_booked_seat_per_showtime (showtime_id, seat_id) );

-- === MEMASUKKAN DATA AWAL (SEEDING) ===

-- 1. Kota
INSERT IGNORE INTO Cities (city_id, city_name) VALUES (1, 'Jakarta'), (2, 'Bandung'), (3, 'Malang');

-- 2. Bioskop (3 per kota)
INSERT IGNORE INTO Cinemas (cinema_id, city_id, cinema_name) VALUES
(1, 1, 'Movieday Grand Indonesia'), (2, 1, 'Movieday Plaza Senayan'), (3, 1, 'Movieday Kelapa Gading'),
(4, 2, 'Movieday Paris Van Java'), (5, 2, 'Movieday Cihampelas Walk'), (6, 2, 'Movieday Braga XXI'),
(7, 3, 'Movieday Transmart MX'), (8, 3, 'Movieday Malang City Point'), (9, 3, 'Movieday Araya');

-- 3. Film (Semua data dari list film.txt)
INSERT IGNORE INTO Movies (movie_id, title, synopsis, poster_url, promo_image_url, trailer_url, duration_minutes, rating, status, price) VALUES
-- Film Promosi
[cite_start](1, 'SEVENTEEN RIGHT HERE WORLD TOUR IN CINEMAS', "Experience the unforgettable moments of SEVENTEEN [RIGHT HERE] WORLD TOUR on the big screen... [cite: 2, 3, 4, 5]", 'https://dx35vtwkllhj9.cloudfront.net/trafalgarreleasing/seventeen-right-here-world-tour-in-cinemas/images/regions/intl/onesheet.jpg', 'https://dx35vtwkllhj9.cloudfront.net/trafalgarreleasing/seventeen-right-here-world-tour-in-cinemas/images/regions/intl/header.jpg', 'https://www.youtube.com/watch?v=zArZTpp43as', 130, 'SU', 'now_showing', 75000.00),

-- Film Bandung
[cite_start](101, 'Youth Of May', "Kisah yang berlatar belakang Pemberontakan Gwangju tahun 1980, menggambarkan cinta antara dua orang muda di tengah kondisi politik yang rumit dan berdarah. [cite: 7]", 'https://i.pinimg.com/736x/6e/2a/6b/6e2a6bf741a6d759c441872ac195332b.jpg0', NULL, NULL, 341, '17+', 'now_showing', 50000.00),
[cite_start](102, 'Final Destination: Bloodlines', "Final Destination: Bloodlines adalah film horor supranatural Amerika Serikat tahun 2025, film ini merupakan sekuel ke enam dari serial Final Destination. [cite: 9, 57]", 'https://upload.wikimedia.org/wikipedia/id/a/ab/Final_Destination_Bloodlines_%282025%29_poster.jpg', NULL, NULL, 109, '17+', 'now_showing', 50000.00),
[cite_start](103, '20th Century Girl', "Film ini dibintangi oleh Kim Yoo-jung, Byeon Woo-seok, Park Jung-woo dan Roh Yoon-seo. [cite: 11, 32] [cite_start]Seri ini menggambarkan persahabatan dan kesegaran cinta pertama yang berlatar belakang tahun 1999. [cite: 12, 33]", 'https://id.pinterest.com/pin/700450548332846961/', NULL, NULL, 119, 'SU', 'now_showing', 45000.00),
[cite_start](104, 'Perayaan Mati Rasa', "Film produksi Sinemaku Pictures serta Legacy Pictures ini dibintangi oleh Iqbaal Ramadhan, Umay Shahab, dan Dwi Sasono. [cite: 13] [cite_start]Perayaan Mati Rasa tayang perdana di bioskop pada tanggal 29 Januari 2025. [cite: 14]", 'https://m.media-amazon.com/images/M/MV5BNWJmYmMxNTYtNjJiMC00NDQwLThhYjktNWIyYWYxY2FmM2VmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', NULL, NULL, 150, '13+', 'now_showing', 40000.00),
[cite_start](105, 'The Accountant 2', "Film tersebut merupakan sekuel dari film The Accountant yang dirilis pada 2016. [cite: 15]", 'https://upload.wikimedia.org/wikipedia/id/4/4b/The_Accountant_2_poster.jpg', NULL, NULL, 132, '17+', 'now_showing', 45000.00),
[cite_start](106, '1 Kakak 7 Ponakan', "Film tersebut diadaptasi dari sinetron tahun 1996 bernama sama. [cite: 16, 38]", 'https://upload.wikimedia.org/wikipedia/id/thumb/8/8e/Poster_1K7P.jpg/250px-Poster_1K7P.jpg', NULL, NULL, 131, '13+', 'now_showing', 40000.00),
[cite_start](107, 'Waktu Maghrib 2', "Jin Ummu Sibyan tiba-tiba kembali menampakkan diri dan mulai menebar teror mengerikan pada anak-anak. [cite: 18, 36]", 'https://jadwalnonton.com/data/upload/movies/2025/Poster-Film-waktu-maghrib-2-3.jpg', NULL, NULL, 107, '17+', 'now_showing', 40000.00),
[cite_start](108, '28 Years Later', "Film ketiga dalam serial film 28 Days Later, setelah 28 Days Later dan 28 Weeks Later yang dibintangi oleh Jodie Comer, Aaron Taylor-Johnson, dan Ralph Fiennes. [cite: 20, 72]", 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiNn9NumFErG3lBfQkjGWz_3CpBI-YG0c0lQ&s', NULL, NULL, 115, '17+', 'upcoming', 45000.00),
[cite_start](109, 'Lilo & Stitch', "Versi live-action dari film ini dijadwalkan rilis pada 23 Mei 2025, dan disutradarai oleh Dean Fleischer Camp. [cite: 23, 46]", 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI3jM0hSxKSTJ-I1C7XVBoyPhX1RClB5hlQg&s', NULL, NULL, 108, 'SU', 'upcoming', 40000.00),
[cite_start](110, 'Petrov''s Flu', "Petrov's Flu adalah film drama tahun 2021 yang ditulis dan disutradarai oleh Kirill Serebrennikov berdasarkan novel The Petrovs In and Around the Flu karya Alexei Salnikov. [cite: 24, 44]", 'https://medias.unifrance.org/medias/149/252/261269/format_web/petrov-s-flu.jpg', NULL, NULL, 145, '17+', 'upcoming', 40000.00),
[cite_start](111, 'Sayap-sayap Patah 2', "Film tersebut merupakan sekuel dari film Sayap-sayap Patah. [cite: 25]", 'https://assets.loket.com/2025/05/Screenshot-2025-05-08-at-10.21.09.png', NULL, NULL, 114, '13+', 'upcoming', 40000.00),
[cite_start](112, 'Karate Kid: Legends', "Ini merupakan sekuel dari The Karate Kid tahun 2010. [cite: 26, 48, 71]", 'https://upload.wikimedia.org/wikipedia/id/8/88/Karate_Kid_Legends_Poster.jpg', NULL, NULL, 94, '13+', 'upcoming', 50000.00),
[cite_start](113, 'Mendadak Dangdut', "Mendadak Dangdut tayang perdana di bioskop Indonesia pada 30 April 2025. [cite: 28, 50]", 'https://m.media-amazon.com/images/M/MV5BMTdmZmMyYWQtNGJkYS00MTlhLWEwNDAtZDFjN2NiMWVjYjNiXkEyXkFqcGc@._V1_QL75_UY281_CR4,0,190,281_.jpg', NULL, NULL, 109, '13+', 'upcoming', 40000.00),
[cite_start](114, 'Qodrat 2', "Qodrat 2 tayang perdana di bioskop pada tanggal 31 Maret 2025. [cite: 30, 67, 74]", 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQtHbvC6qUPDD8wj0yb7sbGJLKxin-RRJsng&s', NULL, NULL, 115, '17+', 'upcoming', 40000.00),

-- Film Jakarta
[cite_start](201, 'I, the Executioner', "Film ini merupakan sekuel dari film tahun 2015 Veteran. [cite: 31]", 'https://id.pinterest.com/pin/270004940155458016/', NULL, NULL, 118, '17+', 'now_showing', 50000.00),
[cite_start](202, 'Project Wolf Hunting', "Project Wolf Hunting adalah film thriller laga fiksi ilmiah Korea Selatan tahun 2022 yang disutradarai oleh Kim Hong-sun, dibintangi oleh Seo In-guk dan Jang Dong-yoon. [cite: 34]", 'https://cdn.kinocheck.com/i/ica72wgg9c.jpg', NULL, NULL, 130, '21+', 'now_showing', 45000.00),
[cite_start](203, 'The Witch: Part 1. The Subversion', "The Witch: Part 1. The Subversion adalah film misteri horor laga Korea Selatan tahun 2018 ditulis dan disutradarai oleh Park Hoon-jung. [cite: 37, 63]", 'https://i.pinimg.com/736x/f4/f0/4a/f4f04a43138524a907289e5cd87750f0.jpg', NULL, NULL, 170, '17+', 'now_showing', 50000.00),
[cite_start](204, 'The Witch: Part 2. The Other One', "Seorang gadis terbangun di laboratorium rahasia yang sangat besar dan Saat gadis itu melarikan diri dari laboratorium, dia menemukan Kyung Hee, yang mencoba melindungi rumahnya dari geng kriminal. [cite: 41, 68]", 'https://i.pinimg.com/736x/43/35/36/4335362453fb72f02ad58b10260b2619.jpg', NULL, NULL, 138, '17+', 'upcoming', 45000.00),
[cite_start](205, 'Big Deal', "Film ini berlatar belakang krisis keuangan IMF tahun 1997 di Korea Selatan. [cite: 43, 65]", 'https://i.pinimg.com/736x/97/eb/27/97eb278a43fbb97bdc2b6f4dd776bf58.jpg', NULL, NULL, 131, '13+', 'upcoming', 40000.00),

-- Film Malang
[cite_start](301, 'Warfare', "Film tersebut menampilkan D'Pharaoh Woon-A-Tai yang berperan sebagai Ray Mendoza, Will Poulter dan Noah Centineo. [cite: 53]", 'https://static1.squarespace.com/static/56047552e4b00047c4e83900/56098607e4b0c497c2bbae18/67fec9397fbd95659c597587/1744752198856/warfare%281%29.jpg?format=1500w', NULL, NULL, 98, '17+', 'now_showing', 50000.00),
[cite_start](302, 'The Art of Negotiation', "Seri ini membahas kisah merger dan akuisisi antar perusahaan. [cite: 55]", 'https://i.pinimg.com/736x/39/3e/31/393e316e96e428a23af5098f5168af45.jpg', NULL, NULL, 131, '13+', 'now_showing', 40000.00),
[cite_start](303, 'Until Dawn', "Film tersebut diadaptasi dari sebuah permainan video tahun 2015. [cite: 56]", 'https://i.pinimg.com/736x/5c/61/6e/5c616e4f504ffafb421606dbc1b3fed8.jpg', NULL, NULL, 103, '17+', 'now_showing', 45000.00),
[cite_start](304, 'Pengepungan di Bukit Duri', "Pengepungan di Bukit Duri tayang perdana di bioskop pada tanggal 17 April 2025. [cite: 60]", 'https://upload.wikimedia.org/wikipedia/id/thumb/0/0d/Poster_PDBD.jpg/250px-Poster_PDBD.jpg', NULL, NULL, 98, '17+', 'now_showing', 40000.00),
[cite_start](305, 'All of Us Are Dead', "Serial ini dibintangi oleh Park Ji-hu, Yoon Chan-young, Cho Yi-hyun, Lomon, Yoo In-soo, Lee Yoo-mi, Kim Byung-chul, Lee Kyu-hyung, dan Jeon Bae-soo. [cite: 61]", 'https://id.pinterest.com/pin/586030970286128808/', NULL, NULL, 119, '17+', 'now_showing', 45000.00),
[cite_start](306, 'Penjagal Iblis: Dosa Turunan', "Film tersebut dirilis pada 30 April 2025. [cite: 70]", 'https://assets.loket.com/2025/05/Screenshot-2025-05-08-at-10.21.09.png', NULL, NULL, 99, '17+', 'upcoming', 40000.00);

-- 4. Jadwal Tayang (Showtimes) - Menghubungkan film, bioskop, dan waktu untuk HARI INI
SET @today = CURDATE();

INSERT IGNORE INTO Showtimes (movie_id, cinema_id, show_datetime) VALUES
-- JADWAL FILM PROMOSI (ID 1) DI SEMUA KOTA
(1, 1, CONCAT(@today, ' 13:00:00')), (1, 1, CONCAT(@today, ' 16:00:00')), (1, 1, CONCAT(@today, ' 19:00:00')), (1, 1, CONCAT(@today, ' 22:00:00')),
(1, 2, CONCAT(@today, ' 14:00:00')), (1, 3, CONCAT(@today, ' 15:00:00')),
(1, 4, CONCAT(@today, ' 13:00:00')), (1, 4, CONCAT(@today, ' 16:00:00')), (1, 4, CONCAT(@today, ' 19:00:00')), (1, 4, CONCAT(@today, ' 22:00:00')),
(1, 5, CONCAT(@today, ' 14:00:00')), (1, 6, CONCAT(@today, ' 15:00:00')),
(1, 7, CONCAT(@today, ' 13:00:00')), (1, 7, CONCAT(@today, ' 16:00:00')), (1, 7, CONCAT(@today, ' 19:00:00')), (1, 7, CONCAT(@today, ' 22:00:00')),
(1, 8, CONCAT(@today, ' 14:00:00')), (1, 9, CONCAT(@today, ' 15:00:00')),

-- JADWAL FILM BANDUNG NOW SHOWING (ID 101-107) di Bioskop Bandung (ID 4,5,6)
(101, 4, CONCAT(@today, ' 12:00:00')), (101, 4, CONCAT(@today, ' 15:00:00')), (101, 4, CONCAT(@today, ' 18:00:00')), (101, 4, CONCAT(@today, ' 21:00:00')),
(102, 5, CONCAT(@today, ' 12:15:00')), (102, 5, CONCAT(@today, ' 15:15:00')), (102, 5, CONCAT(@today, ' 18:15:00')), (102, 5, CONCAT(@today, ' 21:15:00')),
(103, 6, CONCAT(@today, ' 12:30:00')), (103, 6, CONCAT(@today, ' 15:30:00')), (103, 6, CONCAT(@today, ' 18:30:00')), (103, 6, CONCAT(@today, ' 21:30:00')),
(104, 4, CONCAT(@today, ' 12:45:00')), (104, 4, CONCAT(@today, ' 15:45:00')), (104, 4, CONCAT(@today, ' 18:45:00')), (104, 4, CONCAT(@today, ' 21:45:00')),
(105, 5, CONCAT(@today, ' 13:00:00')), (105, 5, CONCAT(@today, ' 16:00:00')), (105, 5, CONCAT(@today, ' 19:00:00')), (105, 5, CONCAT(@today, ' 22:00:00')),
(106, 6, CONCAT(@today, ' 13:15:00')), (106, 6, CONCAT(@today, ' 16:15:00')), (106, 6, CONCAT(@today, ' 19:15:00')), (106, 6, CONCAT(@today, ' 22:15:00')),
(107, 4, CONCAT(@today, ' 13:30:00')), (107, 4, CONCAT(@today, ' 16:30:00')), (107, 4, CONCAT(@today, ' 19:30:00')), (107, 4, CONCAT(@today, ' 22:30:00')),

-- JADWAL FILM JAKARTA NOW SHOWING
-- Film Jakarta NS: 201, 202, 203 dan beberapa dari Bandung: 101, 103, 106, 107
(201, 1, CONCAT(@today, ' 12:00:00')), (201, 1, CONCAT(@today, ' 15:00:00')), (201, 1, CONCAT(@today, ' 18:00:00')), (201, 1, CONCAT(@today, ' 21:00:00')),
(202, 2, CONCAT(@today, ' 12:15:00')), (202, 2, CONCAT(@today, ' 15:15:00')), (202, 2, CONCAT(@today, ' 18:15:00')), (202, 2, CONCAT(@today, ' 21:15:00')),
(203, 3, CONCAT(@today, ' 12:30:00')), (203, 3, CONCAT(@today, ' 15:30:00')), (203, 3, CONCAT(@today, ' 18:30:00')), (203, 3, CONCAT(@today, ' 21:30:00')),
(101, 1, CONCAT(@today, ' 12:45:00')), (101, 2, CONCAT(@today, ' 15:45:00')), (103, 3, CONCAT(@today, ' 18:45:00')), (103, 1, CONCAT(@today, ' 21:45:00')),
(106, 2, CONCAT(@today, ' 13:00:00')), (106, 3, CONCAT(@today, ' 16:00:00')), (107, 1, CONCAT(@today, ' 19:00:00')), (107, 2, CONCAT(@today, ' 22:00:00')),

-- JADWAL FILM MALANG NOW SHOWING
-- Film Malang NS: 301, 302, 303, 304, 305 dan beberapa dari luar: 102, 203
(301, 7, CONCAT(@today, ' 12:00:00')), (301, 7, CONCAT(@today, ' 15:00:00')), (301, 7, CONCAT(@today, ' 18:00:00')), (301, 7, CONCAT(@today, ' 21:00:00')),
(302, 8, CONCAT(@today, ' 12:15:00')), (302, 8, CONCAT(@today, ' 15:15:00')), (302, 8, CONCAT(@today, ' 18:15:00')), (302, 8, CONCAT(@today, ' 21:15:00')),
(303, 9, CONCAT(@today, ' 12:30:00')), (303, 9, CONCAT(@today, ' 15:30:00')), (303, 9, CONCAT(@today, ' 18:30:00')), (303, 9, CONCAT(@today, ' 21:30:00')),
(304, 7, CONCAT(@today, ' 12:45:00')), (304, 7, CONCAT(@today, ' 15:45:00')), (304, 7, CONCAT(@today, ' 18:45:00')), (304, 7, CONCAT(@today, ' 21:45:00')),
(305, 8, CONCAT(@today, ' 13:00:00')), (305, 8, CONCAT(@today, ' 16:00:00')), (305, 8, CONCAT(@today, ' 19:00:00')), (305, 8, CONCAT(@today, ' 22:00:00')),
(102, 9, CONCAT(@today, ' 13:15:00')), (102, 9, CONCAT(@today, ' 16:15:00')), (102, 9, CONCAT(@today, ' 19:15:00')), (102, 9, CONCAT(@today, ' 22:15:00')),
(203, 7, CONCAT(@today, ' 13:30:00')), (203, 7, CONCAT(@today, ' 16:30:00')), (203, 7, CONCAT(@today, ' 19:30:00')), (203, 7, CONCAT(@today, ' 22:30:00'));

-- 5. Pengguna Contoh
INSERT IGNORE INTO Users (name, email, password_hash) VALUES
('Zaskya Dewi', 'zaskya@example.com', '$2a$10$Y.5qS7N4bZ7Oa5c3X2e9j.eU6e7i8f9g0h1i2j3k4l5m6n7o8p9q'),
('Budi Santoso', 'budi@example.com', '$2a$10$Z.6rT8O5cZ8Pq1e4X3f0k.fV7g8h9i0j1k2l3m4n5o6p7q8r9s0t');
