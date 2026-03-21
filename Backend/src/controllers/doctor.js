const DoctorModel = require('../models/doctor')

const validateDoctor = (data) => {
    const errors = []
    if (!data.user_id) errors.push('กรุณากรอก user_id ของหมอ')
    if (!data.prefix) errors.push('กรุณากรอกคำนำหน้าชื่อ')
    if (!data.first_name) errors.push('กรุณากรอกชื่อจริง')
    if (!data.last_name) errors.push('กรุณากรอกนามสกุล')
    if (!data.license_id) errors.push('กรุณากรอกเลขที่ใบประกอบวิชาชีพ')
    if (!data.phone) errors.push('กรุณากรอกเบอร์ติดต่อ')
    return errors
}

const getAllDoctor = async (req, res, next) => {
    try {
        const doctor = await DoctorModel.findAllDoctor()
        res.json(doctor)
    } catch (error) {
        next(error)
    }
}

const getDoctorById = async (req, res, next) => {
    try {
        const doctor = await DoctorModel.findDoctorById(req.params.id)
        if (!doctor) return res.status(404).json({ message: 'ไม่พบบัญชี Doctor คนนี้' })
        res.json(doctor)
    } catch (error) {
        next(error)
    }
}

const postDoctor = async (req, res, next) => {
    try {
        const errors = validateDoctor(req.body)
        if (errors.length > 0) {
            return res.status(400).json({ message: 'กรอกข้อมูลไม่ครบถ้วน', errors })
        }

        const dbData = {
            user_id: req.body.user_id,
            prefix: req.body.prefix,
            firstname: req.body.first_name,
            lastname: req.body.last_name,
            license_number: req.body.license_id,
            phone_number: req.body.phone
        }

        const result = await DoctorModel.addDoctor(dbData)
        res.json({ message: 'เพิ่มข้อมูลสำเร็จ', data: result })
    } catch (error) {
        next(error)
    }
}

const putDoctorById = async (req, res, next) => {
    try {
        const id = req.params.id
        const dbData = {
            prefix: req.body.prefix,
            firstname: req.body.first_name,
            lastname: req.body.last_name,
            license_number: req.body.license_id,
            phone_number: req.body.phone
        }
        const result = await DoctorModel.editDoctorById(id, dbData)
        if (!result) return res.status(404).json({ message: 'แก้ไขข้อมูลไม่สำเร็จ' })
        res.json({ message: 'แก้ไขข้อมูลสำเร็จ' })
    } catch (error) {
        next(error)
    }
}

const deleteDoctorById = async (req, res, next) => {
    try {
        const result = await DoctorModel.removeDoctorById(req.params.id)
        if (!result) return res.status(500).json({ message: 'ลบบัญชีนี้ไม่สำเร็จ' })
        res.json({ message: 'ลบบัญชีสำเร็จเรียบร้อย' })
    } catch (error) {
        next(error)
    }
}

module.exports = { getAllDoctor, getDoctorById, postDoctor, putDoctorById, deleteDoctorById }