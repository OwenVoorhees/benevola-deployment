'use strict';

const bcrypt = require('bcrypt');

/* Volunteers, plus the RSVPs that make the rest of the app worth looking at.
 *
 * Without attendees every roster is empty and every event reads "all places
 * left", so the capacity meter and the organizer's roster panel cannot be
 * seen at all. The spread below is deliberate:
 *
 *   Weekend Dog Walking        5 of 6   nearly full
 *   Saturday Meal Packing      5 of 30  healthy
 *   Willamette River Clean-Up  4 of 12  healthy
 *   Riverbank Tree Planting    2 of 20  quiet
 *   After-School Reading       0 of 15  empty-state
 *
 * Same demo password as the organizations: demopass123
 */

const DEMO_PASSWORD = 'demopass123';

/* pravatar returns a consistent portrait per identifier, which suits avatars
   better than the landscape placeholders used elsewhere. Needs the internet. */
const avatar = who => `https://i.pravatar.cc/300?u=${who}`;

const VOLUNTEERS = [
  { username: 'jane_okafor',   email: 'jane@example.com',   displayName: 'Jane Okafor' },
  { username: 'marcus_reyes',  email: 'marcus@example.com', displayName: 'Marcus Reyes' },
  { username: 'priya_shah',    email: 'priya@example.com',  displayName: 'Priya Shah' },
  { username: 'tom_lindqvist', email: 'tom@example.com',    displayName: 'Tom Lindqvist' },
  { username: 'aisha_bello',   email: 'aisha@example.com',  displayName: 'Aisha Bello' },
];

/** Event title -> the volunteers signed up for it. */
const RSVPS = {
  'Willamette River Clean-Up':   ['jane@example.com', 'marcus@example.com', 'priya@example.com', 'aisha@example.com'],
  'Riverbank Tree Planting':     ['jane@example.com', 'tom@example.com'],
  'Saturday Meal Packing':       ['jane@example.com', 'marcus@example.com', 'priya@example.com', 'tom@example.com', 'aisha@example.com'],
  'Weekend Dog Walking':         ['marcus@example.com', 'priya@example.com', 'tom@example.com', 'aisha@example.com', 'jane@example.com'],
  // After-School Reading Buddies is left empty on purpose, to exercise the
  // "nobody has signed on yet" state.
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const select = sql => queryInterface.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

    await queryInterface.bulkInsert(
      'users',
      VOLUNTEERS.map(v => ({
        username: v.username,
        email: v.email,
        display_name: v.displayName,
        password_hash: passwordHash,
        profile_pic: avatar(v.username),
        role: 'user',
        created_at: now,
        updated_at: now,
      }))
    );

    const users = await select('SELECT id, email FROM users');
    const userId = Object.fromEntries(users.map(u => [u.email, u.id]));

    const events = await select('SELECT id, title FROM events');
    const eventId = Object.fromEntries(events.map(e => [e.title, e.id]));

    const rows = [];
    for (const [title, emails] of Object.entries(RSVPS)) {
      if (!eventId[title]) continue; // event seeder did not run; skip quietly
      for (const email of emails) {
        if (userId[email]) {
          rows.push({
            user_id: userId[email],
            event_id: eventId[title],
            created_at: now,
            updated_at: now,
          });
        }
      }
    }
    if (rows.length) await queryInterface.bulkInsert('event_attendees', rows);
  },

  async down(queryInterface, Sequelize) {
    const emails = VOLUNTEERS.map(v => v.email);
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email IN (:emails)',
      { type: Sequelize.QueryTypes.SELECT, replacements: { emails } }
    );
    const ids = users.map(u => u.id);

    if (ids.length) {
      await queryInterface.bulkDelete('event_attendees', { user_id: { [Sequelize.Op.in]: ids } });
    }
    await queryInterface.bulkDelete('users', { email: { [Sequelize.Op.in]: emails } });
  },
};
