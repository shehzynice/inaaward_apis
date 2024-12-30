const express = require('express');
const  inivteUser = require('../controllers/subConnterller');
const router = express.Router();

// Routes
router.post('/subuser-contestlist', inivteUser.getContestantListsByContestantId);
router.post('/subuser-transaction', inivteUser.getTransactionHistory);
router.get('/web-contest-list', inivteUser.getActiveContestContestants);
router.post('/web-create-payment', inivteUser.createTransactionHistory);
router.get('/web-gettop-contest', inivteUser.getTopContestantsForCompletedContests);

module.exports = router;