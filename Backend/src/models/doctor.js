const { getConnection } = require('../config/db')

const findAllDoctor = async () => {
    const conn = await getConnection()
    const [row] = await conn.query('SELECT * FROM doctor WHERE is_active = 1')
    return row
}

const findDoctorById = async (id) => {
    const conn = await getConnection()
    const [row] = await conn.query(
        'SELECT prefix, firstname, lastname, license_number, phone_number FROM doctor WHERE doctor_id = ?', [id])
    return row[0]
}

const addDoctor = async (data) => {
    const conn = await getConnection()
    const { user_id, prefix, firstname, lastname, license_number, phone_number } = data
    const [result] = await conn.query(
        'INSERT INTO doctor (user_id, prefix, firstname, lastname, license_number, phone_number, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [user_id, prefix, firstname, lastname, license_number, phone_number]
    )
    return result
}

const editDoctorById = async (id, data) => {
    const conn = await getConnection()
    const { prefix, firstname, lastname, license_number, phone_number } = data
    const [result] = await conn.query(
        'UPDATE doctor SET prefix = ?, firstname = ?, lastname = ?, license_number = ?, phone_number = ? WHERE doctor_id = ?',
        [prefix, firstname, lastname, license_number, phone_number, id]
    )
    return result
}

const removeDoctorById = async (id) => {
    const conn = await getConnection()
    const [result] = await conn.query(
        'UPDATE doctor SET is_active = 0 WHERE doctor_id = ?', 
        [parseInt(id)]
    );
    return result
}

module.exports = { findAllDoctor, findDoctorById, addDoctor, editDoctorById, removeDoctorById }