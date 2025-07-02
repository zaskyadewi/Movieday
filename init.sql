CREATE TYPE movie_status AS ENUM ('now_showing', 'upcoming', 'ended');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');

CREATE TABLE IF NOT EXISTS cities (
    city_id SERIAL PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS cinemas (
    cinema_id SERIAL PRIMARY KEY,
    city_id INT NOT NULL,
    cinema_name VARCHAR(150) NOT NULL,
    address TEXT,
    FOREIGN KEY (city_id) REFERENCES cities(city_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS movies (
    movie_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    synopsis TEXT,
    poster_url VARCHAR(255),
    promo_image_url VARCHAR(255),
    trailer_url VARCHAR(255),
    duration_minutes INT,
    rating VARCHAR(10),
    status movie_status DEFAULT 'upcoming',
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS showtimes (
    showtime_id SERIAL PRIMARY KEY,
    movie_id INT NOT NULL,
    cinema_id INT NOT NULL,
    show_datetime TIMESTAMP NOT NULL,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (cinema_id) REFERENCES cinemas(cinema_id) ON DELETE CASCADE,
    UNIQUE (movie_id, cinema_id, show_datetime)
);

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    showtime_id INT NOT NULL,
    booking_code VARCHAR(20) NOT NULL UNIQUE,
    total_tickets INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (showtime_id) REFERENCES Showtimes(showtime_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS bookedSeats (
    booked_seat_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL,
    showtime_id INT NOT NULL,
    seat_id VARCHAR(5) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (showtime_id) REFERENCES Showtimes(showtime_id) ON DELETE CASCADE,
    UNIQUE (showtime_id, seat_id)
);

-- 1. Kota
INSERT INTO cities (city_id, city_name) VALUES (1, 'Jakarta'), (2, 'Bandung'), (3, 'Malang') ON CONFLICT DO NOTHING;

-- 2. Bioskop
INSERT INTO cinemas (cinema_id, city_id, cinema_name, address) VALUES
(1, 1, 'Movieday Grand Indonesia', 'Jl. MH Thamrin No.1, Jakarta Pusat'),
(2, 1, 'Movieday Plaza Senayan', 'Jl. Asia Afrika No.8, Jakarta Pusat'),
(3, 1, 'Movieday Kelapa Gading', 'Jl. Boulevard Kelapa Gading, Jakarta Utara'),
(4, 2, 'Movieday Paris Van Java', 'Jl. Sukajadi No.131-139, Bandung'),
(5, 2, 'Movieday Cihampelas Walk', 'Jl. Cihampelas No. 160, Bandung'),
(6, 2, 'Movieday Braga XXI', 'Jl. Braga No.99-101, Bandung'),
(7, 3, 'Movieday Transmart MX', 'Jl. Veteran No.8, Malang'),
(8, 3, 'Movieday Malang City Point', 'Jl. Terusan Dieng No.32, Malang'),
(9, 3, 'Movieday Araya', 'Jl. Blimbing Indah Megah No.2, Malang') ON CONFLICT DO NOTHING;

-- 3. Film
INSERT INTO movies (movie_id, title, synopsis, poster_url, promo_image_url, trailer_url, duration_minutes, rating, status, price) VALUES
(1, 'SEVENTEEN RIGHT HERE WORLD TOUR IN CINEMAS', 'Experience the unforgettable moments of SEVENTEEN [RIGHT HERE] WORLD TOUR on the big screen, starting with the electrifying kickoff concert in Goyang!', 'https://dx35vtwkllhj9.cloudfront.net/trafalgarreleasing/seventeen-right-here-world-tour-in-cinemas/images/regions/intl/onesheet.jpg', 'https://dx35vtwkllhj9.cloudfront.net/trafalgarreleasing/seventeen-right-here-world-tour-in-cinemas/images/regions/intl/header.jpg', 'https://www.youtube.com/watch?v=zArZTpp43as', 130, 'SU', 'now_showing', 75000),
(101, 'Youth Of May', 'Kisah yang berlatar belakang Pemberontakan Gwangju tahun 1980, menggambarkan cinta antara dua orang muda di tengah kondisi politik yang rumit dan berdarah.', 'https://i.pinimg.com/736x/6e/2a/6b/6e2a6bf741a6d759c441872ac195332b.jpg', NULL, NULL, 341, '17+', 'now_showing', 50000),
(102, 'Final Destination: Bloodlines', 'Final Destination: Bloodlines adalah film horor supranatural Amerika Serikat tahun 2025, film ini merupakan sekuel ke enam dari serial Final Destination.', 'https://upload.wikimedia.org/wikipedia/id/a/ab/Final_Destination_Bloodlines_%282025%29_poster.jpg', NULL, NULL, 109, '17+', 'now_showing', 50000),
(103, '20th Century Girl', 'Seri ini menggambarkan persahabatan dan kesegaran cinta pertama yang berlatar belakang tahun 1999.', 'https://i.pinimg.com/originals/05/26/28/05262804ea6982f6a61981a8b9280145.jpg', NULL, NULL, 119, 'SU', 'now_showing', 45000)
(104, 'Perayaan Mati Rasa', 'Perayaan Mati Rasa adalah film drama Indonesia tahun 2025 yang disutradarai oleh Umay Shahab. [cite: 13]', 'https://m.media-amazon.com/images/M/MV5BNWJmYmMxNTYtNjJiMC00NDQwLThhYjktNWIyYWYxY2FmM2VmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', NULL, NULL, 150, '13+', 'now_showing', 40000),
(105, 'The Accountant 2', 'Film tersebut merupakan sekuel dari film The Accountant yang dirilis pada 2016. [cite: 15]', 'https://upload.wikimedia.org/wikipedia/id/4/4b/The_Accountant_2_poster.jpg', NULL, NULL, 132, '17+', 'now_showing', 45000),
(106, '1 Kakak 7 Ponakan', '1 Kakak 7 Ponakan adalah film keluarga Indonesia tahun 2025 yang diadaptasi dari sinetron tahun 1996 bernama sama. [cite: 16]', 'https://upload.wikimedia.org/wikipedia/id/thumb/8/8e/Poster_1K7P.jpg/250px-Poster_1K7P.jpg', NULL, NULL, 131, '13+', 'now_showing', 40000),
(107, 'Waktu Maghrib 2', 'Jin Ummu Sibyan tiba-tiba kembali menampakkan diri dan mulai menebar teror mengerikan pada anak-anak. [cite: 17]', 'https://jadwalnonton.com/data/upload/movies/2025/Poster-Film-waktu-maghrib-2-3.jpg', NULL, NULL, 107, '17+', 'now_showing', 40000),
(108, '28 Years Later', 'Film ketiga dalam serial film 28 Days Later, setelah 28 Days Later dan 28 Weeks Later. [cite: 19]', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiNn9NumFErG3lBfQkjGWz_3CpBI-YG0c0lQ&s', NULL, NULL, 115, '17+', 'upcoming', 45000),
(109, 'Lilo & Stitch', 'Versi live-action dari film ini dijadwalkan rilis pada 23 Mei 2025, dan disutradarai oleh Dean Fleischer Camp. [cite: 22]', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI3jM0hSxKSTJ-I1C7XVBoyPhX1RClB5hlQg&s', NULL, NULL, 108, 'SU', 'upcoming', 40000),
(110, 'Petrov''s Flu', 'Petrov''s Flu adalah film drama tahun 2021 yang ditulis dan disutradarai oleh Kirill Serebrennikov. [cite: 24]', 'https://medias.unifrance.org/medias/149/252/261269/format_web/petrov-s-flu.jpg', NULL, NULL, 145, '17+', 'upcoming', 40000),
(111, 'Sayap-sayap Patah 2', 'Film tersebut merupakan sekuel dari film Sayap-sayap Patah. [cite: 25]', 'https://assets.loket.com/2025/05/Screenshot-2025-05-08-at-10.21.09.png', NULL, NULL, 114, '13+', 'upcoming', 40000),
(112, 'Karate Kid: Legends', 'Ini merupakan sekuel dari The Karate Kid tahun 2010. [cite: 26]', 'https://upload.wikimedia.org/wikipedia/id/8/88/Karate_Kid_Legends_Poster.jpg', NULL, NULL, 94, '13+', 'upcoming', 50000),
(113, 'Mendadak Dangdut', 'Mendadak Dangdut tayang perdana di bioskop Indonesia pada 30 April 2025. [cite: 28]', 'https://m.media-amazon.com/images/M/MV5BMTdmZmMyYWQtNGJkYS00MTlhLWEwNDAtZDFjN2NiMWVjYjNiXkEyXkFqcGc@._V1_QL75_UY281_CR4,0,190,281_.jpg', NULL, NULL, 109, '13+', 'upcoming', 40000),
(114, 'Qodrat 2', 'Qodrat 2 tayang perdana di bioskop pada tanggal 31 Maret 2025. [cite: 30]', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQtHbvC6qUPDD8wj0yb7sbGJLKxin-RRJsng&s', NULL, NULL, 115, '17+', 'upcoming', 40000),
(201, 'I, the Executioner', 'Film ini merupakan sekuel dari film tahun 2015 Veteran. [cite: 31]', 'https://i.pinimg.com/736x/8e/3c/69/8e3c6902264c39958742880b957825a0.jpg', NULL, NULL, 118, '17+', 'now_showing', 50000),
(202, 'Project Wolf Hunting', 'Project Wolf Hunting adalah film thriller laga fiksi ilmiah Korea Selatan tahun 2022. [cite: 34]', 'https://cdn.kinocheck.com/i/ica72wgg9c.jpg', NULL, NULL, 130, '21+', 'now_showing', 45000),
(203, 'The Witch: Part 1. The Subversion', 'The Witch: Part 1. The Subversion adalah film misteri horor laga Korea Selatan tahun 2018. [cite: 37]', 'https://i.pinimg.com/736x/f4/f0/4a/f4f04a43138524a907289e5cd87750f0.jpg', NULL, NULL, 170, '17+', 'now_showing', 50000),
(204, 'The Witch: Part 2. The Other One', 'Seorang gadis terbangun di laboratorium rahasia yang sangat besar...', 'https://i.pinimg.com/736x/43/35/36/4335362453fb72f02ad58b10260b2619.jpg', NULL, NULL, 138, '17+', 'upcoming', 45000),
(205, 'Big Deal', 'Film ini berlatar belakang krisis keuangan IMF tahun 1997 di Korea Selatan. [cite: 42]', 'https://i.pinimg.com/736x/97/eb/27/97eb278a43fbb97bdc2b6f4dd776bf58.jpg', NULL, NULL, 131, '13+', 'upcoming', 40000),
(301, 'Warfare', 'Film tersebut menampilkan D''Pharaoh Woon-A-Tai yang berperan sebagai Ray Mendoza, Will Poulter dan Noah Centineo. [cite: 53]', 'https://static1.squarespace.com/static/56047552e4b00047c4e83900/56098607e4b0c497c2bbae18/67fec9397fbd95659c597587/1744752198856/warfare%281%29.jpg?format=1500w', NULL, NULL, 98, '17+', 'now_showing', 50000),
(302, 'The Art of Negotiation', 'Seri ini membahas kisah merger dan akuisisi antar perusahaan. [cite: 55]', 'https://i.pinimg.com/736x/39/3e/31/393e316e96e428a23af5098f5168af45.jpg', NULL, NULL, 131, '13+', 'now_showing', 40000),
(303, 'Until Dawn', 'Film tersebut diadaptasi dari sebuah permainan video tahun 2015. [cite: 56]', 'https://i.pinimg.com/736x/5c/61/6e/5c616e4f504ffafb421606dbc1b3fed8.jpg', NULL, NULL, 103, '17+', 'now_showing', 45000),
(304, 'Pengepungan di Bukit Duri', 'Pengepungan di Bukit Duri tayang perdana di bioskop pada tanggal 17 April 2025. [cite: 60]', 'https://upload.wikimedia.org/wikipedia/id/thumb/0/0d/Poster_PDBD.jpg/250px-Poster_PDBD.jpg', NULL, NULL, 98, '17+', 'now_showing', 40000),
(305, 'All of Us Are Dead', 'Serial ini dibintangi oleh Park Ji-hu, Yoon Chan-young, Cho Yi-hyun, Lomon, Yoo In-soo, Lee Yoo-mi, Kim Byung-chul, Lee Kyu-hyung, dan Jeon Bae-soo. [cite: 61]', 'https://i.pinimg.com/originals/a0/a1/3a/a0a13a30c5e3f898c5e3f8b8e0e6b8c4.jpg', NULL, NULL, 119, '17+', 'now_showing', 45000),
(306, 'Penjagal Iblis: Dosa Turunan', 'Film tersebut dirilis pada 30 April 2025. [cite: 70]', 'https://assets.loket.com/2025/05/Screenshot-2025-05-08-at-10.21.09.png', NULL, NULL, 99, '17+', 'upcoming', 40000);
ON CONFLICT (movie_id) DO NOTHING;

-- 4. Jadwal Tayang (Showtimes) untuk HARI INI
INSERT INTO showtimes (movie_id, cinema_id, show_datetime) VALUES
(1, 1, CURRENT_DATE + interval '13 hours'), (1, 1, CURRENT_DATE + interval '16 hours'), (1, 1, CURRENT_DATE + interval '19 hours'), (1, 1, CURRENT_DATE + interval '22 hours'),
(1, 4, CURRENT_DATE + interval '13 hours'), (1, 4, CURRENT_DATE + interval '16 hours'), (1, 4, CURRENT_DATE + interval '19 hours'), (1, 4, CURRENT_DATE + interval '22 hours'),
(1, 7, NOW()), (1, 7, NOW() + INTERVAL 3 HOUR), (1, 7, NOW() + INTERVAL 6 HOUR), (1, 7, NOW() + INTERVAL 9 HOUR),
(101, 4, NOW()), (101, 4, NOW() + INTERVAL 3 HOUR), (101, 4, NOW() + INTERVAL 6 HOUR), (101, 4, NOW() + INTERVAL 9 HOUR),
(102, 5, NOW()), (102, 5, NOW() + INTERVAL 3 HOUR), (102, 5, NOW() + INTERVAL 6 HOUR), (102, 5, NOW() + INTERVAL 9 HOUR),
(103, 6, NOW()), (103, 6, NOW() + INTERVAL 3 HOUR), (103, 6, NOW() + INTERVAL 6 HOUR), (103, 6, NOW() + INTERVAL 9 HOUR),
(104, 4, NOW()), (104, 4, NOW() + INTERVAL 3 HOUR), (104, 4, NOW() + INTERVAL 6 HOUR), (104, 4, NOW() + INTERVAL 9 HOUR),
(105, 5, NOW()), (105, 5, NOW() + INTERVAL 3 HOUR), (105, 5, NOW() + INTERVAL 6 HOUR), (105, 5, NOW() + INTERVAL 9 HOUR),
(106, 6, NOW()), (106, 6, NOW() + INTERVAL 3 HOUR), (106, 6, NOW() + INTERVAL 6 HOUR), (106, 6, NOW() + INTERVAL 9 HOUR),
(107, 4, NOW()), (107, 4, NOW() + INTERVAL 3 HOUR), (107, 4, NOW() + INTERVAL 6 HOUR), (107, 4, NOW() + INTERVAL 9 HOUR),
(201, 1, NOW()), (201, 1, NOW() + INTERVAL 3 HOUR), (201, 1, NOW() + INTERVAL 6 HOUR), (201, 1, NOW() + INTERVAL 9 HOUR),
(202, 2, NOW()), (202, 2, NOW() + INTERVAL 3 HOUR), (202, 2, NOW() + INTERVAL 6 HOUR), (202, 2, NOW() + INTERVAL 9 HOUR),
(203, 3, NOW()), (203, 3, NOW() + INTERVAL 3 HOUR), (203, 3, NOW() + INTERVAL 6 HOUR), (203, 3, NOW() + INTERVAL 9 HOUR),
(103, 1, NOW()), (103, 1, NOW() + INTERVAL 3 HOUR), (103, 1, NOW() + INTERVAL 6 HOUR), (103, 1, NOW() + INTERVAL 9 HOUR),
(106, 2, NOW()), (106, 2, NOW() + INTERVAL 3 HOUR), (106, 2, NOW() + INTERVAL 6 HOUR), (106, 2, NOW() + INTERVAL 9 HOUR),
(107, 3, NOW()), (107, 3, NOW() + INTERVAL 3 HOUR), (107, 3, NOW() + INTERVAL 6 HOUR), (107, 3, NOW() + INTERVAL 9 HOUR),
(301, 7, NOW()), (301, 7, NOW() + INTERVAL 3 HOUR), (301, 7, NOW() + INTERVAL 6 HOUR), (301, 7, NOW() + INTERVAL 9 HOUR),
(302, 8, NOW()), (302, 8, NOW() + INTERVAL 3 HOUR), (302, 8, NOW() + INTERVAL 6 HOUR), (302, 8, NOW() + INTERVAL 9 HOUR),
(303, 9, NOW()), (303, 9, NOW() + INTERVAL 3 HOUR), (303, 9, NOW() + INTERVAL 6 HOUR), (303, 9, NOW() + INTERVAL 9 HOUR),
(102, 7, NOW()), (102, 7, NOW() + INTERVAL 3 HOUR), (102, 7, NOW() + INTERVAL 6 HOUR), (102, 7, NOW() + INTERVAL 9 HOUR),
(304, 8, NOW()), (304, 8, NOW() + INTERVAL 3 HOUR), (304, 8, NOW() + INTERVAL 6 HOUR), (304, 8, NOW() + INTERVAL 9 HOUR),
(305, 9, NOW()), (305, 9, NOW() + INTERVAL 3 HOUR), (305, 9, NOW() + INTERVAL 6 HOUR), (305, 9, NOW() + INTERVAL 9 HOUR),
(203, 7, NOW()), (203, 7, NOW() + INTERVAL 3 HOUR), (203, 7, NOW() + INTERVAL 6 HOUR), (203, 7, NOW() + INTERVAL 9 HOUR);
ON CONFLICT (movie_id, cinema_id, show_datetime) DO NOTHING;

-- 5. Pengguna Contoh
INSERT INTO users (name, email, password_hash) VALUES
('Zaskya Dewi', 'zaskya@example.com', '$2a$10$Y.5qS7N4bZ7Oa5c3X2e9j.eU6e7i8f9g0h1i2j3k4l5m6n7o8p9q'),
('Budi Santoso', 'budi@example.com', '$2a$10$Z.6rT8O5cZ8Pq1e4X3f0k.fV7g8h9i0j1k2l3m4n5o6p7q8r9s0t')
ON CONFLICT (email) DO NOTHING;
