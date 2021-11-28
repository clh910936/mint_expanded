const pg = require('pg');

module.exports = {
    openDatabaseConnection: function () {
        const pool = new pg.Pool({
            user: process.env.DB_USERNAME,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        });
        return pool;
    },
    clearTable: async function (db, tableName) {
        const query = `DELETE FROM ${tableName}`;
        db.query(query);
    },
    deleteTable: async function (db, tableName) {
        const query = `DROP TABLE ${tableName} IF EXISTS`;
        db.query(query);
    }
}