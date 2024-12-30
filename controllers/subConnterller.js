const { Op } = require('sequelize');
const ContestantList = require('../models/ContestantList');
const Contest = require('../models/Contest');
const TransactionHistory = require('../models/TransactionHistory');
const Contestant = require('../models/Contestant');
const { Sequelize } = require('sequelize');  // Import Sequelize


const sequelize = require('../config/db')
exports.getContestantListsByContestantId = async (req, res) => {
    const { contestantId } = req.body;

    if (!contestantId) {
        return res.status(400).json({
            success: false,
            message: 'ContestantId is required.',
            data: null,
        });
    }

    try {
        const contestantLists = await ContestantList.findAll({
            where: { contestantId },
        });

        if (contestantLists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No contests found for this contestant.',
                data: null,
            });
        }

        let totalActiveContests = 0;
        let totalVotes = 0;
        let totalWeightedProgress = 0;

        const enrichedLists = await Promise.all(
            contestantLists.map(async (list) => {
                const contest = await Contest.findOne({
                    where: { id: list.contestId },
                });

                if (!contest) {
                    return null;
                }

                const currentDate = new Date();
                const endDate = new Date(contest.endDate);
                const timeDiff = endDate - currentDate;
                const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                let contestStatus = contest.status;
                if (contest.status === 'complete' || timeDiff <= 0) {
                    contestStatus = 'expired';
                } else {
                    totalActiveContests++;
                }

                const allContestantsInContest = await ContestantList.findAll({
                    where: { contestId: list.contestId },
                    order: [['vote', 'DESC']],
                });

                const position =
                    allContestantsInContest.findIndex(
                        (item) => item.contestantId === list.contestantId
                    ) + 1;

                const highestVotes = allContestantsInContest[0]?.vote || 0;
                const progress = highestVotes > 0 ? (list.vote / highestVotes) * 100 : 0;

                if (contestStatus !== 'expired') {
                    totalVotes += list.vote;
                    totalWeightedProgress += progress;
                }

                return {
                    ...list.toJSON(),
                    contest: {
                        id: contest.id,
                        name: contest.contestName,
                        status: contestStatus,
                        endDate: contest.endDate,
                        remainingDays:
                            contestStatus === 'expired'
                                ? 'Contest has expired'
                                : `${remainingDays} days left`,
                    },
                    votes: list.vote,
                    position,
                    progress: progress.toFixed(2),
                };
            })
        );

        const filteredLists = enrichedLists.filter((item) => item !== null);

        if (filteredLists.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No contests found for this contestant.',
                data: null,
            });
        }

        // Calculate average progress
        const averageProgress =
            totalActiveContests > 0
                ? (totalWeightedProgress / totalActiveContests).toFixed(2)
                : 0;

        res.status(200).json({
            success: true,
            message: 'Contestant lists fetched successfully.',
            data: {
                totalActiveContests,
                totalVotes,
                averageProgress,
                contestantLists: filteredLists,
            },
        });
    } catch (error) {
        console.error('Error fetching contestant lists:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the contestant lists.',
            data: null,
        });
    }
};



exports.getTransactionHistory = async (req, res) => {
    const { contestId, contestantId } = req.body;

    if (!contestId || !contestantId) {
        return res.status(400).json({
            success: false,
            message: 'ContestId and ContestantId are required.',
            data: null,
        });
    }

    try {
        // Fetch contest details
        const contest = await Contest.findOne({ where: { id: contestId } });
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found.',
                data: null,
            });
        }

        // Fetch the transaction history for the given contest and contestantId
        const transactionHistory = await TransactionHistory.findAll({
            where: {
                contestId,
                contestantId, // Get only the transaction history for the specific contestant
            },
        });

        if (transactionHistory.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No transaction history found for this contest.',
                data: null,
            });
        }

        // Calculate total votes directly from the transaction history
        const totalVotes = transactionHistory.reduce((accum, transaction) => accum + transaction.vote, 0);

        // Fetch all contestant votes for the contest to calculate progress and rank
        const allContestantVotes = await TransactionHistory.findAll({
            where: { contestId },
            attributes: ['contestantId', [sequelize.fn('sum', sequelize.col('vote')), 'totalVotes']],
            group: ['contestantId'],
            order: [[sequelize.fn('sum', sequelize.col('vote')), 'DESC']],
        });

        const highestVotes = allContestantVotes[0]?.dataValues.totalVotes || 0;
        const progress = highestVotes > 0 ? (totalVotes / highestVotes) * 100 : 0;

        // Get contestant rank
        const rank = allContestantVotes.findIndex(
            (item) => item.contestantId === contestantId
        ) + 1;

        // Calculate remaining days
        const remainingTime = new Date(contest.endDate) - new Date();
        const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

        // Format remaining days
        const remainingDaysText =
            remainingDays > 0
                ? `${remainingDays}  days left`
                : 'Expired';

        // Format transaction history
        const formattedHistory = transactionHistory.map((transaction) => ({
            id: transaction.id,
            name: transaction.name,
            vote: transaction.vote,
            payment: transaction.payment,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
            contest: {
                id: contest.id,
                name: contest.name,
                endDate: contest.endDate,
                remainingDays: remainingDaysText,
            },
            totalVotes: totalVotes,
            rank: rank,
            endDate: contest.endDate,
            progress: progress.toFixed(2),
        }));

        res.status(200).json({
            success: true,
            message: 'Transaction history fetched successfully.',
            data: {
                transactionHistory: formattedHistory,
                totalVotes: totalVotes,
                progress: progress.toFixed(2),
                rank,
                endDate: contest.endDate,
                remainingDays: remainingDaysText,
            },
        });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the transaction history.',
            data: null,
        });
    }
};

