const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const app = express();
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/todo-list-db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require('./config/passport')(passport);

// Routes
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.redirect('/login');
});

// Example route for rendering the registration view
app.get('/register', (req, res) => {
    res.render('registration');
});
app.get('/login', (req, res) => {
    res.render('login');
});

// Route to render the dashboard view
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard');
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

// Route to handle logout
app.post('/logout', (req, res) => {
    req.logout(); // This is provided by Passport.js to clear the session and remove the user property from req
    res.redirect('/logout-success'); // Redirect to a confirmation page
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    res.send('Welcome to your dashboard');
});

// Middleware to ensure authentication
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
