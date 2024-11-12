const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const flash = require('express-flash');

// Middleware untuk menggunakan flash
router.use(flash());

// Render halaman register
router.get('/register', (req, res) => {
    res.render('register');
});

// Proses registrasi
router.post('/register', (req, res) => {
    const { username, email, prodi, asal, password } = req.body;

    // Validasi input
    if (!username || !email || !password || !prodi || !asal) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/auth/register');
    }

    //password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = "INSERT INTO users (username, email, prodi, asal, password) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [username, email, prodi, asal, hashedPassword], (err, result) => {
        if (err) {
            req.flash('error', 'Registration failed.');
            return res.redirect('/auth/register');
        }
        req.flash('success', 'Registration successful. Please login.');
        res.redirect('/auth/login');
    });
});

// Render halaman login
router.get('/login', (req, res) => {
    res.render('login', { error: req.flash('error') });
});

// Proses login user
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            const user = result[0];

            // Periksa password
            if (bcrypt.compareSync(password, user.password)) {
                req.session.user = user; // Menyimpan user di session
                return res.redirect('/home'); // Redirect ke halaman home
            } else {
                return res.send('Incorrect password');
            }
        } else {
            return res.send('User not found');
        }
    });
});

// Render halaman profil
router.get('/profile', (req, res) => {
    if (req.session.user) {
        res.render('profile', { user: req.session.user });
    } else {
        res.redirect('/auth/login');
    }
});

// Proses logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

// Proses update data user
router.post('/update', (req, res) => {
    const { id, username, email, prodi, asal } = req.body;

    // Validasi server-side untuk memastikan input tidak kosong
    if (!id || !username || !email || !prodi || !asal) {
        return res.send('Please fill in all fields.');
    }

    const query = "UPDATE users SET username = ?, email = ?, prodi = ?, asal = ? WHERE id = ?";
    db.query(query, [username, email, prodi, asal, id], (err, result) => {
        if (err) throw err;
        req.session.user = { id, username, email, prodi, asal }; // Update session dengan data terbaru
        res.redirect('/auth/profile'); // Redirect kembali ke halaman profil setelah update
    });
});

module.exports = router;
