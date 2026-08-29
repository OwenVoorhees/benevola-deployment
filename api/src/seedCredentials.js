const bcrypt = require('bcryptjs');

/* Passwords for seeded accounts.
 *
 * This repository is public, so anything written here is published. The seed
 * data still needs to exist in production — a volunteering site with no
 * organizations and no events looks broken — but the accounts that own it must
 * not be signable-into by anyone who can read the repo.
 *
 * So content and access are separated. Every seeded account is created either
 * way, owns its events and shows up in listings; in production it only gets a
 * working password if the operator supplied one out of band, through the
 * Vercel dashboard.
 *
 * HOW PRODUCTION IS DETECTED. Not from NODE_ENV: `npm run db:seed:prod` runs
 * `sequelize-cli --env production`, which selects the config but never sets
 * NODE_ENV. A NODE_ENV check would therefore read as development while seeding
 * Neon from a laptop, and write the local password into production — exactly
 * the failure this file exists to prevent. The dialect comes from the
 * connection actually in use, so it cannot disagree with reality.
 */

/** Known password for local work, where the whole dataset should be usable. */
const LOCAL_PASSWORD = 'demopass123';

/* Not a bcrypt hash, and deliberately not one. bcrypt.compare returns false
   for a malformed hash rather than throwing, so an account carrying this can
   never be signed into and no login route needs to special-case it. */
const UNUSABLE = 'no-login::seeded-account';

/** Development is SQLite; every deployed environment is Postgres. */
function isProduction(queryInterface) {
    return queryInterface.sequelize.getDialect() !== 'sqlite';
}

/**
 * Organizations and volunteers alike.
 *
 * Both share DEMO_PASSWORD in production, so the whole demo — posting an event
 * as an organizer, signing up for one as a volunteer — can be walked through
 * by anyone holding it. Leave it unset and none of them can be signed into,
 * while the content they own still renders.
 */
async function demoHash(queryInterface) {
    if (!isProduction(queryInterface)) return bcrypt.hash(LOCAL_PASSWORD, 12);
    const supplied = process.env.DEMO_PASSWORD;
    return supplied ? bcrypt.hash(supplied, 12) : UNUSABLE;
}

/**
 * The admin is the account worth protecting most: it can list every registered
 * user's email address and delete the shared tag vocabulary. It gets its own
 * variable rather than sharing DEMO_PASSWORD, so handing someone the demo
 * login never hands them moderation rights.
 *
 * In production it is not created at all unless ADMIN_PASSWORD is set, so a
 * default deployment simply has no administrator.
 */
function adminRequested(queryInterface) {
    return !isProduction(queryInterface) || Boolean(process.env.ADMIN_PASSWORD);
}

async function adminHash(queryInterface) {
    if (!isProduction(queryInterface)) return bcrypt.hash(LOCAL_PASSWORD, 12);
    return bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
}

/** One line at seed time, so it is never a surprise what was created. */
function announce(queryInterface, what) {
    if (!isProduction(queryInterface)) return;

    const demo = process.env.DEMO_PASSWORD
        ? 'DEMO_PASSWORD'
        : 'no password (cannot sign in)';

    if (what === 'orgs')       console.log(`  organizations seeded with ${demo}`);
    if (what === 'volunteers') console.log(`  volunteers seeded with ${demo}`);
    if (what === 'admin') {
        console.log(process.env.ADMIN_PASSWORD
            ? '  admin seeded with ADMIN_PASSWORD'
            : '  admin NOT created (set ADMIN_PASSWORD to create one)');
    }
}

module.exports = {
    LOCAL_PASSWORD,
    UNUSABLE,
    isProduction,
    demoHash,
    adminRequested,
    adminHash,
    announce,
};
