'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('invites', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Ensures that the email is unique
      },
      contestId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'contests', // Reference to the 'contests' table
          key: 'id',         // The referenced 'id' field in the 'contests' table
        },
        allowNull: false, // Contest ID is required
      },
      status: {
        type: Sequelize.ENUM('pending', 'active'),
        allowNull: false,
        defaultValue: 'pending', // Default status is 'pending'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('invites');
  },
};
