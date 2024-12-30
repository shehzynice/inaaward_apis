const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import the sequelize instance

class Contestant extends Model {}

Contestant.init(
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
    password: {
      type: DataTypes.STRING,
      allowNull: false, // Password is required
    },

    dp: {
      type: DataTypes.STRING,
      allowNull: true, // Password is required
    },

    name: {
      type: DataTypes.STRING,
      allowNull: true, // Password is required
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false, // Type is required (e.g., "participant", "judge")
      defaultValue:'email',
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
    modelName: 'Contestant', // Define the model name
    tableName: 'contestants', // Table name in the database
    timestamps: true, // Enable timestamps (createdAt, updatedAt)
    paranoid: true, // Soft delete (deletedAt)
  }
);

module.exports = Contestant;