exports.getActiveContestContestants = async (req, res) => {
    try {
        const currentDate = new Date();

        // Fetch all active contests where endDate is not passed and startDate is valid
        const activeContests = await Contest.findAll({
            where: {
                status: 'active',
                startDate: {
                    [Op.lte]: currentDate, // Start date is less than or equal to the current date
                },
                endDate: {
                    [Op.gt]: currentDate, // End date is greater than the current date
                },
            },
        });

        // Check if any active contests exist
        if (!activeContests || activeContests.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active contests found with valid dates.',
                data: null,
            });
        }

        // Fetch contestants for each active contest
        const contestsWithContestants = await Promise.all(
            activeContests.map(async (contest) => {
                // Fetch contestants for the given contest
                const contestantList = await ContestantList.findAll({
                    where: { contestId: contest.id },
                });

                if (!contestantList || contestantList.length === 0) {
                    return null; // Skip contests with no contestants
                }

                // Map contestant IDs to fetch contestant data
                const contestants = await Promise.all(
                    contestantList.map(async (contestantListItem) => {
                        const contestant = await Contestant.findOne({
                            where: { id: contestantListItem.contestantId },
                        });

                        // Return both contestant list item and contestant data
                        return {
                            ...contestantListItem.toJSON(),
                            contestant: contestant ? contestant.toJSON() : null,
                        };
                    })
                );

                // Exclude contests with no valid contestants
                if (contestants.every((c) => c.contestant === null)) {
                    return null;
                }

                // Return contest and associated contestants
                return {
                    id: contest.id,
                    name: contest.contestName,
                    endDate: contest.endDate,
                    status: contest.status,
                    contestants,
                };
            })
        );

        // Filter out null values (contests with no contestants)
        const filteredContests = contestsWithContestants.filter((contest) => contest !== null);

        if (filteredContests.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active contests found with valid contestants.',
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            message: 'Active contests with contestants fetched successfully.',
            data: { contests: filteredContests },
        });
    } catch (error) {
        console.error('Error fetching active contests and contestants:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the data.',
            data: null,
        });
    }
};


exports.createTransactionHistory = async (req, res) => {
    const { contestId, contestantId, vote, payment,name } = req.body;
  
    // Validate request body
    if (!contestId || !contestantId || !vote || !payment || !name) {
      return res.status(400).json({
        success: false,
        message: 'contestId, contestantId, vote, and payment,name are required.',
        data: null,
      });
    }
  
    try {
      // Check if the contestant exists in the ContestantList for the given contest
      const contestantEntry = await ContestantList.findOne({
        where: { contestId, contestantId },
      });
  
      if (!contestantEntry) {
        return res.status(404).json({
          success: false,
          message: 'Contestant not found in the ContestantList for the given contest.',
          data: null,
        });
      }
  
      // Create a transaction history entry
      const transaction = await TransactionHistory.create({
        contestId,
        contestantId,
        vote,
        payment,
        name
      });
  
      // Increment the votes for the contestant in the ContestantList
      contestantEntry.vote += vote;
      await contestantEntry.save();
  
      res.status(201).json({
        success: true,
        message: 'Transaction created and votes incremented successfully.',
        data: {
          transaction,
          updatedContestant: contestantEntry,
        },
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating transaction.',
        data: null,
      });
    }
  };



//   exports.getTopContestantsForCompletedContests = async (req, res) => {
//     try {
//       // Fetch all contests that are either complete or have an endDate passed
//       const contests = await Contest.findAll({
//         where: {
//           [Sequelize.Op.or]: [
//             { status: 'complete' },  // Get contests that are marked as 'complete'
//             { endDate: { [Sequelize.Op.lt]: new Date() } }  // Or those whose end date is passed
//           ]
//         },
//         order: [['endDate', 'DESC']]  // Optionally sort contests by endDate, latest first
//       });
  
