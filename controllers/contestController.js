const Contest = require('../models/Contest'); // Import the Contest model
const ContestantList = require('../models/ContestantList');
const TransactionHistory = require('../models/TransactionHistory');

// 1. Create a new contest
exports.addContest = async (req, res) => {
  try {
    const { contestName, startDate, endDate, noVotes, revenue, status } = req.body;

    // Validate required fields
    if (!contestName || !startDate || !endDate || !status) {
      return res.status(400).json({
        success: false,
        message: 'Contest name, start date, end date, and status are required.',
        data: null,
      });
    }

    // Create a new contest
    const newContest = await Contest.create({
      contestName,
      startDate,
      endDate,
      noVotes: noVotes || 0,
      revenue: revenue || 0.0,
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Contest created successfully.',
      data: newContest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating contest.',
      data: null,
    });
  }
};

// 2. Update an existing contest
exports.updateContest = async (req, res) => {
  try {
    const { id } = req.body;
    const { contestName, startDate, endDate, noVotes, revenue, status } = req.body;
    if (!id ) {
      return res.status(400).json({
        success: false,
        message: 'Id are required.',
        data: null,
      });
    }
    // Find the contest by id
    const contest = await Contest.findByPk(id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found.',
        data: null,
      });
    }

    // Update contest details
    contest.contestName = contestName || contest.contestName;
    contest.startDate = startDate || contest.startDate;
    contest.endDate = endDate || contest.endDate;
    contest.noVotes = noVotes || contest.noVotes;
    contest.revenue = revenue || contest.revenue;
    contest.status = status || contest.status;

    await contest.save();

    res.status(200).json({
      success: true,
      message: 'Contest updated successfully.',
      data: contest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating contest.',
      data: null,
    });
  }
};

// 3. Delete (soft delete) a contest
exports.deleteContest = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id ) {
      return res.status(400).json({
        success: false,
        message: 'Id are required.',
        data: null,
      });
    }

    // Find the contest by id
    const contest = await Contest.findByPk(id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found.',
        data: null,
      });
    }

    // Soft delete the contest
    await contest.destroy();

    res.status(200).json({
      success: true,
      message: 'Contest deleted successfully.',
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contest.',
      data: null,
    });
  }
};


// 1. Get all contests


exports.getAllContests = async (req, res) => {
  try {
    const contests = await Contest.findAll({
      order: [['id', 'DESC']], // This orders by 'updatedAt' in descending order
    });

    const updatedContests = await Promise.all(
      contests.map(async (contest) => {
        const currentDate = new Date();
        const endDate = new Date(contest.endDate);

        // Determine the status based on endDate and current status
        if (contest.status === 'complete' || endDate < currentDate) {
          contest.status = 'Inactive'; // Contest has ended or marked complete
        } else {
          contest.status = 'Active'; // Contest is still ongoing
        }

        // Save changes if the status has changed
       // await contest.save();

        // Fetch total contestants for this contest from ContestantList
        const totalContestants = await ContestantList.count({
          where: { contestId: contest.id },
        });

        // Calculate total votes for the contest (sum of votes from TransactionHistory)
        const totalVotes = await TransactionHistory.sum('vote', {
          where: { contestId: contest.id },
        }) || 0;

        // Calculate total revenue for the contest (sum of payments from TransactionHistory)
        const totalRevenue = await TransactionHistory.sum('payment', {
          where: { contestId: contest.id },
        }) || 0;

        return {
          ...contest.toJSON(),
          totalContestants,
          totalVotes,
          totalRevenue,
        };
      })
    );

    // Calculate total active contests
    const totalActiveContests = updatedContests.filter(
      (contest) => contest.status === 'Active'
    ).length;

    // Aggregate the total values for all active contests
    const totalActiveContestants = updatedContests
      .filter((contest) => contest.status === 'Active')
      .reduce((acc, contest) => acc + contest.totalContestants, 0);

    const totalActiveVotes = updatedContests
      .filter((contest) => contest.status === 'Active')
      .reduce((acc, contest) => acc + contest.totalVotes, 0);

    const totalActiveRevenue = updatedContests
      .filter((contest) => contest.status === 'Active')
      .reduce((acc, contest) => acc + contest.totalRevenue, 0);

    res.status(200).json({
      success: true,
      message: 'Contests fetched successfully.',
      data: {
        contests: updatedContests,
        totalActiveContests,
        totalActiveContestants,
        totalActiveVotes,
        totalActiveRevenue,
      },
    });
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contests.',
      data: null,
    });
  }
};


exports.getContestById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the contest by ID
    const contest = await Contest.findByPk(id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found.',
        data: null,
      });
    }

    const currentDate = new Date();

    // Check if the contest is active and if the endDate has passed
    if (contest.status === 'active' && new Date(contest.endDate) < currentDate) {
      contest.status = 'inactive'; // Change status to inactive if the contest has ended
      await contest.save(); // Update the contest status in the database
    }

    // Calculate total contestants for this contest
    const totalContestants = await ContestantList.count({
      where: { contestId: contest.id },
    });

    // Calculate total votes for the contest (sum of votes from TransactionHistory)
    const totalVotes = await TransactionHistory.sum('vote', {
      where: { contestId: contest.id },
    }) || 0;

    // Calculate total revenue for the contest (sum of payments from TransactionHistory)
    const totalRevenue = await TransactionHistory.sum('payment', {
      where: { contestId: contest.id },
    }) || 0;

    // Return the contest details along with total contestants, votes, and revenue
    res.status(200).json({
      success: true,
      message: 'Contest fetched successfully.',
      data: {
        contest,
        totalContestants,
        totalVotes,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contest.',
      data: null,
    });
  }
};

exports.completeContest = async (req, res) => {
  const { contestId } = req.body;  // For POST request with contestId in the body

  // Check if contestId is provided
  if (!contestId) {
      return res.status(400).json({
          success: false,
          message: 'contestId is required.',
          data: null,
      });
  }

  try {
      // Fetch the contest by contestId
      const contest = await Contest.findOne({
          where: { id: contestId },
      });

      if (!contest) {
          return res.status(404).json({
              success: false,
              message: 'Contest not found.',
              data: null,
          });
      }

      // Check if the contest is already complete
      if (contest.status === 'complete') {
          return res.status(400).json({
              success: false,
              message: 'Contest is already marked as complete.',
              data: null,
          });
      }

      // Mark the contest as complete
      contest.status = 'complete';
      contest.updatedAt = new Date();  // Update the updatedAt field to current date and time

      // Save the contest with the updated status and updatedAt
      await contest.save();

      res.status(200).json({
          success: true,
          message: 'Contest marked as complete successfully.',
          data: contest,  // Return the updated contest data
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          success: false,
          message: 'Error completing contest.',
          data: null,
      });
  }
};

