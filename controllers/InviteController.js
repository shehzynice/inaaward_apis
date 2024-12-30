const Contestant = require('../models/Contestant');
const ContestantList = require('../models/ContestantList');
const Invite = require('../models/Invite');

exports.inviteOrAddContestant = async (req, res) => {
    const { email, contestId } = req.body;

    // Validate inputs
    if (!email || !contestId) {
        return res.status(400).json({
            success: false,
            message: 'Email and contestId are required.',
            data: null,
        });
    }

    try {
        // Check if a contestant with the given email exists
        const existingContestant = await Contestant.findOne({ where: { email } });

        if (existingContestant) {
            // Check if the contestant is already in the ContestantList for this contest
            const existingContestantInList = await ContestantList.findOne({
                where: { contestantId: existingContestant.id, contestId },
            });

            if (existingContestantInList) {
                return res.status(200).json({
                    success: false,
                    message: 'Contestant is already added to the contest.',
                    data: null,
                });
            }

            // Add the contestant to the ContestantList
            await ContestantList.create({
                contestantId: existingContestant.id,
                contestId,
            });

            return res.status(200).json({
                success: true,
                message: 'Contestant added to the contest successfully.',
                data: null,
            });
        } else {
            // Check if the email is already in the Invite table for this contest
            const existingInvite = await Invite.findOne({
                where: { email, contestId },
            });

            if (existingInvite) {
                return res.status(200).json({
                    success: false,
                    message: 'Email is already invited to this contest.',
                    data: null,
                });
            }

            // Add the email to the Invite table
            await Invite.create({
                email,
                contestId,
            });

            return res.status(200).json({
                success: true,
                message: 'Email invited successfully.',
                data: null,
            });
        }
    } catch (error) {
        console.error('Error in inviteOrAddContestant:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.',
            data: null,
        });
    }
};
