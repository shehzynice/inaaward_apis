const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import the sequelize instance

class TransactionHistory extends Model {}

TransactionHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // Name is required
    },
    contestId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'contests', // Reference to the 'contests' table
        key: 'id',         // The referenced 'id' field in the 'contests' table
      },
      allowNull: false, // Contest ID is required
    },
    contestantId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'contestants', // Reference to the 'contestants' table
        key: 'id',            // The referenced 'id' field in the 'contestants' table
      },
      allowNull: false, // Contestant ID is required
    },
    vote: {
      type: DataTypes.INTEGER,
      allowNull: false, // Vote count is required
      defaultValue: 0,  // Default vote is 0
    },
    payment: {
      type: DataTypes.FLOAT,
      allowNull: false, // Payment amount is required
      defaultValue: 0.0, // Default payment is 0.0
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, // Automatically set the current date/time
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, // Automatically set the current date/time
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true, // Can be null if the transaction is not deleted
    },
  },
  {
    sequelize, // Pass the sequelize instance here
    modelName: 'TransactionHistory', // Define the model name
    tableName: 'transaction_history', // Table name in the database
    timestamps: true, // Enable timestamps (createdAt, updatedAt)
    paranoid: true, // Soft delete (deletedAt)
  }
);

module.exports = TransactionHistory;
