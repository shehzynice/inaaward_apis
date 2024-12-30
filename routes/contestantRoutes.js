const express = require('express');
const router = express.Router();
const contestantController = require('../controllers/contestantListController');

// Route to get contestants by contestId
router.post('/contestants/:contestId', contestantController.getContestantsByContestId);

// Route to get contestant by contestantId
router.post('/contestant/:contestantId', contestantController.getContestantById);


router.delete('/contestant-list-delete-byid', contestantController.deleteContestantListById);

module.exports = router;
