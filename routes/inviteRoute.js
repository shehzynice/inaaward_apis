const express = require('express');
const  inivteUser = require('../controllers/InviteController');
const router = express.Router();

// Routes
router.post('/invite-user', inivteUser.inviteOrAddContestant);  // Create Admin

module.exports = router;
