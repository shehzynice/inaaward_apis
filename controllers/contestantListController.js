const ContestantList = require('../models/ContestantList');
const Contestant = require('../models/Contestant');
const Contest = require('../models/Contest');
const TransactionHistory = require('../models/TransactionHistory');
// Fetch contestants by contestId (without explicit relationship)
exports.getContestantsByContestId = async (req, res) => {
    const { contestId } = req.body;  // For GET request with URL params

    // Check if contestId is provided
    if (!contestId) {
        return res.status(400).json({
            success: false,
            message: 'contestId is required.',
            data: null,
        });
    }

    try {
        console.log('Contest ID:', contestId);

        // Fetch the contest details to get the end date
        const contest = await Contest.findOne({
            where: { id: contestId }
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found.',
                data: null,
            });
        }

        // Calculate total contestants for this contest
        const totalContestants = await ContestantList.count({
            where: { contestId },
        });

        // Calculate total votes for the contest (sum of votes from TransactionHistory)
        const totalVotes = await TransactionHistory.sum('vote', {
            where: { contestId },
        }) || 0;

        // Calculate total revenue for the contest (sum of payments from TransactionHistory)
        const totalRevenue = await TransactionHistory.sum('payment', {
            where: { contestId },
        }) || 0;

        // Fetch the contestant list for the given contestId and sort it by 'vote' in descending order
        const contestantList = await ContestantList.findAll({
            where: { contestId },
            order: [['vote', 'DESC']],  // Sorting by vote in descending order
        });

        // Check if any contestants are found
        if (contestantList.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No contestants found for this contest.',
                data: null,
            });
        }

        // Fetch the contestant data for each contestantId in the contestantList
        const contestants = await Promise.all(
            contestantList.map(async (contestantListItem) => {
                const contestant = await Contestant.findOne({
                    where: { id: contestantListItem.contestantId },
                });

                // If the contestant is found, include the contestant data with the contestantList item
                if (contestant) {
                    return {
                        ...contestantListItem.toJSON(), // Include contestantList data
                        contestant: contestant.toJSON(), // Include Contestant data
                    };
                } else {
                    // If contestant is not found, return the contestantList data with a null contestant
                    return {
                        ...contestantListItem.toJSON(),
                        contestant: null, // No contestant data found
                    };
                }
            })
        );

        res.status(200).json({
            success: true,
            message: 'Contestants fetched successfully.',
            data: {
                ContestantsList: contestants,
                contestDetails: {
                    endDate: contest.endDate,
                    totalContestants,
                    totalVotes,
                    totalRevenue,
                },
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contestants.',
            data: null,
        });
    }
};




// Fetch a specific contestant by contestantId (without using associations)
exports.getContestantById = async (req, res) => {
    const { contestantId } = req.body;
    if (!contestantId) {
        return res.status(400).json({
            success: false,
            message: 'contestantId are required.',
            data: null,
        });
    }
    try {
        // Fetch the contestant from the Contestant table
        const contestant = await Contestant.findOne({
            where: { id: contestantId },
            attributes: ['id', 'email', 'type'], // Only select necessary fields
        });

        if (!contestant) {
            return res.status(404).json({
                success: false,
                message: 'Contestant not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Contestant fetched successfully.',
            data: contestant,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contestant.',
        });
    }
};


exports.deleteContestantListById = async (req, res) => {
    const { id } = req.body; // Assuming `id` is passed in the request body

    // Check if `id` is provided
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'ContestantList id is required.',
            data: null,
        });
    }

    try {
        // Attempt to delete the ContestantList record
        const deleteResult = await ContestantList.destroy({
            where: { id },
        });

        // Check if a record was deleted
        if (deleteResult === 0) {
            return res.status(404).json({
                success: false,
                message: `No ContestantList found with id ${id}.`,
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            message: `ContestantList with id ${id} deleted successfully.`,
            data: null,
        });
    } catch (error) {
        console.error('Error deleting ContestantList:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting ContestantList.',
            data: null,
        });
    }
};
