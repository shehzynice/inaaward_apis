const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const Contestant = require('../models/Contestant');
const ContestantList = require('../models/ContestantList');
const Invite = require('../models/Invite');



exports.signup = async (req, res) => {
    const { email, password, name, type } = req.body;

    // Validate inputs
    if (!email || !password || !name || !type) {
        return res.status(400).json({
            success: false,
            message: 'Name, Type, Email, and Password are required.',
            data: null,
        });
    }

    try {
        // Check if the user already exists in the Contestant table
        const existingContestant = await Contestant.findOne({ where: { email } });
        if (existingContestant) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists.',
                data: null,
            });
        }

        // Check if the user has been invited to a contest
        const invite = await Invite.findOne({ where: { email } });
        if (!invite) {
            return res.status(400).json({
                success: false,
                message: 'You are not invited to any contest.',
                data: null,
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

        // Create the contestant's account with the hashed password
        const newContestant = await Contestant.create({
            email,
            password: hashedPassword, // Save the hashed password
            name,
            type,
        });

        // Add the user to the ContestantList for the contestId from the invite
        await ContestantList.create({
            contestantId: newContestant.id,
            contestId: invite.contestId,
        });

        // Optionally, delete the invite after successful signup
        await invite.destroy();

        // Respond with success message
        res.status(201).json({
            success: true,
            message: 'Account created successfully, and you are added to the contest.',
            data: { user: newContestant },
        });
    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during signup.',
            data: null,
        });
    }
};



exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required.',
            data: null,
        });
    }

    try {
        // Check if the user exists
        const contestant = await Contestant.findOne({ where: { email } });

        if (!contestant) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
                data: null,
            });
        }

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, contestant.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
                data: null,
            });
        }

        // Return the contestant's data
        res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: {
                 user:{ id: contestant.id,
                    email: contestant.email,
                    name: contestant.name,
                    type: contestant.type,
                    dp: contestant.dp, // Include other fields as needed
                    createdAt: contestant.createdAt,
                    updatedAt: contestant.updatedAt,} 
               
            },
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login.',
            data: null,
        });
    }
};