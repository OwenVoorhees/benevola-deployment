'use strict';

/* Five events across the four organizations, with Riverkeepers running two.
 *
 * Ids are never hardcoded: organizations are looked up by email and tags by
 * slug, so this seeder does not care what order anything else ran in or what
 * autoincrement values it happened to get.
 *
 * Dates are relative to when the seeder runs, so the data is still in the
 * future whenever somebody sets the project up.
 */

const DAY = 24 * 60 * 60 * 1000;

/* Stable placeholder imagery, same seed each reseed. Needs the internet. */
const hero = seed => `https://picsum.photos/seed/${seed}-event/1400/800`;

/** `days` from now, at a fixed local hour, so listings look deliberate. */
const soon = (days, hour) => {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const EVENTS = [
  {
    orgEmail: 'hello@riverkeepers.org',
    title: 'Willamette River Clean-Up',
    imageSeed: 'cleanup',
    description:
      'A morning pulling litter and debris off the east bank between the Hawthorne and Morrison bridges.\nWe supply gloves, grabbers, bags and waders. Wear boots you do not mind ruining, and bring a water bottle. We finish with coffee at the boathouse.',
    capacity: 12,
    duration: 180,
    date: soon(6, 9),
    address: 'SE Water Ave, Portland, OR 97214',
    latitude: 45.5122,
    longitude: -122.6587,
    tags: ['environment', 'outdoor', 'hands-on', 'one-time', 'beginner-friendly'],
  },
  {
    orgEmail: 'hello@riverkeepers.org',
    title: 'Riverbank Tree Planting',
    imageSeed: 'planting',
    description:
      'Planting willow and dogwood along a stretch of bank that washed out last winter. Roots hold the soil and shade cools the water, so this is slow work that pays off for years.\nWe will demonstrate the planting technique at the start. Suitable for families with older children.',
    capacity: 20,
    duration: 240,
    date: soon(13, 10),
    address: 'Oaks Bottom Wildlife Refuge, Portland, OR',
    latitude: 45.4835,
    longitude: -122.6591,
    tags: ['environment', 'outdoor', 'manual-labor', 'families'],
  },
  {
    orgEmail: 'volunteer@northsidefood.org',
    title: 'Saturday Meal Packing',
    imageSeed: 'mealpack',
    description:
      'Assembly-line packing of weekend meal boxes for families with school-age children. Roughly 400 boxes across the shift.\nStanding work, indoors, music on. No lifting over 20 pounds required, and there are seated roles for anyone who needs one.',
    capacity: 30,
    duration: 210,
    date: soon(3, 9),
    address: '4520 N Clark St, Chicago, IL 60640',
    latitude: 41.9665,
    longitude: -87.6689,
    tags: ['food-security', 'indoor', 'hands-on', 'ongoing', 'beginner-friendly'],
  },
  {
    orgEmail: 'team@pawsandclaws.org',
    title: 'Weekend Dog Walking',
    imageSeed: 'dogwalk',
    description:
      'Walk and socialise dogs waiting on foster placements. Two loops of the park with one dog each, then twenty minutes of quiet handling back at the kennels.\nWe match you to a dog that suits your experience. First-timers are always paired with an easy one.',
    capacity: 6,
    duration: 120,
    date: soon(4, 11),
    address: 'Zilker Park, Austin, TX 78704',
    latitude: 30.2669,
    longitude: -97.7728,
    tags: ['animal-welfare', 'outdoor', 'hands-on', 'short-term'],
  },
  {
    orgEmail: 'contact@brightfutures.org',
    title: 'After-School Reading Buddies',
    imageSeed: 'reading',
    description:
      'One hour a week reading with the same student through the term. You are not teaching phonics: you are the adult who turns up and listens, which turns out to matter more.\nTraining and materials provided at the first session. A background check is required before you start.',
    capacity: 15,
    duration: 60,
    date: soon(9, 16),
    address: '221 Blue Hill Ave, Boston, MA 02119',
    latitude: 42.3175,
    longitude: -71.0846,
    tags: ['education', 'tutoring', 'children', 'youth', 'long-term'],
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const select = sql => queryInterface.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });

    const orgs = await select('SELECT id, email FROM organizations');
    const orgId = Object.fromEntries(orgs.map(o => [o.email, o.id]));

    const missing = [...new Set(EVENTS.map(e => e.orgEmail))].filter(e => !orgId[e]);
    if (missing.length) {
      throw new Error(
        `Cannot seed events: no organization for ${missing.join(', ')}. ` +
        'Run the organization seeder first.'
      );
    }

    await queryInterface.bulkInsert(
      'events',
      EVENTS.map(e => ({
        organization_id: orgId[e.orgEmail],
        title: e.title,
        description: e.description,
        capacity: e.capacity,
        duration: e.duration,
        date: e.date,
        address: e.address,
        latitude: e.latitude,
        longitude: e.longitude,
        image: hero(e.imageSeed),
        created_at: now,
        updated_at: now,
      }))
    );

    /* Attach the causes. Tag ids come from the tag seeder, so look them up by
       slug rather than assuming anything about their numbering. */
    const events = await select('SELECT id, title FROM events');
    const eventId = Object.fromEntries(events.map(e => [e.title, e.id]));

    const tags = await select('SELECT id, slug FROM tags');
    const tagId = Object.fromEntries(tags.map(t => [t.slug, t.id]));

    const links = [];
    for (const e of EVENTS) {
      for (const slug of e.tags) {
        if (tagId[slug] && eventId[e.title]) {
          links.push({ event_id: eventId[e.title], tag_id: tagId[slug] });
        }
      }
    }
    // event_tags carries no timestamps, so insert only the two keys.
    if (links.length) await queryInterface.bulkInsert('event_tags', links);
  },

  async down(queryInterface, Sequelize) {
    const titles = EVENTS.map(e => e.title);
    const events = await queryInterface.sequelize.query(
      'SELECT id FROM events WHERE title IN (:titles)',
      { type: Sequelize.QueryTypes.SELECT, replacements: { titles } }
    );
    const ids = events.map(e => e.id);

    if (ids.length) {
      await queryInterface.bulkDelete('event_tags', { event_id: { [Sequelize.Op.in]: ids } });
      await queryInterface.bulkDelete('event_attendees', { event_id: { [Sequelize.Op.in]: ids } });
    }
    await queryInterface.bulkDelete('events', { title: { [Sequelize.Op.in]: titles } });
  },
};
