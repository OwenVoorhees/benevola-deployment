const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const EventImage = sequelize.define('EventImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    url: {
        // TEXT, not STRING: image URLs run past 255 characters.
        type: DataTypes.TEXT,
        allowNull: false,
    },
    position: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'event_images',
    timestamps: true,
    underscored: true,
});

module.exports = EventImage;
