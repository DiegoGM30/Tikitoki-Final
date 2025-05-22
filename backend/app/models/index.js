// File: backend/app/models/index.js

const dbConfig = require('../config/db.config.js');
const Sequelize = require('sequelize'); // Corrected typo: Squelize -> Sequelize


// Create a connection pool to the database
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    // operatorAliases: false, // Removed: Deprecated in Sequelize v5+ and no effect in v6
    logging: false, // Set to console.log to see SQL queries, or a custom logger function
    pool: {
        max: dbConfig.pool.max, // Accessing pool properties correctly
        min: dbConfig.pool.min,
        idle: dbConfig.pool.idle,
        acquire: dbConfig.pool.acquire
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.Video = require('./video.model')(sequelize, Sequelize);
db.User = require('./user.model')(sequelize, Sequelize);

// Execute associate if exists (important for relationships)
// This ensures that model associations (like Video.belongsTo(User)) are set up.
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
