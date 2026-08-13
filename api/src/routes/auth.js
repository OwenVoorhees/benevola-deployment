const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Organization = require('../models/Organization');
const PasswordReset = require('../models/PasswordReset');
const { Op } = require('sequelize');
const crypto = require('crypto');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const {
    registerValidation,
    loginValidation,
    googleAuthValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
} = require('../schemas/auth.schema');
const bcrypt = require('bcrypt');

// Where the frontend lives, for building reset links.
const IS_PROD = process.env.NODE_ENV === 'production';
const DOMAIN  = process.env.DOMAIN  || 'http://localhost';
const FE_PORT = process.env.FE_PORT || 3000;

const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// REGISTER a user
router.post('/register/user',
    validate({ body: registerValidation }),
    async (req, res, next) => {
        try {
            const { username, email, password } = req.validatedBody;

            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [{ email },{ username }],
                },
            });

            if (existingUser){
                return res.status(409).json({
                    message: existingUser.email === email
                        ? "Email already in use"
                        : "Username already in use",
                });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const newUser = await User.create({
                username,
                email,
                passwordHash,
            }); // "user" role is default

            req.session.regenerate((err) => {
                if (err) return next(err);

                req.session.principal = { kind: "user", id: newUser.id };

                return res.status(201).json({
                    message: "successfully registered",
                    data: {
                        id: newUser.id,
                        username: newUser.username,
                        email: newUser.email,
                        role: newUser.role,
                    }
                })
            })
        } catch (err) {
            next(err);
        }
    }
);

// REGISTER an organization
router.post('/register/org',
    validate({ body: registerValidation }),
    async (req, res, next) => {
        try {
            const { username, email, password } = req.validatedBody;

            const existingOrg = await Organization.findOne({
                where: {
                    [Op.or]: [{ email }, { name: username }],
                },
            });

            if (existingOrg) {
                return res.status(409).json({
                    message: existingOrg.email === email
                        ? "Email already in use"
                        : "Organization name already in use",
                });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const newOrg = await Organization.create({
                name: username,
                email,
                passwordHash,
            });

            req.session.regenerate((err) => {
                if (err) return next(err);

                req.session.principal = { kind: "org", id: newOrg.id };

                return res.status(201).json({
                    message: "successfully registered",
                    data: {
                        id: newOrg.id,
                        username: newOrg.name,
                        email: newOrg.email,
                    }
                })
            })
        } catch (err) {
            next(err);
        }
    }
);

// Log in a user
router.post('/login/user',
    validate({ body: loginValidation }),
    async (req, res, next) => {
        try {
            const { email, username, password } = req.validatedBody;

            const user = await User.findOne({ where: (email ? { email } : { username }) });
            if (!user) return res.status(401).json({ message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            req.session.regenerate((err) => {
                if (err) return next(err);
        
                req.session.principal = { kind: "user", id: user.id };
        
                return res.status(200).json({
                    message: "Login successful",
                    data: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                    },
                });
            });
        } catch (err) {
            next(err);
        }
    }
);

// Log in an org
router.post('/login/org',
    validate({ body: loginValidation }),
    async (req, res, next) => {
        try {
            const { email, password } = req.validatedBody;

            const org = await Organization.findOne({ where: { email } });
            if (!org) return res.status(401).json({ message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, org.passwordHash);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            req.session.regenerate((err) => {
                if (err) return next(err);
        
                req.session.principal = { kind: "org", id: org.id };
        
                return res.status(200).json({
                    message: "Login successful",
                    data: {
                        id: org.id,
                        username: org.username,
                        email: org.email,
                        role: org.role,
                    },
                });
            });
        } catch (err) {
            next(err);
        }
    }
);

/* ── Password reset ──────────────────────────────────────────────────────
   Two steps: ask for a link, then redeem it.

   NOTE: there is no mail transport wired up in this project yet. In
   development the reset link is returned in the response (and logged) so the
   flow is usable end to end; that is gated on NODE_ENV so production never
   hands the token back to the caller. Sending the email is the remaining
   piece — everything either side of it is in place. */

const RESET_TTL_MS = 1000 * 60 * 60; // one hour

const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

// POST /forgot-password
router.post('/forgot-password',
    validate({ body: forgotPasswordValidation }),
    async (req, res, next) => {
        try {
            const { email, role } = req.validatedBody;

            const account = role === 'org'
                ? await Organization.findOne({ where: { email } })
                : await User.findOne({ where: { email } });

            // Always answer the same way. Saying "no such account" here would
            // turn this endpoint into a way to test which emails are registered.
            const reply = {
                message: "If that account exists, a reset link has been sent.",
            };

            if (!account) return res.status(200).json(reply);

            // Any earlier link for this account stops working now.
            await PasswordReset.update(
                { usedAt: new Date() },
                { where: { principalKind: role, principalId: account.id, usedAt: null } }
            );

            const rawToken = crypto.randomBytes(32).toString('hex');

            await PasswordReset.create({
                principalKind: role,
                principalId: account.id,
                tokenHash: hashToken(rawToken),
                expiresAt: new Date(Date.now() + RESET_TTL_MS),
            });

            const link = `${DOMAIN}:${FE_PORT}/reset-password?token=${rawToken}`;

            if (!IS_PROD) {
                console.log(`[password reset] ${role} ${email} -> ${link}`);
                // Dev convenience only: lets the flow be exercised without mail.
                reply.devResetLink = link;
            }

            return res.status(200).json(reply);
        } catch (err) {
            next(err);
        }
    }
);

// POST /reset-password
router.post('/reset-password',
    validate({ body: resetPasswordValidation }),
    async (req, res, next) => {
        try {
            const { token, password } = req.validatedBody;

            const reset = await PasswordReset.findOne({
                where: { tokenHash: hashToken(token), usedAt: null },
            });

            if (!reset || reset.expiresAt.getTime() < Date.now()) {
                return res.status(400).json({
                    message: "This reset link is invalid or has expired. Request a new one.",
                });
            }

            const account = reset.principalKind === 'org'
                ? await Organization.findByPk(reset.principalId)
                : await User.findByPk(reset.principalId);

            if (!account) {
                return res.status(400).json({
                    message: "This reset link is no longer valid.",
                });
            }

            account.passwordHash = await bcrypt.hash(password, 12);
            await account.save();

            // Single use: burn this link, and any other outstanding one.
            await PasswordReset.update(
                { usedAt: new Date() },
                {
                    where: {
                        principalKind: reset.principalKind,
                        principalId: reset.principalId,
                        usedAt: null,
                    },
                }
            );

            return res.status(200).json({ message: "Password updated. You can log in now." });
        } catch (err) {
            next(err);
        }
    }
);

// POST /logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('sid');
        res.status(200).json({ message: 'logged out'});
    })
});

