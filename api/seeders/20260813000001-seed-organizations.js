'use strict';

const bcrypt = require('bcrypt');

/* Four organizations, each with a working login.
 *
 * Every seeded account uses the same password so the dataset is usable for
 * demos and manual testing: see DEMO_PASSWORD below. That is fine for local
 * data and obviously not something to run against a real database.
 */

const DEMO_PASSWORD = 'demopass123';

/* Placeholder imagery. picsum.photos returns a stable image for a given seed,
   so the same organization keeps the same picture across reseeds instead of
   shuffling every time. Needs an internet connection to display. */
const banner = seed => `https://picsum.photos/seed/${seed}-banner/1600/500`;
const icon   = seed => `https://picsum.photos/seed/${seed}-icon/300/300`;

const ORGS = [
  {
    slug: 'riverkeepers',
    name: 'Riverkeepers Alliance',
    email: 'hello@riverkeepers.org',
    description:
      'We look after the Willamette and the creeks that feed it. Most of our work is hands-on: hauling debris out of the water, replanting banks, and monitoring water quality month to month.\nNo experience needed for any of it. We bring the gloves, waders and coffee.',
    phone: '+1 503 555 0142',
    address: 'Portland, OR',
  },
  {
    slug: 'northside',
    name: 'Northside Food Bank',
    email: 'volunteer@northsidefood.org',
    description:
      'A neighbourhood pantry serving about 900 households a week. Volunteers sort donations, pack boxes and help families through the shop on distribution days.\nShifts are short and social. Come once or come every week.',
    phone: '+1 312 555 0188',
    address: 'Chicago, IL',
  },
  {
    slug: 'pawsclaws',
    name: 'Paws & Claws Rescue',
    email: 'team@pawsandclaws.org',
    description:
      'A foster-based rescue for dogs and cats waiting on permanent homes. We need walkers, socialisers, transport drivers and people willing to sit quietly with a nervous animal.',
    phone: '+1 512 555 0119',
    address: 'Austin, TX',
  },
  {
    slug: 'brightfutures',
    name: 'Bright Futures Tutoring',
    email: 'contact@brightfutures.org',
    description:
      'Free after-school tutoring for students in grades 3 to 8. Volunteers are paired with the same student each week, because consistency is most of what makes it work.',
    phone: '+1 617 555 0173',
    address: 'Boston, MA',
  },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    // One hash reused across the seed data: these are demo accounts sharing a
    // password, so there is nothing gained by salting each one separately.
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

    await queryInterface.bulkInsert(
      'organizations',
      ORGS.map(o => ({
        name: o.name,
        email: o.email,
        description: o.description,
        phone: o.phone,
        address: o.address,
        password_hash: passwordHash,
        banner_img: banner(o.slug),
        icon_img: icon(o.slug),
        created_at: now,
        updated_at: now,
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('organizations', {
      email: { [Sequelize.Op.in]: ORGS.map(o => o.email) },
    });
  },
};
