const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

/* A pending password reset.

   Users and organizations live in separate tables, so the row records which
   kind of account it belongs to rather than using a foreign key. Only the
   SHA-256 of the emailed token is kept — the raw token exists solely in the
   link sent to the account holder. */

const PasswordReset = sequelize.define("PasswordReset", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    principalKind: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: { isIn: [["user", "org"]] },
    },
    principalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    tokenHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: "password_resets",
    timestamps: true,
    underscored: true,
});

module.exports = PasswordReset;
