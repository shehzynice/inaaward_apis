const express = require('express');
const  inivteUser = require('../controllers/suAuthController');
const router = express.Router();

// Routes
router.post('/signup', inivteUser.signup); // Corrected from '/sigup' to '/signup'
router.post('/sigin', inivteUser.login);  

module.exports = router;