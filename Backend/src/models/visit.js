const { getConnection } = require('../config/db')

const createVisit = async (data) => {
    const conn = await getConnection()
    const { app_id, patient_id, doctor_id, symptoms, weight, height, blood_pressure } = data
    
    const [result] = await conn.query(
        'INSERT INTO visits (app_id, patient_id, doctor_id, visit_date, symptoms, weight, height, blood_pressure) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)',
        [app_id || null, patient_id, doctor_id, symptoms, weight, height, blood_pressure]
    );
    return result.insertId
}

const findVisitByPatientId = async (id) => {
    const conn = await getConnection()
    const [result] = await conn.query(
        'SELECT v.*, a.app_date, a.reason FROM visits v LEFT JOIN appointments a ON v.app_id = a.app_id WHERE v.patient_id = ? ORDER BY v.visit_date DESC',
        [id]
    )
    return result
}

const findVisitsByPatientQuery = async (query) => {
    const conn = await getConnection()
    const sql = `
        SELECT 
            v.*,
            p.firstname, p.lastname, p.allergic_medicine, p.patient_id,
            a.app_date, a.reason,
            CASE WHEN mr.record_id IS NOT NULL THEN 1 ELSE 0 END AS has_record
        FROM visits v
        JOIN patient p ON v.patient_id = p.patient_id
        LEFT JOIN appointments a ON v.app_id = a.app_id
        LEFT JOIN medical_records mr ON v.visit_id = mr.visit_id
        WHERE p.idCard = ? OR p.patient_id = ?
        ORDER BY v.visit_date DESC
    `;
    const [result] = await conn.query(sql, [query, query])
    return result
}

const findLatestVisitByQuery = async (query, doctorId) => {
    const conn = await getConnection()
    const sql = `
        SELECT v.*, p.firstname, p.lastname, p.allergic_medicine, p.patient_id
        FROM visits v
        JOIN patient p ON v.patient_id = p.patient_id
        LEFT JOIN medical_records mr ON v.visit_id = mr.visit_id
        WHERE (p.idCard = ? OR p.patient_id = ?) 
        AND mr.record_id IS NULL
        AND v.doctor_id = ?
        ORDER BY v.visit_id DESC LIMIT 1
    `;
    const [result] = await conn.query(sql, [query, query, doctorId])
    return result[0]
}

module.exports = { createVisit, findVisitByPatientId, findLatestVisitByQuery, findVisitsByPatientQuery }