//       // For each contest, find the top contestant based on the highest vote count
//       const contestsWithTopContestant = await Promise.all(
//         contests.map(async (contest) => {
//           // Find the contestant with the highest votes in this contest
//           const topContestant = await ContestantList.findOne({
//             where: { contestId: contest.id },
//             order: [['vote', 'DESC']],  // Order by vote in descending order
//           });
  
//           if (!topContestant) {
//             return null;  // If no contestants found, skip this contest
//           }
  
//           // Get the details of the top contestant
//           const contestant = await Contestant.findOne({
//             where: { id: topContestant.contestantId }
//           });
  
//           return {
//             contest: {
//               id: contest.id,
//               title: contest.contestName,
//               description: contest.description,
//               status: contest.status,
//               endDate: contest.endDate,
//               createdAt: contest.createdAt,
//               updatedAt: contest.updatedAt,
//               topContestant: {
//                 id: topContestant.id,
//                 contestantId: topContestant.contestantId,
//                 contestId: topContestant.contestId,
//                 vote: topContestant.vote,
//                 createdAt: topContestant.createdAt,
//                 updatedAt: topContestant.updatedAt,
//                 contestantDetails: {
//                   id: contestant.id,
//                   name: contestant.name,
//                   email: contestant.email,
//                   dp: contestant.dp,
//                   type: contestant.type,
//                   createdAt: contestant.createdAt,
//                   updatedAt: contestant.updatedAt
//                 }
//               }
//             }
//           };
//         })
//       );
  
//       // Remove any null entries (in case there are contests with no contestants)
//       const filteredContests = contestsWithTopContestant.filter(item => item !== null);
  
//       // Return the response as a single object with contests and top contestants
//       res.status(200).json({
//         success: true,
//         message: 'Top contestants for ended or completed contests fetched successfully.',
//         data: filteredContests
//       });
//     } catch (error) {
//       console.error('Error fetching top contestants:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Error fetching top contestants.',
//         data: null
//       });
//     }
//   };




exports.getTopContestantsForCompletedContests = async (req, res) => {
    try {
        const currentDate = new Date();

        // Fetch contests that are either completed or past their endDate
        const contests = await Contest.findAll({
            where: {
                [Op.or]: [
                    { status: "complete" },
                    { 
                      status: "active",
                      endDate: { [Op.lt]: currentDate } // Active but past end date
                    },
                ],
            },
            order: [["endDate", "DESC"]],
        });

        // Process each contest
        const contestsWithDetails = await Promise.all(
            contests.map(async (contest) => {
                // Get contestants for the contest and their positions based on votes
                const contestants = await ContestantList.findAll({
                    where: { contestId: contest.id },
                    order: [["vote", "DESC"]],
                });

                // Calculate contestant rankings
                const rankedContestants = await Promise.all(
                    contestants.map(async (item, index) => {
                        const contestantDetails = await Contestant.findOne({
                            where: { id: item.contestantId },
                        });
                        return {
                            position: index + 1, // Rank based on vote order
                            id: item.id,
                            contestantId: item.contestantId,
                            contestId: item.contestId,
                            vote: item.vote,
                            contestantDetails: contestantDetails
                                ? {
                                    id: contestantDetails.id,
                                    name: contestantDetails.name,
                                    email: contestantDetails.email,
                                    dp: contestantDetails.dp,
                                }
                                : null,
                        };
                    })
                );

                // Calculate time difference
                let timePassed;
                if (contest.status === "complete") {
                    const timeDiff = Math.abs(currentDate - contest.updatedAt);
                    timePassed = formatTimePassed(timeDiff);
                } else if (contest.status === "active" && contest.endDate < currentDate) {
                    const timeDiff = Math.abs(currentDate - contest.endDate);
                    timePassed = formatTimePassed(timeDiff);
                }

                // Identify top contestant
                const topContestant = rankedContestants.length > 0 ? rankedContestants[0] : null;

                return {
                    contest: {
                        id: contest.id,
                        title: contest.contestName,
                        description: contest.description,
                        status: contest.status,
                        endDate: contest.endDate,
                        createdAt: contest.createdAt,
                        updatedAt: contest.updatedAt,
                        timePassed,
                        topContestant,
                        contestants: rankedContestants,
                    },
                };
            })
        );

        const filteredContests = contestsWithDetails.filter((contest) => contest !== null);

        res.status(200).json({
            success: true,
            message: "Contests with top contestants and details fetched successfully.",
            data: filteredContests,
        });
    } catch (error) {
        console.error("Error fetching top contestants:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching top contestants.",
            data: null,
        });
    }
};

// Utility function to format time passed
const formatTimePassed = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days, ${hours % 24} hours ago`;
    if (hours > 0) return `${hours} hours, ${minutes % 60} minutes ago`;
    if (minutes > 0) return `${minutes} minutes, ${seconds % 60} seconds ago`;
    return `${seconds} seconds ago`;
};
