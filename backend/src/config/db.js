const { Pool } = require("pg");
const { config } = require("./env");
const { logger } = require("../utils/logger");

const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port,
    max: config.db.max,
    idleTimeoutMillis: config.db.idleTimeoutMillis,
    connectionTimeoutMillis: config.db.connectionTimeoutMillis
});

pool.on("error", (err) => {
    logger.error("Unexpected PostgreSQL client error in pool", {
        error: err.message,
        code: err.code
    });
});

module.exports = pool;