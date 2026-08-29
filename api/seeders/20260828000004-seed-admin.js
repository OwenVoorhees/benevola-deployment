'use strict';

const { adminRequested, adminHash, announce } = require('../src/seedCredentials');

/* One administrator, so the admin role is testable straight after seeding.
 *
 * Admins are volunteer accounts carrying role = 'admin'. They own the shared
 * tag vocabulary and can moderate any organization's content. There is no way
 * to become one over HTTP — the profile endpoint refuses to change `role` — so
 * promotion happens here or through `npm run admin:grant`.
 *
 * The account worth protecting most: an admin can list every registered user's
 * email address and delete the shared tag vocabulary. It takes ADMIN_PASSWORD
 * rather than DEMO_PASSWORD, so handing someone the demo login never hands
 * them moderation rights.
 *
 * In production the admin is only created when ADMIN_PASSWORD is set. A
 * default deployment has no administrator at all, which is the right default —
 * promote one later with `npm run admin:grant` if you would rather.
 */

const ADMIN = {
  username: 'site_admin',
  email: 'admin@benevola.test',
  displayName: 'Site Admin',
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    if (!adminRequested(queryInterface)) {
      announce(queryInterface, 'admin');
      return;
    }

    /* Exactly one admin, and re-running must not create a second. */
    const present = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email OR role = :role',
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { email: ADMIN.email, role: 'admin' },
      }
    );
    if (present.length) return;

    const passwordHash = await adminHash(queryInterface);
    announce(queryInterface, 'admin');

    await queryInterface.bulkInsert('users', [{
      username: ADMIN.username,
      email: ADMIN.email,
      display_name: ADMIN.displayName,
      password_hash: passwordHash,
      profile_pic: `https://i.pravatar.cc/300?u=${ADMIN.username}`,
      role: 'admin',
      created_at: now,
      updated_at: now,
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: ADMIN.email });
  },
};
