const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import the sequelize instance

class Invite extends Model {}

Invite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false, // Email is required
      unique: true, // Ensuring that the email is unique
    },
    contestId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'contests', // Reference to the contests table
        key: 'id',         // Reference to the contest's id
      },
      allowNull: false, // Contest ID is required
    },
    status: {
      type: DataTypes.ENUM('pending', 'active'),
      allowNull: false,
      defaultValue: 'pending', // Default status is 'pending'
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
      allowNull: true, // Can be null if the invite is not deleted
    },
  },
  {
    sequelize, // Pass the sequelize instance here
    modelName: 'Invite', // Define the model name
    tableName: 'invites', // Table name in the database
    timestamps: true, // Enable timestamps (createdAt, updatedAt)
    paranoid: true, // Soft delete (deletedAt)
  }
);

module.exports = Invite;
