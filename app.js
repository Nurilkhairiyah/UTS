const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const hasiltangkapRoutes = require('./routes/hasiltangkap');
const path = require('path');

const app = express();

// set EJS sebagai template engine
app.set('view engine', 'ejs');

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware untuk memeriksa status login
app.use((req, res, next) => {
    if (!req.session.user && req.path !== '/auth/login' && req.path !== '/auth/register') {
        // Jika user belum login dan mencoba mengakses halaman selain login/register
        return res.redirect('/auth/login');
    } else if (req.session.user && req.path === '/') {
        // Jika user sudah login dan mencoba mengakses root route ('/')
        return res.redirect('/home');
    }
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/hasiltangkap', hasiltangkapRoutes);

// Route untuk halaman utama setelah login
app.get('/home', (req, res) => {
    if (req.session.user) {
        res.render('home', { user: req.session.user });
    } else {
        res.redirect('/auth/login');
    }
});

// Root Route: Redirect ke /home setelah login
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/home');
    } else {
        return res.redirect('/auth/login');
    }
});

// Menjalankan Server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
