'use strict';

const bcrypt = require('bcrypt');

/* One administrator, so the admin role is testable straight after seeding.
 *
 * Admins are volunteer accounts carrying role = 'admin'. They own the shared
 * tag vocabulary and can moderate any organization's content. There is no way
 * to become one over HTTP: the profile endpoint refuses to change `role`, so
 * promotion happens here or through `npm run admin:grant`.
 */

const DEMO_PASSWORD = 'demopass123';

const ADMIN = {
  username: 'site_admin',
  email: 'admin@benevola.test',
  displayName: 'Site Admin',
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

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
