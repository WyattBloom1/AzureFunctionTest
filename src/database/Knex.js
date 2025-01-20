const options = {
    encrypt: (process.env.DP_ENCRYPT == "true"),
    trustServerCertificate: false,
    instanceName: ""
}

if( process.env.DB_PORT != "NONE" )
    options.port = parseInt(process.env.DB_PORT);

const envConfig = {
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    options: options,
    instanceName: ""
};

const knex = require("knex")({
    client: "mssql",
    connection: envConfig
});

module.exports = {
    knex
}