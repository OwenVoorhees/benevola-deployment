const express = require('express');
const router = express.Router();
const sequelize = require('../db/database');
const Event = require('../models/Event');
const Tag = require('../models/Tag');
const User = require('../models/User');
const { 
    eventValidation, 
    eventParamValidation, 
    updateEventValidation, 
    EventsQuerySchema, 
    searchQueryValidation,
} = require("../schemas/event.schema");
const { createTagValidation, tagSlugValidation } = require('../schemas/tag.schema');
const validate = require("../middleware/validate");
const load = require("../middleware/load");
const parseTags = require("../middleware/parseTags")
const { searchEvents, indexEvent, removeEvent } = require('../services/searchService');
const { getEvents } = require("../services/buildEventQuery");
const authenticate = require("../middleware/authenticate");
const { requireUser, requireOrg, verifyOwnership } = require("../middleware/authorization");

// GET events
router.get('/',
    validate({ query: EventsQuerySchema }),
    async (req, res, next) => {
        const query = req.validatedQuery

        try {
            const events = await getEvents(query);

            return res.status(200).json({
                message: "success",
                results: events.length,
                data: events
            })
        } catch (err) {
            next(err);
        }
    }
);

// SEARCH events
router.get('/search',
    validate({ query: searchQueryValidation }),
    async (req, res, next) => {
        try {
            const { q } = req.validatedQuery;
            const results = await searchEvents(q);
            return res.status(200).json({
                message: "success",
                data: results
            });
        } catch (err) {
            next(err);
        }
    }
);

// GET list of tags
router.get('/tags', async (req, res, next) => {
    try {
        const tags = await Tag.findAll();
        if (!tags) return res.status(404).json({ error: "No tags to display "});
        
        return res.status(200).json({
            message: "success",
            tags: tags,
        })
    } catch (err) {
        next(err);
    }
});

// ADD a tag
router.post('/tags',
    validate({ body: createTagValidation }),
    async (req, res, next) => {
        try {
            const newTag = await Tag.create(req.validatedBody);
            
            return res.status(200).json({
                message: "success",
                data: newTag
            });
        } catch (err) {
            next(err);
        }
    }
);

// DELETE tag by slug
router.delete('/tags/:slug',
    validate({ params: tagSlugValidation }),
    load(Tag, {
        identifier: "slug",
        modelField: "slug",
        reqKey: "tag",
        findMethod: "findOne"
    }),
    async (req, res, next) => {
        const tag = req.tag;

        try {
            await tag.destroy();
            return res.status(204).end();
        } catch (err) {
            next(err);
        }
    }
);

// GET event by id
router.get('/:eid',
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event",
        include: [{ model: Tag, through: { attributes: [] } }]
    }),
    async (req, res, next) => {
        try {
            // Who is attending is private to the organizer, but how many are
            // attending is not — the public event page needs it for spots left.
            const attendeeCount = await req.event.countUsers();

            return res.status(200).json({
                message: "success",
                data: { ...req.event.toJSON(), attendeeCount },
            });
        } catch (err) {
            next(err);
        }
    }
);

// REPLACE an event
router.put('/:eid',
    authenticate,
    requireOrg,
    validate({ 
        params: eventParamValidation,
        body: eventValidation
     }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event"
    }),
    parseTags(Tag, false),
    verifyOwnership(req => req.event.organizationId),
    async (req, res, next) => {
        const event = req.event;
        const body = req.validatedBody;

        try {
            const updated = await sequelize.transaction(async (t) => {
                event.set(body);
                await event.save({ transaction: t });
                await event.setTags(req.parsedTags, { transaction: t });
                const tags = await event.getTags({ transaction: t });
                return { event, tags };
            })

            await indexEvent(updated.event);
            return res.status(200).json({
                message: "success",
                "data": updated
            });
        } catch (err) {
            next(err);
        }
    }
);

// UPDATE an event's fields
router.patch('/:eid',
    authenticate,
    requireOrg,
    validate({ 
        params: eventParamValidation,
        body: updateEventValidation
    }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event"
    }),
    parseTags(Tag),
    verifyOwnership(req => req.event.organizationId),
    async (req, res, next) => {
        const event = req.event;
        const body = req.validatedBody;

        try {
            const updated = await sequelize.transaction(async (t) => {
                if (body && Object.keys(body).length > 0) {
                    event.set(body);
                    await event.save({ transaction: t });
                }
                if (req.tags !== undefined){
                    await event.setTags(req.parsedTags, { transaction: t });
                }
                const tags = await event.getTags({ transaction: t });
                return { event, tags };
            });

            await indexEvent(updated.event);
            return res.status(200).json({
                message: "success",
                "data": updated
            });
        } catch (err) {
            next(err);
        }
    }
);

// DELETE an event
router.delete('/:eid',
    authenticate,
    requireOrg,
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event"
    }),
    verifyOwnership(req => req.event.organizationId),
    async (req, res, next) => {
        const event = req.event;

        try {
            await removeEvent(event.id);
            await event.destroy();
            return res.status(204).end();
        } catch (err) {
            next(err);
        }
    }
);

// GET event attendees (the roster)
// Restricted to the organization that owns the event: this returns volunteer
// names and photos, which should not be readable by the whole internet. The
// public event page uses `attendeeCount` from GET /:eid instead.
router.get('/:eid/attendees',
    authenticate,
    requireOrg,
    validate({
        params: eventParamValidation,
    }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event",
        include: [{
            model: User,
            attributes: ['id', 'username', 'displayName', 'profilePic'],
            through: { attributes: [] }
        }]
    }),
    verifyOwnership(req => req.event.organizationId),
    async (req, res) => {
        return res.status(200).json({
            message: "success",
            data: req.event.Users
        });
    }
);

// ADD an attendee
router.post('/:eid/attendees',
    authenticate,
    requireUser,
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event",
    }),
    async (req, res, next) => {
        const event = req.event;
        const user = req.user;

        try {
            // Capacity has to hold here, not just in the UI, or "0 spots left"
            // means nothing. Events with no capacity set are unlimited.
            if (event.capacity != null) {
                const attending = await event.countUsers();
                const already = await event.hasUser(user.id);

                if (!already && attending >= event.capacity) {
                    return res.status(409).json({ message: "This event is full" });
                }
            }

            await event.addUser(user.id);
            return res.status(201).json({ message: "joined" });
        } catch (err) {
            if (err.name === "SequelizeUniqueConstraintError") {
              return res.status(409).json({ error: "already attending" });
            }
            next(err);
        }
    }
);

// REMOVE attendee
router.delete('/:eid/attendees/me',
    authenticate,
    requireUser,
    validate({ params: eventParamValidation }),
    load(Event, {
        identifier: "eid",
        modelField: "id",
        reqKey: "event",
    }),
    async (req, res, next) => {
        const event = req.event;
        const user = req.user;

        try {
            await event.removeUser(user.id);
            return res.status(200).json({ message: "removed" });
        } catch (err) {
            next(err);
        }
    }
);


module.exports = router;