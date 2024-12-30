const express = require('express');
const { addContest, updateContest, deleteContest,getAllContests, getContestById,completeContest} = require('../controllers/contestController');
const router = express.Router();

// POST: Create a new contest
router.post('/create-contest', addContest);

// PUT: Update an existing contest
router.put('/update-contest', updateContest);
router.post('/complete-contest', completeContest);

// DELETE: Delete a contest (soft delete)
router.delete('/delete-contest', deleteContest);

// GET: Get all contests
router.get('/contests', getAllContests);

// GET: Get contest by ID
router.get('/contest/:id', getContestById);

module.exports = router;