// GET /me
router.get('/me', authenticate, (req, res) => {
    const { passwordHash, ...info } = (req.user ?? req.org).toJSON();

    return res.status(200).json({
        message: 'success',
        data: {
            kind: req.session.principal.kind,
            info,
        }
    });
});

// // POST /google
// router.post('/google',
//     validate({ body: googleAuthValidation }),
//     async (req, res, next) => {
//         try {
//             const { token } = req.validatedBody;
            
//             let payload;
//             try {
//                 const ticket = await client.verifyIdToken({
//                     idToken: token,
//                     audience: GOOGLE_CLIENT_ID, 
//                 });
//                 payload = ticket.getPayload();
//             } catch (googleErr) {

//                 console.error("Google verify error:", googleErr);
//                 return res.status(401).json({ message: 'Invalid Google token' });
//             }

//             const { email, name, picture, sub } = payload;

//             if (!email) {
//                 return res.status(400).json({ message: 'Google account has no email' });
//             }

//             let user = await User.findOne({ where: { email } });

//             if (!user) {

//                 const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
//                 const passwordHash = await bcrypt.hash(randomPassword, 10);
                
//                 let baseUsername = email.split('@')[0];
//                 let username = baseUsername;
//                 let counter = 1;
//                 while (await User.findOne({ where: { username } })) {
//                     username = `${baseUsername}${counter}`;
//                     counter++;
//                 }

//                 user = await User.create({
//                     username,
//                     email,
//                     passwordHash,
//                     displayName: name,
//                     profilePic: picture,
//                     role: 'user'
//                 });
//             }

//             const jwtToken = generateToken(user);

//             return res.status(200).json({
//                 message: 'Google login successful',
//                 data: {
//                     user: {
//                         id: user.id,
//                         username: user.username,
//                         email: user.email,
//                         role: user.role,
//                         displayName: user.displayName,
//                         profilePic: user.profilePic
//                     },
//                     token: jwtToken
//                 }
//             });

//         } catch (err) {
//             next(err);
//         }
//     }
// );

module.exports = router;
