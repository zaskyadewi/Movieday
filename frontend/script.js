// Menggunakan IIFE (Immediately Invoked Function Expression) untuk menghindari polusi scope global
(() => {
    // === STATE MANAGEMENT ===
    // Objek untuk menyimpan semua state aplikasi
    const state = {
        selectedCityName: "Jakarta",
        allMovies: [], // Akan diisi dari backend
        currentUser: null,
        currentSelectedMovie: null,
        selectedCinema: null,   // { cinema_id, cinema_name }
        selectedShowtime: null, // { showtime_id, time_string }
        selectedSeats: [],
        heroSlider: null,
    };

    const promoMoviesConfig = [
        { movieId: 1, promoImageUrl: 'https://www.themoviedb.org/t/p/original/r5i252L6gX4s62x9V5a5hYtI2J5.jpg', trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { movieId: 8, promoImageUrl: 'https://www.themoviedb.org/t/p/original/k4mS5gQT51a2aI8W4P9v0yXh5Y.jpg', trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ];

    const API_BASE_URL = 'http://localhost:3001/api';

    // === DOM SELECTORS ===
    const mainContent = document.getElementById("main-content");
    const citySelect = document.getElementById("city-select");
    const userAuthNav = document.getElementById("user-auth-nav");

    // === HELPER FUNCTIONS ===
    const showPage = (pageId) => {
        mainContent.querySelectorAll('section[id]').forEach(s => s.classList.add('hidden'));
        const page = document.getElementById(pageId);
        if (page) page.classList.remove('hidden');
        window.scrollTo(0, 0);
    };

    const apiFetch = async (endpoint, options = {}) => {
        const token = localStorage.getItem('movieDayToken');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
        }
        return responseData;
    };

    // === AUTHENTICATION MODULE ===
    const authModule = (() => {
        const authModal = document.getElementById('auth-modal');
        const authContentContainer = document.getElementById('auth-content-container');
        const loginTemplate = document.getElementById('login-form-template');
        const registerTemplate = document.getElementById('register-form-template');

        const open = (formType = 'login') => {
            authContentContainer.innerHTML = '';
            const template = formType === 'login' ? loginTemplate : registerTemplate;
            authContentContainer.appendChild(template.content.cloneNode(true));
            authModal.classList.remove('hidden');

            const form = authContentContainer.querySelector('form');
            const link = authContentContainer.querySelector(formType === 'login' ? '#show-register-link' : '#show-login-link');
            
            form.addEventListener('submit', formType === 'login' ? handleLogin : handleRegister);
            link.addEventListener('click', (e) => {
                e.preventDefault();
                open(formType === 'login' ? 'register' : 'login');
            });
        };

        const close = () => authModal.classList.add('hidden');

        const displayFormError = (form, message) => {
            const errorEl = form.querySelector('.error-message');
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        };

        const handleLogin = async (e) => {
            e.preventDefault();
            const form = e.target;
            const body = JSON.stringify({ email: form.querySelector('#login-email').value, password: form.querySelector('#login-password').value });
            try {
                const data = await apiFetch('/users/login', { method: 'POST', body });
                localStorage.setItem('movieDayToken', data.token);
                localStorage.setItem('movieDayUser', JSON.stringify(data.user));
                state.currentUser = data.user;
                updateUserNav();
                close();
                alert(`Selamat datang kembali, ${state.currentUser.name}!`);
            } catch (error) {
                displayFormError(form, error.message);
            }
        };

        const handleRegister = async (e) => {
            e.preventDefault();
            const form = e.target;
            const body = JSON.stringify({ name: form.querySelector('#register-name').value, email: form.querySelector('#register-email').value, password: form.querySelector('#register-password').value });
            try {
                const data = await apiFetch('/users/register', { method: 'POST', body });
                alert(data.message + ' Silakan login.');
                open('login');
            } catch (error) {
                displayFormError(form, error.message);
            }
        };
        
        const handleLogout = () => {
            localStorage.removeItem('movieDayToken');
            localStorage.removeItem('movieDayUser');
            state.currentUser = null;
            updateUserNav();
            alert('Anda telah logout.');
            showPage('movie-gallery-page');
        };

        const checkStatus = () => {
            const userJson = localStorage.getItem('movieDayUser');
            if (userJson) {
                try {
                    state.currentUser = JSON.parse(userJson);
                } catch {
                    localStorage.clear();
                    state.currentUser = null;
                }
            }
            updateUserNav();
        };

        const updateUserNav = () => {
            userAuthNav.innerHTML = '';
            if (state.currentUser) {
                userAuthNav.innerHTML = `<span class="user-profile-name">Halo, ${state.currentUser.name.split(" ")[0]}!</span><button id="logout-btn" class="user-auth-nav-item">Logout</button>`;
                document.getElementById('logout-btn').addEventListener('click', handleLogout);
            } else {
                userAuthNav.innerHTML = `<button id="login-header-btn" class="user-auth-nav-item">Login</button><button id="register-header-btn" class="user-auth-nav-item">Daftar</button>`;
                document.getElementById('login-header-btn').addEventListener('click', () => open('login'));
                document.getElementById('register-header-btn').addEventListener('click', () => open('register'));
            }
        };
        
        authModal.addEventListener('click', e => { if(e.target === authModal) close(); });
        authModal.querySelector('.close-modal-btn').addEventListener('click', close);
        
        return { checkStatus, open };
    })();

    // === MOVIE & UI RENDERING ===
    const populateCities = async () => {
        try {
            const cities = await apiFetch('/cities');
            citySelect.innerHTML = cities.map(c => `<option value="${c.city_name}">${c.city_name}</option>`).join('');
            state.selectedCityName = citySelect.value;
            await renderContentForCity();
        } catch (error) {
            console.error("Gagal memuat kota:", error);
            citySelect.innerHTML = '<option>Gagal</option>';
        }
    };
    
    const renderMovieCarousel = (gridElement, movies, status) => {
        gridElement.innerHTML = ''; // Kosongkan grid
        if (movies && movies.length > 0) {
            movies.forEach(movie => {
                // Menentukan tombol berdasarkan status film
                const buttonHtml = status === 'now_showing'
                    ? `<button class="book-now-btn" data-movieid="${movie.movie_id}">Book Now</button>`
                    : `<button class="upcoming-details-btn" data-movieid="${movie.movie_id}">View Details</button>`;
                
                // Membuat elemen kartu film
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card';
                movieCard.innerHTML = `
                    <div class="movie-poster" style="background-image: url('${movie.poster_url || ''}')"></div>
                    <div class="movie-info">
                        <div class="movie-title">${movie.title}</div>
                        ${buttonHtml}
                    </div>`;
                gridElement.appendChild(movieCard);
            });
        } else {
            gridElement.innerHTML = `<p>Tidak ada film untuk kategori ini.</p>`;
        }
    };

    const renderContentForCity = async () => {
        document.getElementById('now-showing-grid').innerHTML = "<p>Memuat...</p>";
        document.getElementById('upcoming-grid').innerHTML = "<p>Memuat...</p>";
        try {
            // Mengambil data film dari backend
            const [nsMovies, ucMovies] = await Promise.all([
                apiFetch(`/movies/now-showing?city=${encodeURIComponent(state.selectedCityName)}`),
                apiFetch(`/movies/upcoming?city=${encodeURIComponent(state.selectedCityName)}`)
            ]);
            state.allMovies = [...nsMovies, ...ucMovies];
            
            // Merender film ke dalam carousel masing-masing
            renderMovieCarousel(document.getElementById('now-showing-grid'), nsMovies, 'now_showing');
            renderMovieCarousel(document.getElementById('upcoming-grid'), ucMovies, 'upcoming');
            
            // Mengupdate hero slider jika ada
            if (!state.heroSlider) state.heroSlider = new HeroSlider();
            state.heroSlider.updateSlides(state.allMovies);

        } catch (error) {
            console.error("Gagal memuat film:", error);
            document.getElementById('now-showing-grid').innerHTML = "<p>Gagal memuat film Now Showing.</p>";
            document.getElementById('upcoming-grid').innerHTML = "<p>Gagal memuat film Upcoming.</p>";
        }
    };

    // === HERO SLIDER ===
    class HeroSlider {
        constructor() {
            this.sliderEl = document.querySelector('.hero-slider');
            this.dotsContainerEl = document.querySelector('.hero-dots');
            this.currentSlide = 0;
            this.slideInterval = null;
            this.slidesData = [];
            document.getElementById('hero-prev-btn').addEventListener('click', () => this.prev());
            document.getElementById('hero-next-btn').addEventListener('click', () => this.next());
        }
        updateSlides(allMovies) {
            this.slidesData = promoMoviesConfig.map(promo => {
                const movieData = allMovies.find(m => m.movie_id === promo.movieId);
                return movieData ? { ...movieData, promoImageUrl: promo.promoImageUrl, trailerUrl: promo.trailerUrl } : null;
            }).filter(Boolean);
            this.init();
        }
        init() {
            this.sliderEl.innerHTML = '';
            this.dotsContainerEl.innerHTML = '';
            if (this.slidesData.length === 0) return;
            this.slidesData.forEach((movie, index) => {
                const slide = document.createElement('div');
                slide.className = 'hero-slide';
                slide.style.backgroundImage = `url('${movie.promoImageUrl}')`;
                slide.innerHTML = `
                    <div class="hero-content">
                        <h2>${movie.title}</h2>
                        <p>${movie.synopsis.split('\n')[0]}</p>
                        <div class="hero-buttons">
                            <button class="btn book-now" data-movieid="${movie.movie_id}">Book Now</button>
                            <button class="btn watch-trailer" data-trailerurl="${movie.trailerUrl}">Watch Trailer</button>
                        </div>
                    </div>`;
                this.sliderEl.appendChild(slide);
                const dot = document.createElement('div');
                dot.className = 'hero-dot';
                dot.addEventListener('click', () => this.goTo(index));
                this.dotsContainerEl.appendChild(dot);
            });
            this.update(); this.start();
        }
        update() { if (this.slidesData.length === 0) return; this.sliderEl.style.transform = `translateX(-${this.currentSlide * 100}%)`; this.dotsContainerEl.childNodes.forEach((d, i) => d.classList.toggle('active', i === this.currentSlide)); }
        goTo(index) { this.currentSlide = index; this.update(); this.resetInterval(); }
        next() { this.currentSlide = (this.currentSlide + 1) % this.slidesData.length; this.update(); }
        prev() { this.currentSlide = (this.currentSlide - 1 + this.slidesData.length) % this.slidesData.length; this.update(); }
        start() { if (this.slideInterval) clearInterval(this.slideInterval); this.slideInterval = setInterval(() => this.next(), 7000); }
        resetInterval() { this.start(); }
    }
    
    // === PAGE SPECIFIC LOGIC & MODULES ===
    const upcomingDetailPage = (() => {
        const page = document.getElementById('upcoming-detail-page');
        const posterEl = document.getElementById('upcoming-movie-poster-img');
        const titleEl = document.getElementById('upcoming-movie-title');
        const synopsisEl = document.getElementById('upcoming-movie-synopsis');

        return {
            open: (movie) => {
                posterEl.style.backgroundImage = `url('${movie.poster_url}')`;
                titleEl.textContent = movie.title;
                synopsisEl.textContent = movie.synopsis;
                showPage('upcoming-detail-page');
            }
        };
    })();

    const trailerModule = (() => {
        const modal = document.getElementById('trailer-modal');
        const iframe = document.getElementById('youtube-trailer-iframe');
        const closeBtn = modal.querySelector('.close-modal-btn');
        const open = (youtubeUrl) => { iframe.src = youtubeUrl; modal.classList.remove('hidden'); };
        const close = () => { modal.classList.add('hidden'); iframe.src = ''; };
        closeBtn.addEventListener('click', close);
        modal.addEventListener('click', e => { if (e.target === modal) close(); });
        return { open };
    })();
    
    // Halaman Booking
    const bookingModule = (() => {
        const page = document.getElementById('booking-page');
        const cinemaDropdown = page.querySelector('#cinema-select-dropdown');
        const showtimeContainer = page.querySelector('#showtime-select-container');
        const seatGrid = page.querySelector('#seat-selection-grid');
        const summary = {
            cinema: page.querySelector('#summary-cinema'),
            showtime: page.querySelector('#summary-showtime'),
            seats: page.querySelector('#summary-seats'),
            count: page.querySelector('#summary-ticket-count'),
            total: page.querySelector('#summary-total-price'),
        };

        const resetBookingState = () => {
            state.selectedCinema = null;
            state.selectedShowtime = null;
            state.selectedSeats = [];
        };

        const updateSummary = () => {
            summary.cinema.textContent = state.selectedCinema ? state.selectedCinema.cinema_name : '-';
            summary.showtime.textContent = state.selectedShowtime ? state.selectedShowtime.time_string : '-';
            summary.seats.textContent = state.selectedSeats.length > 0 ? state.selectedSeats.join(', ') : '-';
            summary.count.textContent = state.selectedSeats.length;
            const totalPrice = state.selectedSeats.length * state.currentSelectedMovie.price;
            summary.total.textContent = totalPrice.toLocaleString('id-ID');
            page.querySelector('#proceed-to-payment-btn').disabled = state.selectedSeats.length === 0;
        };
        
        const handleSeatClick = (e) => {
            const seatEl = e.target;
            if(!seatEl.classList.contains('seat') || seatEl.classList.contains('booked')) return;
            
            const seatId = seatEl.dataset.seatId;
            const seatIndex = state.selectedSeats.indexOf(seatId);

            if (seatIndex > -1) {
                state.selectedSeats.splice(seatIndex, 1);
                seatEl.classList.remove('selected');
            } else {
                if (state.selectedSeats.length >= 6) {
                    alert('Anda hanya dapat memilih maksimal 6 kursi.'); return;
                }
                state.selectedSeats.push(seatId);
                seatEl.classList.add('selected');
            }
            updateSummary();
        };

        const renderSeats = async () => {
            seatGrid.innerHTML = '<p>Memuat kursi...</p>';
            if (!state.selectedShowtime) { seatGrid.innerHTML = '<p>Pilih jam tayang untuk melihat kursi.</p>'; return; }

            try {
                const bookedSeats = await apiFetch(`/booked-seats?showtimeId=${state.selectedShowtime.showtime_id}`);
                seatGrid.innerHTML = '';
                // Membuat 70 kursi (7 baris A-G, 10 kursi 1-10)
                for (let i = 0; i < 7; i++) {
                    const rowChar = String.fromCharCode(65 + i);
                    for (let j = 1; j <= 10; j++) {
                        const seatId = `${rowChar}${j}`;
                        const seatDiv = document.createElement('div');
                        seatDiv.className = 'seat';
                        seatDiv.dataset.seatId = seatId;
                        seatDiv.textContent = j;

                        if (bookedSeats.includes(seatId)) seatDiv.classList.add('booked');
                        if (state.selectedSeats.includes(seatId)) seatDiv.classList.add('selected');
                        
                        seatGrid.appendChild(seatDiv);
                    }
                }
            } catch (error) { seatGrid.innerHTML = '<p>Gagal memuat kursi.</p>'; }
        };

        const populateShowtimes = async () => {
            showtimeContainer.innerHTML = '<p>Memuat jadwal...</p>';
            state.selectedSeats = [];
            state.selectedShowtime = null;
            await renderSeats(); // Render grid kosong
            updateSummary();
            try {
                const showtimes = await apiFetch(`/showtimes?movieId=${state.currentSelectedMovie.movie_id}&cinemaId=${state.selectedCinema.cinema_id}`);
                showtimeContainer.innerHTML = '';
                if(showtimes.length > 0) {
                    showtimes.forEach(show => {
                        const timeBtn = document.createElement('button');
                        timeBtn.className = 'showtime-option-btn';
                        timeBtn.textContent = show.time_string;
                        timeBtn.onclick = () => {
                            showtimeContainer.querySelectorAll('.showtime-option-btn').forEach(b => b.classList.remove('selected'));
                            timeBtn.classList.add('selected');
                            state.selectedShowtime = show;
                            state.selectedSeats = []; // Reset kursi saat ganti jam
                            renderSeats();
                            updateSummary();
                        };
                        showtimeContainer.appendChild(timeBtn);
                    });
                } else {
                    showtimeContainer.innerHTML = '<p>Tidak ada jadwal tayang.</p>';
                }
            } catch (error) { showtimeContainer.innerHTML = '<p>Gagal memuat jadwal.</p>'; }
        };

        const populateCinemas = async () => {
            cinemaDropdown.innerHTML = '<option>Memuat...</option>';
            try {
                const cinemas = await apiFetch(`/cinemas?city=${encodeURIComponent(state.selectedCityName)}`);
                cinemaDropdown.innerHTML = cinemas.map(c => `<option value="${c.cinema_id}">${c.cinema_name}</option>`).join('');
                if (cinemas.length > 0) {
                    state.selectedCinema = cinemas[0];
                    await populateShowtimes();
                } else { cinemaDropdown.innerHTML = '<option>Tidak ada bioskop</option>'; }
            } catch (error) { cinemaDropdown.innerHTML = '<option>Gagal</option>'; }
        };

        const open = (movie) => {
            if (!state.currentUser) { authModule.open('login'); return; }
            state.currentSelectedMovie = movie;
            resetBookingState();
            
            page.querySelector('#booking-movie-title').textContent = movie.title;
            page.querySelector('#booking-movie-poster-img').style.backgroundImage = `url('${movie.poster_url}')`;
            page.querySelector('#booking-movie-synopsis').textContent = movie.synopsis;
            page.querySelector('#booking-movie-price').textContent = movie.price.toLocaleString('id-ID');

            showPage('booking-page');
            populateCinemas();
            updateSummary();
        };

        cinemaDropdown.addEventListener('change', async () => {
            const cinemaId = cinemaDropdown.value;
            const cinemas = await apiFetch(`/cinemas?city=${encodeURIComponent(state.selectedCityName)}`);
            state.selectedCinema = cinemas.find(c => c.cinema_id == cinemaId);
            populateShowtimes();
        });
        
        page.querySelector('#proceed-to-payment-btn').addEventListener('click', () => {
            document.getElementById('payment-total-amount').textContent = page.querySelector('#summary-total-price').textContent;
            showPage('payment-page');

        });

        document.getElementById('confirm-payment-btn').addEventListener('click', async () => {
            try {
                const bookingData = { 
                    showtimeId: state.selectedShowtime.showtime_id, 
                    seats: state.selectedSeats 
                };
                const result = await apiFetch('/bookings', { method: 'POST', body: JSON.stringify(bookingData) });
                
                document.getElementById('ticket-movie-title').textContent = state.currentSelectedMovie.title;
                document.getElementById('ticket-cinema').textContent = state.selectedCinema.cinema_name;
                document.getElementById('ticket-showtime').textContent = state.selectedShowtime.time_string;
                document.getElementById('ticket-seats').textContent = state.selectedSeats.join(', ');
                document.getElementById('ticket-total-price').textContent = result.totalPrice.toLocaleString('id-ID');
                document.getElementById('ticket-booking-code').textContent = result.bookingCode;
                
                showPage('confirmation-page');
            } catch (error) {
                alert(`Booking Gagal: ${error.message}`);
            }
        });
        
        return { open };
    })();

    // === GLOBAL EVENT LISTENERS ===
    citySelect.addEventListener('change', () => { state.selectedCityName = citySelect.value; renderContentForCity(); showPage('movie-gallery-page'); });

    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('.book-now-btn, .hero-buttons .book-now')) {
            const movie = state.allMovies.find(m => m.movie_id == target.dataset.movieid); if(movie) bookingModule.open(movie);
        } else if (target.matches('.upcoming-details-btn')) {
            const movie = state.allMovies.find(m => m.movie_id == target.dataset.movieid); if(movie) upcomingDetailPage.open(movie);
        } else if (target.matches('.carousel-nav-btn')) {
            const grid = target.parentElement.querySelector('.movies-grid');
            grid.scrollBy({ left: target.classList.contains('next') ? (grid.clientWidth*0.9) : -(grid.clientWidth*0.9), behavior: 'smooth' });
        } else if (target.matches('.hero-buttons .watch-trailer')) {
            trailerModule.open(target.dataset.trailerurl);
        } else if (target.matches('.back-button')) {
            showPage(target.dataset.target);

        } else if(target.matches('#back-to-home-btn')) {
            showPage('movie-gallery-page');
        }
    });

    // --- INITIALIZATION ---
    document.addEventListener('DOMContentLoaded', () => {
        authModule.checkStatus();
        populateCities();
        showPage('movie-gallery-page');
    });
})();
