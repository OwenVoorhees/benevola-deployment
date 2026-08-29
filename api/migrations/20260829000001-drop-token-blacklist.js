"use strict";

/* The TokenBlacklists table belonged to the JWT auth this project no longer
 * uses. Sessions are rows in the Sessions table now, and logging out destroys
 * the row, so there is nothing to revoke and nothing to deny-list.
 *
 * No model ever read it and no route referenced it — checked before dropping.
 *
 * `down` recreates it exactly as 20260109040705 left it, camelCase column
 * names included: that migration did not set `underscored`, so the columns
 * really are createdAt and updatedAt rather than created_at and updated_at. */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.dropTable("TokenBlacklists");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable("TokenBlacklists", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      token: {
        type: Sequelize.STRING,
      },
      expiresAt: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
};
