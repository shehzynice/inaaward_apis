'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transaction_history', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false, // Name is required
      },
      contestId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'contests', // Reference to the 'contests' table
          key: 'id',         // The referenced 'id' field in the 'contests' table
        },
        allowNull: false, // Contest ID is required
      },
      contestantId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'contestants', // Reference to the 'contestants' table
          key: 'id',            // The referenced 'id' field in the 'contestants' table
        },
        allowNull: false, // Contestant ID is required
      },
      vote: {
        type: Sequelize.INTEGER,
        allowNull: false, // Vote count is required
        defaultValue: 0,  // Default vote is 0
      },
      payment: {
        type: Sequelize.FLOAT,
        allowNull: false, // Payment amount is required
        defaultValue: 0.0, // Default payment is 0.0
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
    await queryInterface.dropTable('transaction_history');
  },
};
