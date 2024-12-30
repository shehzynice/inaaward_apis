const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import the sequelize instance

class ContestantList extends Model {}

ContestantList.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    contestantId: {
      type: DataTypes.INTEGER, // assuming the contestantId is a number (adjust accordingly)
      allowNull: false, // This field is required
    },

    contestId: {
      type: DataTypes.INTEGER, // assuming the contestantId is a number (adjust accordingly)
      allowNull: false, // This field is required
    },
    vote: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Default to 0 votes if not provided
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
      allowNull: true, // Can be null if the contestant is not deleted
    },
  },
  {
    sequelize, // Pass the sequelize instance here
    modelName: 'ContestantList', // Define model name
    tableName: 'contestants-list', // Table name in the database
    timestamps: true, // Enable timestamps (createdAt, updatedAt)
    paranoid: true, // Soft delete (deletedAt)
  }
);

module.exports = ContestantList;
