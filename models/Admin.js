const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Ensure the correct path to your database config

class Admin extends Model {}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1, // Example: 1 for active, 0 for inactive
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true, // For soft delete
    },
  },
  {
    sequelize, // Pass the sequelize instance here
    modelName: 'Admin', // Define model name
    tableName: 'admins', // Table name in the database
    timestamps: true, // Enable timestamps (createdAt, updatedAt)
    paranoid: true, // Soft delete (deletedAt)
  }
);

module.exports = Admin;
