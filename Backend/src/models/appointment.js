const { getConnection } = require('../config/db')

const findAppointmentByPatientId = async (id) => {
    const conn = await getConnection()
        const [rows] = await conn.query(`
            SELECT 
                a.*, 
                d.prefix, 
                d.firstname AS doctor_firstname, 
                d.lastname AS doctor_lastname
            FROM appointments a
            JOIN doctor d ON a.doctor_id = d.doctor_id
            WHERE a.patient_id = ?
            ORDER BY a.app_date ASC, a.app_time ASC
        `, [id]);
        return rows; 
}

const findAllAppointment = async () => {
    const conn = await getConnection()
    const [result] = await conn.query(`
        SELECT 
            a.*,
            p.firstname,
            p.lastname
        FROM appointments a
        LEFT JOIN patient p ON a.patient_id = p.patient_id
        ORDER BY a.app_date DESC, a.app_time DESC
    `)
    return result
}

const addAppointmentByPatientId = async (data) => {
    const conn = await getConnection()
    const { patient_id, doctor_id, app_date, app_time, reason } = data
    const [result] = await conn.query(
        'INSERT INTO appointments (patient_id, doctor_id, app_date, app_time, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
        [patient_id, doctor_id, app_date, app_time, reason, 'pending']
    )
    return result
}


const updateStatus = async (appId, status) => {
    const conn = await getConnection()
        const [result] = await conn.query(
            'UPDATE appointments SET status = ? WHERE app_id = ?',
            [status, appId]
        );
        return result.affectedRows > 0
}

module.exports = { findAllAppointment,findAppointmentByPatientId, addAppointmentByPatientId, updateStatus}