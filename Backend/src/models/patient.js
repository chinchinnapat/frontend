const { getConnection } = require('../config/db')

const findAllPatient = async () => {
    const conn = await getConnection()
    const [row] = await conn.query('SELECT * FROM patient')
    return row
}

const findPatientById = async (id) => {
    const conn = await getConnection()
    const [row] = await conn.query(
        'SELECT * FROM patient WHERE patient_id = ?', [id])
    return row[0]
}

const addPatient = async (data) => {
    const conn = await getConnection()
    const { idCard, prefix, firstname, lastname, age, phone, address, congenital_disease, allergic_medicine } = data
    const [result] = await conn.query(
        'INSERT INTO patient (idCard, prefix, firstname, lastname, age, phone, address, congenital_disease, allergic_medicine) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [idCard, prefix, firstname, lastname, age, phone, address, congenital_disease, allergic_medicine]
    )
    return result
}

const editPatientById = async (id, data) => {
    const conn = await getConnection()
    const { firstname, lastname, age, phone, address, congenital_disease, allergic_medicine } = data
    const [result] = await conn.query(
        'UPDATE patient SET firstname = ?, lastname = ?, age = ?, phone = ?, address = ?, congenital_disease = ?, allergic_medicine = ? WHERE patient_id = ?',
        [firstname, lastname, age, phone, address, congenital_disease, allergic_medicine, id]
    );
    return result
};

const removePatientById = async (id) => {
    const conn = await getConnection()
    const [result] = await conn.query('DELETE FROM patient WHERE patient_id = ?', [parseInt(id)])
    return result
}

const registerPatientWithUser = async (data) => {
    const conn = await getConnection()
    try {
        await conn.beginTransaction()

        const [patientResult] = await conn.query(
            'INSERT INTO patient (idCard, prefix, firstname, lastname, age, phone, address, congenital_disease, allergic_medicine) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.idCard, 
                data.prefix, 
                data.firstname, 
                data.lastname, 
                data.age || 0,
                data.phone, 
                data.address, 
                data.congenital_disease, 
                data.allergic_medicine
            ]
        )
        const patientId = patientResult.insertId

        await conn.query(
            'INSERT INTO users (username, password, role, patient_id) VALUES (?, ?, ?, ?)',
            [data.idCard, data.phone, 'patient', patientId]
        )

        await conn.commit()
        return true
    } catch (error) {
        await conn.rollback()
        throw error
    }
}

const updateStatus = async (appId, status) => {
    const conn = await getConnection()
    try {
        const [result] = await conn.query(
            'UPDATE appointments SET status = ? WHERE app_id = ?',
            [status, appId]
        );
        return result.affectedRows > 0
    } catch (error) {
        throw error
    }
};

module.exports = { findAllPatient, findPatientById, addPatient, editPatientById, removePatientById, registerPatientWithUser, updateStatus }