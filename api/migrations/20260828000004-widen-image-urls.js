"use strict";

/* Image URLs do not fit in VARCHAR(255).
 *
 * events.cover_photo and event_images.url were both STRING, which Postgres
 * reads as varchar(255). Three of the twenty seeded cover photos are longer
 * than that — Wikimedia Commons builds a thumbnail URL by repeating the whole
 * file name, and the longest here is 321 characters. Presigned upload URLs run
 * longer still.
 *
 * SQLite hid this: it treats varchar(n) as an affinity and ignores n, so the
 * seeds inserted fine in development and only failed against Postgres, at the
 * point of seeding production.
 *
 * Postgres only. On SQLite the two types are already interchangeable, and
 * changeColumn there rebuilds the whole table for no effect. */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (queryInterface.sequelize.getDialect() !== "postgres") return;

    await queryInterface.changeColumn("events", "cover_photo", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn("event_images", "url", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },

  // Narrowing back fails if any URL is longer than 255, which is the point.
  async down(queryInterface, Sequelize) {
    if (queryInterface.sequelize.getDialect() !== "postgres") return;

    await queryInterface.changeColumn("events", "cover_photo", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.changeColumn("event_images", "url", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },
};
