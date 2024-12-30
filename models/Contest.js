const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import the sequelize instance

class Contest extends Model {}

Contest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    contestName: {
      type: DataTypes.STRING,
      allowNull: false, // This field is required
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false, // This field is required
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false, // This field is required
    },
    noVotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Default to 0 votes if not provided
    },
    revenue: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0, // Default to 0.0 revenue if not provided
    },
    status: {
      type: DataTypes.ENUM('active', 'expire', 'complete'),
      allowNull: false, // This field is required
      defaultValue: 'active', // Default to 'active' status
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
      allowNull: true, // Can be null if the contest is not deleted
    },
  },
  {
    sequelize, // Pass the sequelize instance here
    modelName: 'Contest', // Define model name
    tableName: 'contests', // Table name in the database
    timestamps: true, // Enable timestamps (createdAt, updatedAt)
    paranoid: true, // Soft delete (deletedAt)
  }
);

module.exports = Contest;
