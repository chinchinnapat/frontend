const mysql = require('mysql2/promise')

let conn = null

const getConnection = async () => {
    if (!conn) {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || 'p@ssw0rd',
            database: process.env.DB_NAME || 'clinic_db',
            port: parseInt(process.env.DB_PORT) || 3306
        })
    }
    return conn
}

module.exports = { getConnection }