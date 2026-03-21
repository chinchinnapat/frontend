const { getConnection } = require('../config/db')

const findUserAll = async () => {
    const conn = await getConnection()
    const [row] = await conn.query('SELECT * FROM users')
    return row
}

const findUserById = async (id) => {
    const conn = await getConnection()
    const [row] = await conn.query(
        'SELECT user_id, username, role, patient_id FROM users WHERE user_id = ?', 
        [id]
    )
    return row[0]
}

const checkUser = async (username, password) => {
    const conn = await getConnection()
    try {
        const [row] = await conn.query(
            `SELECT u.user_id, u.username, u.role, u.patient_id,
                    d.doctor_id, d.firstname, d.lastname, d.prefix
             FROM users u
             LEFT JOIN doctor d ON u.user_id = d.user_id
             WHERE u.username = ? AND u.password = ?`,
            [username, password]
        );
        return row[0]
    } catch (error) {
        console.error("SQL Error in checkUser:", error)
        throw error
    }
}

const addUserForPatient = async (data) => {
    const conn = await getConnection()
    const { username, password } = data
    const [result] = await conn.query(
        'INSERT INTO users (username, password, role, is_active) VALUES (?, ?, ?, ?)',
        [username, password, 'patient', 1]
    )
    return result.insertId
}

const updatePassword = async (id, data) => {
    const conn = await getConnection()
    const { password } = data
    const [result] = await conn.query(
        'UPDATE users SET password = ? WHERE user_id = ?',
        [password, id]
    )
    return result
}

const updateUser = async (id, data) => {
    const { is_active } = data
    const conn = await getConnection()
    const [result] = await conn.query(
        'UPDATE users SET is_active = ? WHERE user_id = ?',
        [is_active, parseInt(id)]
    );
    return result
};

module.exports = { updateUser, findUserById, addUserForPatient, checkUser, updatePassword, findUserAll }