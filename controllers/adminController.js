const Admin = require('../models/Admin'); // Import the Admin model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret for JWT
const JWT_SECRET = 'your_jwt_secret'; // Replace with your actual secret

// Create Admin
exports.createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        data: null,
      });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists.',
        data: null,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin
    const admin = await Admin.create({ email, password: hashedPassword });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully.',
      data: {admin:admin,}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin.',
      data: null,
    });
  }
};

// Sign in Admin
exports.signinAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        data: null,
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found.',
        data: null,
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        data: null,
      });
    }

   

    res.status(200).json({
      success: true,
      message: 'Admin signed in successfully.',
      data: {admin:admin,},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error signing in admin.',
      data: null,
    });
  }
};
