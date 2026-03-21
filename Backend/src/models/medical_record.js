const { getConnection } = require('../config/db')

const createMedicalRecord = async (data) => {
    const conn = await getConnection()
    const { visit_id, diagnosis, treatment_plan, prescriptions } = data
    
    try {
        await conn.beginTransaction()

        const sql = 'INSERT INTO medical_records (visit_id, diagnosis, treatment_plan, prescriptions) VALUES (?, ?, ?, ?)'
        const [result] = await conn.query(sql, [visit_id, diagnosis, treatment_plan, prescriptions])
        
        const [visits] = await conn.query('SELECT app_id FROM visits WHERE visit_id = ?', [visit_id])

        if (visits.length > 0 && visits[0].app_id) {
            await conn.query('UPDATE appointments SET status = "completed" WHERE app_id = ?', [visits[0].app_id])
        }

        await conn.commit()
        return result.insertId
    } catch (error) {
        await conn.rollback()
        console.error("Error in createMedicalRecord:", error)
        throw error
    }
}

const findMedicalRecordByVisitId = async (visitId) => {
    const conn = await getConnection()
    const [result] = await conn.query('SELECT * FROM medical_records WHERE visit_id = ?', [visitId])
    return result[0]
}

const findTimelineByPatientId = async (patientId) => {
    const conn = await getConnection()
    const sql = `
        SELECT mr.*, v.visit_date, d.firstname as doctor_fname, d.lastname as doctor_lname
        FROM medical_records mr
        JOIN visits v ON mr.visit_id = v.visit_id
        JOIN doctor d ON v.doctor_id = d.doctor_id
        WHERE v.patient_id = ?
        ORDER BY v.visit_date DESC
    `;
    const [result] = await conn.query(sql, [patientId])
    return result
};

module.exports = { createMedicalRecord, findMedicalRecordByVisitId, findTimelineByPatientId }