const { z } = require("zod");

const registerValidation = z.object({
    username: z.string(50).min(2).regex(/^[a-zA-Z0-9_]+$/).trim().toLowerCase(),
    email: z.email(),
    password: z.string().min(8),
}).strict();

const loginValidation = z.union([ 
    z.object({
        username: z.string().regex(/^[a-zA-Z0-9_]+$/).trim().toLowerCase(),
        email: z.never().optional(),
        password: z.string().min(1),
    }),
    z.object({
        email: z.email(),
        username: z.never().optional(),
        password: z.string().min(1),
    })
])          // use union to define XOR behavior between username and email

const googleAuthValidation = z.object({
    token: z.string().min(1),
}).strict();

// Which account type the address belongs to — users and orgs are separate
// tables and may legitimately share an email address.
const forgotPasswordValidation = z.object({
    email: z.email(),
    role: z.enum(["user", "org"]).default("user"),
}).strict();

const resetPasswordValidation = z.object({
    token: z.string().min(1),
    password: z.string().min(8),
}).strict();

module.exports = {
    registerValidation,
    loginValidation,
    googleAuthValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
};
