const express = require('express');
const { createAdmin, signinAdmin } = require('../controllers/adminController');
const router = express.Router();

// Routes
router.post('/create-admin', createAdmin);  // Create Admin
router.post('/signin-admin', signinAdmin); // Sign in Admin

module.exports = router;
