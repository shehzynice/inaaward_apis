require('dotenv').config();  // To load environment variables from the .env file
const { Sequelize } = require('sequelize');

// Extracting environment variables for the database configuration
const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';  // Empty password as per your configuration
const dbName = process.env.DB_NAME || 'inuaaward_dp';
const dbDialect = process.env.DB_DIALECT || 'mysql';

// Create a new Sequelize instance with the loaded environment variables
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dbDialect,
  logging: false,      // Set to true for SQL logging
  pool: {
    max: 5,            // Maximum number of connections in the pool
    min: 0,            // Minimum number of connections in the pool
    acquire: 30000,    // Maximum time (in ms) to wait for a connection
    idle: 10000        // Maximum time (in ms) a connection can be idle
  },
  define: {
    timestamps: true,  // Enable timestamps (createdAt and updatedAt)
    paranoid: true,    // Enable soft deletes using the `deletedAt` field
  },
});

// Test the connection to the database
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
