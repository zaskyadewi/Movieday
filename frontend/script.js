(() => {
  // Variabel API_DATA lama bisa Anda hapus atau komentari nanti
  // setelah semua fungsi mengambil data dari backend.
  /*
  const API_DATA = {
    Jakarta: { ... },
    Bandung: { ... },
    Surabaya: { ... }
  };
  */

  let selectedCityName = "Jakarta"; // Akan di-update dari data backend
  let currentSelectedMovie = null;
  let selectedSeats = [];
  let selectedShowtime = null;
  let selectedCinema = null; // Akan menjadi objek cinema dari backend, atau ID cinema
  let currentUser = null;

  const MAX_SEATS_SELECTABLE = 6;
  const TOTAL_SEATS_PER_ROW = 10;
  const TOTAL_ROWS = 7;

  // Page Sections
  const movieGalleryPage = document.getElementById("movie-gallery-page");
  const bookingPage = document.getElementById("booking-page");
  const paymentPage = document.getElementById("payment-page");
  const confirmationPage = document.getElementById("confirmation-page");

  // Element Selectors
  const citySelect = document.getElementById("city-select");
  const nowShowingGrid = document.getElementById("now-showing-grid");
  const upcomingGrid = document.getElementById("upcoming-grid");

  // Booking Page Elements
  const bookingMoviePosterImg = document.getElementById("booking-movie-poster-img");
  const bookingMovieTitle = document.getElementById("booking-movie-title");
  const bookingMovieSynopsis = document.getElementById("booking-movie-synopsis");
  const bookingMoviePrice = document.getElementById("booking-movie-price");
  const cinemaSelectDropdown = document.getElementById("cinema-select-dropdown");
  const showtimeSelectContainer = document.getElementById("showtime-select-container");
  const seatSelectionGrid = document.getElementById("seat-selection-grid");
  const proceedToPaymentBtn = document.getElementById("proceed-to-payment-btn");

  // Booking Summary Elements
  const summaryCinema = document.getElementById("summary-cinema");
  const summaryShowtime = document.getElementById("summary-showtime");
  const summarySeats = document.getElementById("summary-seats");
  const summaryTicketCount = document.getElementById("summary-ticket-count");
  const summaryTotalPrice = document.getElementById("summary-total-price");

  // Payment Page Elements
  const paymentTotalAmount = document.getElementById("payment-total-amount");
  const confirmPaymentBtn = document.getElementById("confirm-payment-btn");

  // Confirmation Page Elements
  const ticketMovieTitle = document.getElementById("ticket-movie-title");
  const ticketCinema = document.getElementById("ticket-cinema");
  const ticketShowtime = document.getElementById("ticket-showtime");
  const ticketSeats = document.getElementById("ticket-seats");
  const ticketTotalPrice = document.getElementById("ticket-total-price");
  const ticketBookingCode = document.getElementById("ticket-booking-code");

  // Buttons
  const backToGalleryBtn = document.getElementById("back-to-gallery-btn");
  const backToBookingBtn = document.getElementById("back-to-booking-btn");
  const backToHomeBtn = document.getElementById("back-to-home-btn");

  // Modal Elements
  const loginModal = document.getElementById("login-modal");
  const registerModal = document.getElementById("register-modal");
  const closeLoginModalBtn = document.getElementById("close-login-modal-btn");
  const closeRegisterModalBtn = document.getElementById("close-register-modal-btn");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const showRegisterLink = document.getElementById("show-register-link");
  const showLoginLink = document.getElementById("show-login-link");
  const userAuthNav = document.getElementById("user-auth-nav");

  const BASE_URL_BACKEND = 'http://localhost:3001/api'; // Definisikan base URL backend

  function showPage(pageName) {
    movieGalleryPage.classList.add("hidden");
    bookingPage.classList.add("hidden");
    paymentPage.classList.add("hidden");
    confirmationPage.classList.add("hidden");

    if (pageName === "movie-gallery") movieGalleryPage.classList.remove("hidden");
    else if (pageName === "booking") bookingPage.classList.remove("hidden");
    else if (pageName === "payment") paymentPage.classList.remove("hidden");
    else if (pageName === "confirmation") confirmationPage.classList.remove("hidden");
    window.scrollTo(0, 0);
  }

  function openModal(modalElement) {
    modalElement.classList.remove("hidden");
  }

  function closeModal(modalElement) {
    modalElement.classList.add("hidden");
  }

  function updateUserAuthNav() {
    userAuthNav.innerHTML = "";
    if (currentUser) {
      const profileName = document.createElement("span");
      profileName.className = "user-profile-name";
      profileName.textContent = `Halo, ${currentUser.name.split(" ")[0]}!`;

      const logoutBtn = document.createElement("button");
      logoutBtn.id = "logout-btn";
      logoutBtn.className = "user-auth-nav-item";
      logoutBtn.textContent = "Logout";
      logoutBtn.addEventListener("click", handleLogout);

      userAuthNav.appendChild(profileName);
      userAuthNav.appendChild(logoutBtn);
    } else {
      const loginBtn = document.createElement("button");
      loginBtn.id = "login-header-btn";
      loginBtn.className = "user-auth-nav-item";
      loginBtn.textContent = "Login";
      loginBtn.addEventListener("click", () => openModal(loginModal));

      const registerBtn = document.createElement("button");
      registerBtn.id = "register-header-btn";
      registerBtn.className = "user-auth-nav-item";
      registerBtn.textContent = "Daftar";
      registerBtn.addEventListener("click", () => openModal(registerModal));

      userAuthNav.appendChild(loginBtn);
      userAuthNav.appendChild(registerBtn);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    // Implementasi handleLogin dengan fetch ke API backend Anda
    // Contoh: POST /api/login
    // Setelah berhasil, simpan currentUser di localStorage dan panggil updateUserAuthNav
    // Untuk sekarang, kita biarkan logika localStorage yang ada
    const email = loginForm['login-email'].value.trim();
    const password = loginForm['login-password'].value;

    if (!email || !password) {
        alert("Email dan password tidak boleh kosong.");
        return;
    }
    // Logika login dummy/localStorage bisa diganti dengan fetch ke backend nanti
    const storedUserRaw = localStorage.getItem('movieDayUsers');
    const storedUsers = storedUserRaw ? JSON.parse(storedUserRaw) : {};
    const userFound = Object.values(storedUsers).find(user => user.email === email && user.password === password);

    if (userFound) {
        currentUser = userFound;
        localStorage.setItem('movieDayCurrentUser', JSON.stringify(currentUser));
        updateUserAuthNav();
        closeModal(loginModal);
        loginForm.reset();
        alert(`Selamat datang kembali, ${currentUser.name}!`);
    } else {
        alert("Email atau password salah menggunakan data lokal. Implementasikan login backend.");
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    // Implementasi handleRegister dengan fetch ke API backend Anda
    // Contoh: POST /api/register
    // Setelah berhasil, mungkin langsung login atau minta user login manual
    // Untuk sekarang, kita biarkan logika localStorage yang ada
    const name = registerForm['register-name'].value.trim();
    const email = registerForm['register-email'].value.trim();
    const password = registerForm['register-password'].value;
    const confirmPassword = registerForm['register-confirm-password'].value;
    // Validasi dasar
    if (!name || !email || !password || !confirmPassword) { alert("Semua kolom wajib diisi."); return; }
    if (password !== confirmPassword) { alert("Password tidak cocok."); return; }

    // Logika register dummy/localStorage bisa diganti dengan fetch ke backend nanti
    const storedUserRaw = localStorage.getItem('movieDayUsers');
    const storedUsers = storedUserRaw ? JSON.parse(storedUserRaw) : {};
    if (Object.values(storedUsers).some(user => user.email === email)) {
        alert("Email sudah terdaftar (data lokal)."); return;
    }
    const newUser = { name, email, password };
    storedUsers[email] = newUser;
    localStorage.setItem('movieDayUsers', JSON.stringify(storedUsers));
    currentUser = newUser;
    localStorage.setItem('movieDayCurrentUser', JSON.stringify(currentUser));
    updateUserAuthNav();
    closeModal(registerModal);
    registerForm.reset();
    alert("Pendaftaran berhasil (data lokal)! Anda sekarang sudah login.");
  }

  function handleLogout() {
    // Implementasi logout juga bisa memanggil API backend jika perlu (misalnya, invalidasi token)
    currentUser = null;
    localStorage.removeItem('movieDayCurrentUser');
    updateUserAuthNav();
    alert("Anda telah logout.");
    showPage("movie-gallery");
  }

  function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('movieDayCurrentUser');
    if (loggedInUser) {
      currentUser = JSON.parse(loggedInUser);
    }
    updateUserAuthNav();
  }

  // --- MODIFIKASI DIMULAI DARI SINI ---

  async function populateCitySelector() {
    console.log("Mencoba mengambil data kota dari backend...");
    try {
      const response = await fetch(`${BASE_URL_BACKEND}/cities`);
      if (!response.ok) {
        throw new Error(`Gagal mengambil data kota: ${response.status} ${response.statusText}`);
      }
      const cities = await response.json(); // cities = [{city_id: 1, city_name: "Jakarta"}, ...]
      console.log("Data kota diterima:", cities);

      citySelect.innerHTML = ""; // Kosongkan pilihan lama
      if (cities && cities.length > 0) {
        cities.forEach(city => {
          const optionElement = document.createElement("option");
          optionElement.textContent = city.city_name;
          optionElement.value = city.city_name; // Atau city.city_id jika backend Anda menggunakan itu untuk filter film
          citySelect.appendChild(optionElement);
        });

        // Atur kota yang terpilih secara default
        selectedCityName = cities[0].city_name;
        citySelect.value = selectedCityName;
        console.log("Kota terpilih default:", selectedCityName);
      } else {
        citySelect.innerHTML = "<option>Tidak ada kota tersedia</option>";
      }
    } catch (error) {
      console.error("Error saat populateCitySelector:", error);
      citySelect.innerHTML = "<option>Gagal memuat data kota</option>";
    }
    // Panggil renderMovies setelah kota dimuat
    renderMovies();
  }

  function renderMovieCard(movie) { // movie adalah objek dari backend
    const card = document.createElement("div");
    card.className = "movie-card";

    // Pastikan properti objek movie (movie.title, movie.poster_url, dll.)
    // sesuai dengan apa yang dikirim oleh backend Anda.
    card.innerHTML = `
      <div class="movie-poster" style="background-image: url('${movie.poster_url || 'https://via.placeholder.com/200x300.png?text=No+Image'}')"></div>
      <div class="movie-info">
        <div class="movie-title">${movie.title}</div>
        <p class="movie-synopsis">${(movie.synopsis ? movie.synopsis.substring(0, 100) : "") + (movie.synopsis && movie.synopsis.length > 100 ? "..." : "")}</p>
        ${movie.status === 'now_showing' ? `<button class="book-now-btn" data-movieid="${movie.movie_id}">Book Now</button>` : '<button class="book-now-btn" disabled>Segera Tayang</button>'}
      </div>`;

    if (movie.status === 'now_showing') {
      const bookBtn = card.querySelector(".book-now-btn");
      bookBtn.addEventListener("click", () => {
        // Kita perlu objek movie lengkap untuk openBookingPage
        // Jadi, kita perlu cara untuk mendapatkan objek movie dari klik tombol ini
        // atau mengirim ID dan mengambil detailnya lagi.
        // Untuk sekarang, kita asumsikan 'movie' yang di-pass ke renderMovieCard sudah cukup detail.
        currentSelectedMovie = movie; // Simpan movie yang diklik
        openBookingPage();
      });
    }
    return card;
  }

  async function renderMovies() {
    nowShowingGrid.innerHTML = "<p>Memuat film Now Showing...</p>";
    upcomingGrid.innerHTML = "<p>Memuat film Upcoming...</p>";

    if (!selectedCityName) {
      nowShowingGrid.innerHTML = "<p>Pilih kota terlebih dahulu.</p>";
      upcomingGrid.innerHTML = "<p>Pilih kota terlebih dahulu.</p>";
      return;
    }

    try {
      // Ambil Film Now Showing
      const nsResponse = await fetch(`${BASE_URL_BACKEND}/movies/now-showing?city=${encodeURIComponent(selectedCityName)}`);
      if (!nsResponse.ok) {
        throw new Error(`Gagal mengambil film Now Showing: ${nsResponse.status}`);
      }
      const nowShowingMovies = await nsResponse.json();
      nowShowingGrid.innerHTML = ""; // Kosongkan
      if (nowShowingMovies && nowShowingMovies.length > 0) {
        nowShowingMovies.forEach(movie => {
          nowShowingGrid.appendChild(renderMovieCard(movie));
        });
      } else {
        nowShowingGrid.innerHTML = "<p>Belum ada film yang sedang tayang di kota ini.</p>";
      }

      // Ambil Film Upcoming (Anda perlu endpoint ini di backend)
      const ucResponse = await fetch(`${BASE_URL_BACKEND}/movies/upcoming?city=${encodeURIComponent(selectedCityName)}`);
      if (!ucResponse.ok) {
        throw new Error(`Gagal mengambil film Upcoming: ${ucResponse.status}`);
      }
      const upcomingMovies = await ucResponse.json();
      upcomingGrid.innerHTML = ""; // Kosongkan
      if (upcomingMovies && upcomingMovies.length > 0) {
        upcomingMovies.forEach(movie => {
          upcomingGrid.appendChild(renderMovieCard(movie)); // Menggunakan renderMovieCard yang sama
        });
      } else {
        upcomingGrid.innerHTML = "<p>Belum ada film mendatang untuk kota ini.</p>";
      }

    } catch (error) {
      console.error("Error di renderMovies:", error);
      nowShowingGrid.innerHTML = "<p>Gagal memuat film Now Showing.</p>";
      upcomingGrid.innerHTML = "<p>Gagal memuat film Upcoming.</p>";
    }
  }

  async function openBookingPage() {
    if (!currentUser) {
      alert("Anda harus login terlebih dahulu untuk melakukan booking.");
      openModal(loginModal);
      return;
    }
    if (!currentSelectedMovie) {
      console.error("Tidak ada film yang dipilih untuk booking.");
      return;
    }

    console.log("Membuka halaman booking untuk:", currentSelectedMovie.title);

    // Reset state booking sebelumnya
    selectedSeats = [];
    selectedShowtime = null;
    selectedCinema = null; // Ini akan menjadi ID atau objek cinema

    // Tampilkan detail film yang sudah ada di currentSelectedMovie
    bookingMoviePosterImg.style.backgroundImage = `url('${currentSelectedMovie.poster_url || 'https://via.placeholder.com/200x300.png?text=No+Image'}')`;
    bookingMovieTitle.textContent = currentSelectedMovie.title;
    bookingMovieSynopsis.textContent = currentSelectedMovie.synopsis || "Sinopsis tidak tersedia.";
    bookingMoviePrice.textContent = (currentSelectedMovie.price || 0).toLocaleString('id-ID');

    // 1. Ambil Daftar Bioskop untuk Kota yang Dipilih
    cinemaSelectDropdown.innerHTML = "<option>Memuat bioskop...</option>";
    try {
      const cinemaResponse = await fetch(`${BASE_URL_BACKEND}/cinemas?city=${encodeURIComponent(selectedCityName)}`);
      if (!cinemaResponse.ok) throw new Error("Gagal mengambil daftar bioskop");
      const cinemas = await cinemaResponse.json(); // cinemas = [{cinema_id: 1, cinema_name: "Movieday GI"}, ...]

      cinemaSelectDropdown.innerHTML = "";
      if (cinemas && cinemas.length > 0) {
        cinemas.forEach(cinema => {
          const option = document.createElement("option");
          option.value = cinema.cinema_id; // Simpan cinema_id sebagai value
          option.textContent = cinema.cinema_name;
          cinemaSelectDropdown.appendChild(option);
        });
        // Otomatis pilih bioskop pertama dan ambil jadwal tayangnya
        if (cinemaSelectDropdown.options.length > 0) {
            cinemaSelectDropdown.selectedIndex = 0;
            selectedCinema = cinemas[0]; // Simpan objek cinema pertama atau ID-nya
            await populateShowtimes(); // Panggil fungsi untuk mengisi jadwal tayang
        }
      } else {
        cinemaSelectDropdown.innerHTML = "<option>Tidak ada bioskop di kota ini</option>";
        showtimeSelectContainer.innerHTML = "<p>Pilih bioskop terlebih dahulu.</p>";
      }
    } catch (error) {
      console.error("Error mengambil bioskop:", error);
      cinemaSelectDropdown.innerHTML = "<option>Gagal memuat bioskop</option>";
      showtimeSelectContainer.innerHTML = "<p>Gagal memuat bioskop.</p>";
    }

    // Event listener untuk perubahan bioskop
    cinemaSelectDropdown.onchange = async () => {
        const selectedCinemaId = cinemaSelectDropdown.value;
        // Anda mungkin perlu mencari objek cinema lengkap jika hanya menyimpan ID
        // Untuk sekarang, kita asumsikan kita bisa mendapatkan cinemaId dengan mudah
        // dan memanggil populateShowtimes
        const cinemaResponse = await fetch(`${BASE_URL_BACKEND}/cinemas?city=${encodeURIComponent(selectedCityName)}`);
        const cinemas = await cinemaResponse.json();
        selectedCinema = cinemas.find(c => c.cinema_id == selectedCinemaId); // Temukan objek cinema yang dipilih

        await populateShowtimes();
        updateBookingSummary();
    };

    renderSeatGrid(); // Tetap render grid kursi (ketersediaan kursi mungkin perlu dari backend juga nanti)
    updateBookingSummary();
    showPage("booking");
  }

  async function populateShowtimes() {
    showtimeSelectContainer.innerHTML = "<p>Memuat jadwal tayang...</p>";
    if (!currentSelectedMovie || !selectedCinema || !selectedCinema.cinema_id) {
      showtimeSelectContainer.innerHTML = "<p>Pilih film dan bioskop terlebih dahulu.</p>";
      return;
    }

    try {
      // Anda perlu endpoint di backend untuk ini: /api/showtimes?movieId=...&cinemaId=...
      // Endpoint ini harus mengembalikan array jadwal tayang, misal: ["12:00", "15:00"]
      const showtimeResponse = await fetch(`${BASE_URL_BACKEND}/showtimes?movieId=${currentSelectedMovie.movie_id}&cinemaId=${selectedCinema.cinema_id}`);
      if (!showtimeResponse.ok) throw new Error("Gagal mengambil jadwal tayang");
      const showtimes = await showtimeResponse.json(); // Asumsi backend mengembalikan array jadwal tayang (string atau objek)
                                                     // Jika objek, misal {showtime_id: ..., show_datetime: "YYYY-MM-DDTHH:mm:ssZ"}
                                                     // Anda perlu memformatnya. Untuk contoh ini, kita asumsikan array string jam saja.

      showtimeSelectContainer.innerHTML = "";
      if (showtimes && showtimes.length > 0) {
        showtimes.forEach(time => { // Jika 'time' adalah string jam "HH:mm"
          const timeBtn = document.createElement("button");
          timeBtn.className = "showtime-option-btn";
          // Jika backend mengirim full datetime, format di sini:
          // const dateObj = new Date(time.show_datetime);
          // timeBtn.textContent = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
          // timeBtn.dataset.time = time.show_datetime; // Simpan full datetime jika perlu
          timeBtn.textContent = time; // Asumsi 'time' sudah string "HH:mm"
          timeBtn.dataset.time = time;

          timeBtn.addEventListener("click", () => {
            document.querySelectorAll("#showtime-select-container .showtime-option-btn").forEach(btn => btn.classList.remove("selected"));
            timeBtn.classList.add("selected");
            selectedShowtime = timeBtn.dataset.time;
            // Saat jadwal dipilih, Anda mungkin perlu memuat ulang ketersediaan kursi dari backend
            renderSeatGrid(); // Idealnya, renderSeatGrid juga mengambil data kursi terisi dari backend
            updateBookingSummary();
          });
          showtimeSelectContainer.appendChild(timeBtn);
        });
        // Otomatis pilih jadwal pertama
        if (showtimeSelectContainer.firstChild && showtimeSelectContainer.firstChild.click) {
            showtimeSelectContainer.firstChild.click();
        }
      } else {
        showtimeSelectContainer.innerHTML = "<p>Tidak ada jadwal tayang tersedia.</p>";
      }
    } catch (error) {
      console.error("Error mengambil jadwal tayang:", error);
      showtimeSelectContainer.innerHTML = "<p>Gagal memuat jadwal tayang.</p>";
    }
  }


  function renderSeatGrid() {
    seatSelectionGrid.innerHTML = "";
    // Idealnya, daftar kursi yang sudah dibooking (`bookedSeatsForShowtime`)
    // diambil dari backend berdasarkan `currentSelectedMovie.movie_id`, `selectedCinema.cinema_id`, dan `selectedShowtime`.
    // Untuk sekarang, kita masih pakai simulasi localStorage atau default.
    let bookedSeatsForShowtime = ['A3', 'B5', 'C7']; // Placeholder
    if (currentSelectedMovie && selectedCinema && selectedShowtime) {
        const demoBookedSeatKey = `booked_${currentSelectedMovie.movie_id}_${selectedCinema.cinema_id}_${selectedShowtime}`;
        bookedSeatsForShowtime = JSON.parse(localStorage.getItem(demoBookedSeatKey)) || ['A3', 'B5', 'C7', 'D2', 'E10', 'F6'];
    }


    for (let i = 0; i < TOTAL_ROWS; i++) {
      const rowChar = String.fromCharCode(65 + i);
      for (let j = 1; j <= TOTAL_SEATS_PER_ROW; j++) {
        const seatId = `${rowChar}${j}`;
        const seatDiv = document.createElement("div");
        seatDiv.className = "seat";
        seatDiv.textContent = seatId;
        seatDiv.dataset.seatId = seatId;

        if (bookedSeatsForShowtime.includes(seatId)) {
          seatDiv.classList.add("booked");
        } else {
          seatDiv.addEventListener("click", handleSeatClick);
        }
        if (selectedSeats.includes(seatId)){ // Jika kursi ini ada di selectedSeats, tandai
            seatDiv.classList.add("selected");
        }
        seatSelectionGrid.appendChild(seatDiv);
      }
    }
  }

  function handleSeatClick(event) {
    const seatDiv = event.target;
    const seatId = seatDiv.dataset.seatId;

    if (seatDiv.classList.contains("booked")) return;

    const seatIndex = selectedSeats.indexOf(seatId);
    if (seatIndex > -1) {
      selectedSeats.splice(seatIndex, 1);
      seatDiv.classList.remove("selected");
    } else {
      if (selectedSeats.length < MAX_SEATS_SELECTABLE) {
        selectedSeats.push(seatId);
        seatDiv.classList.add("selected");
      } else {
        alert(`Anda hanya dapat memilih maksimal ${MAX_SEATS_SELECTABLE} kursi.`);
      }
    }
    updateBookingSummary();
  }

  function updateBookingSummary() {
    if (!currentSelectedMovie) return;

    // Pastikan selectedCinema adalah objek dengan nama, atau string jika hanya nama yang disimpan
    const cinemaName = selectedCinema ? (typeof selectedCinema === 'object' ? selectedCinema.cinema_name : selectedCinema) : "-";
    summaryCinema.textContent = cinemaName;
    summaryShowtime.textContent = selectedShowtime || "-";
    summarySeats.textContent = selectedSeats.length > 0 ? selectedSeats.sort().join(", ") : "-";
    summaryTicketCount.textContent = selectedSeats.length;

    const totalPrice = selectedSeats.length * (currentSelectedMovie.price || 0);
    summaryTotalPrice.textContent = totalPrice.toLocaleString('id-ID');

    // Tombol bayar aktif jika semua pilihan sudah ada
    proceedToPaymentBtn.disabled = !(selectedCinema && selectedShowtime && selectedSeats.length > 0);
  }

  async function proceedToPayment() { // Ubah menjadi async jika perlu panggil API
    if (proceedToPaymentBtn.disabled) return;

    // Di sini Anda bisa mengirim data booking ke backend untuk disimpan sebelum ke halaman QRIS
    // Contoh: POST /api/bookings
    // const bookingData = {
    //   userId: currentUser.user_id, // Asumsi currentUser punya user_id
    //   movieId: currentSelectedMovie.movie_id,
    //   cinemaId: selectedCinema.cinema_id, // Asumsi selectedCinema adalah objek
    //   showtime: selectedShowtime, // Ini mungkin perlu showtime_id dari backend
    //   seats: selectedSeats, // Array ["A1", "B2"]
    //   totalPrice: selectedSeats.length * currentSelectedMovie.price
    // };
    // try {
    //   const response = await fetch(`${BASE_URL_BACKEND}/bookings`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(bookingData)
    //   });
    //   if (!response.ok) throw new Error("Gagal membuat booking awal");
    //   const bookingResult = await response.json();
    //   // Simpan bookingResult.booking_code atau bookingResult.qris_data jika ada
    //   console.log("Booking awal berhasil:", bookingResult);
    // } catch (error) {
    //   console.error("Error saat booking awal:", error);
    //   alert("Gagal memproses booking. Silakan coba lagi.");
    //   return;
    // }

    paymentTotalAmount.textContent = (selectedSeats.length * (currentSelectedMovie.price || 0)).toLocaleString('id-ID');
    showPage("payment");
  }

  async function confirmPayment() { // Ubah menjadi async
    // Setelah pengguna "membayar" (simulasi), update status booking di backend
    // Contoh: PUT /api/bookings/:bookingId/confirm-payment
    // Anda memerlukan booking_code atau booking_id dari langkah `proceedToPayment`

    // Untuk sekarang, kita langsung ke halaman konfirmasi
    ticketMovieTitle.textContent = currentSelectedMovie.title;
    const cinemaName = selectedCinema ? (typeof selectedCinema === 'object' ? selectedCinema.cinema_name : selectedCinema) : "-";
    ticketCinema.textContent = cinemaName;
    ticketShowtime.textContent = selectedShowtime;
    ticketSeats.textContent = selectedSeats.sort().join(", ");
    ticketTotalPrice.textContent = (selectedSeats.length * (currentSelectedMovie.price || 0)).toLocaleString('id-ID');
    ticketBookingCode.textContent = `MD${Date.now().toString().slice(-6)}`; // Kode booking dummy

    // "Booking" kursi yang dipilih untuk demo di localStorage (bisa dihapus jika backend menangani ini)
    if (currentSelectedMovie && selectedCinema && selectedShowtime) {
        const demoBookedSeatKey = `booked_${currentSelectedMovie.movie_id}_${selectedCinema.cinema_id}_${selectedShowtime}`;
        let currentlyBookedSeats = JSON.parse(localStorage.getItem(demoBookedSeatKey)) || [];
        selectedSeats.forEach(seat => {
            if (!currentlyBookedSeats.includes(seat)) {
                currentlyBookedSeats.push(seat);
            }
        });
        localStorage.setItem(demoBookedSeatKey, JSON.stringify(currentlyBookedSeats));
    }


    // Reset state setelah booking berhasil
    currentSelectedMovie = null;
    selectedSeats = [];
    selectedShowtime = null;
    selectedCinema = null;


    showPage("confirmation");
  }

  // Event Listeners
  citySelect.addEventListener("change", (event) => {
    selectedCityName = event.target.value;
    console.log("Kota berubah menjadi:", selectedCityName);
    renderMovies(); // Panggil renderMovies saat kota berubah
    // Jika sedang di halaman booking/payment/confirmation, kembali ke galeri
    if (!movieGalleryPage.classList.contains("active") && (bookingPage.classList.contains("active") || paymentPage.classList.contains("active") || confirmationPage.classList.contains("active"))){
        showPage("movie-gallery");
    }
  });

  closeLoginModalBtn.addEventListener("click", () => closeModal(loginModal));
  closeRegisterModalBtn.addEventListener("click", () => closeModal(registerModal));
  loginForm.addEventListener("submit", handleLogin);
  registerForm.addEventListener("submit", handleRegister);

  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(registerModal);
  });

  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(registerModal);
    openModal(loginModal);
  });

  window.addEventListener("click", (event) => {
    if (event.target == loginModal) closeModal(loginModal);
    if (event.target == registerModal) closeModal(registerModal);
  });

  backToGalleryBtn.addEventListener("click", () => showPage("movie-gallery"));
  proceedToPaymentBtn.addEventListener("click", proceedToPayment);
  backToBookingBtn.addEventListener("click", () => showPage("booking"));
  confirmPaymentBtn.addEventListener("click", confirmPayment);
  backToHomeBtn.addEventListener("click", () => {
    // populateCitySelector(); // Tidak perlu dipanggil lagi, biarkan kota terpilih
    renderMovies();
    showPage("movie-gallery");
  });

  // Initial Load
  window.addEventListener("DOMContentLoaded", () => {
    console.log("Halaman selesai dimuat, memulai inisialisasi...");
    checkLoginStatus();
    populateCitySelector(); // Ini akan memanggil renderMovies setelahnya
    showPage("movie-gallery");
  });

})();