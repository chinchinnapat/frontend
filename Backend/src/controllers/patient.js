const PatientModel = require('../models/patient')
const UserModel = require('../models/users')

const validatePatient = (data) => {
    const errors = []
    if (!data.idCard) errors.push('กรุณากรอกเลขบัตรประจำตัวประชาชน')
    if (!data.firstname) errors.push('กรุณากรอกชื่อจริง')
    if (!data.lastname) errors.push('กรุณากรอกนามสกุล')
    if (!data.age) errors.push('กรุณากรอกอายุ')
    if (!data.phone) errors.push('กรุณากรอกเบอร์โทรศัพท์มือถือ')
    if (!data.address) errors.push('กรุณากรอกที่อยู่')
    return errors
}

const validateRegister = (data) => {
    const errors = []
    if (!data.idCard) errors.push('กรุณากรอกเลขบัตรประจำตัวประชาชน')
    if (!data.fullname) errors.push('กรุณากรอกชื่อ-นามสกุล')
    if (!data.phone) errors.push('กรุณากรอกเบอร์โทรศัพท์มือถือ')
    return errors
}

const getAllPatient = async (req, res, next) => {
    try {
        const patient = await PatientModel.findAllPatient()
        res.json(patient)
    } catch (error) {
        next(error)
    }
}
const getPatientById = async (req, res, next) => {
    try {
        const patient = await PatientModel.findPatientById(req.params.id)
        if (!patient) return res.status(404).json({ message: 'ไม่พบข้อมูลรายชื่อคนไข้' })
        res.json(patient)
    } catch (error) {
        next(error)
    }
}

const postPatient = async (req, res, next) => {
    try {
        const data = req.body
        
        const errors = validateRegister(data)
        if (errors.length > 0) {
            return res.status(400).json({ message: 'กรอกข้อมูลไม่ครบถ้วน', errors })
        }

        if (data.fullname) {
            const name = data.fullname.trim()
            const prefixes = ['นาย', 'นางสาว', 'นาง', 'เด็กชาย', 'เด็กหญิง']
            let detectedPrefix = '-';
            let nameWithoutPrefix = name

            for (let p of prefixes) {
                if (name.startsWith(p)) {
                    detectedPrefix = p
                    nameWithoutPrefix = name.substring(p.length).trim()
                    break;
                }
            }

            const nameParts = nameWithoutPrefix.split(' ')
            data.prefix = detectedPrefix
            data.firstname = nameParts[0]
            data.lastname = nameParts.slice(1).join(' ') || '-'
        }

        if (data.dob) {
            const birthDate = new Date(data.dob)
            const today = new Date()
            let age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            data.age = age
        } else {
            data.age = 0
        }
        await PatientModel.registerPatientWithUser(data)

        res.status(201).json({
            message: 'ลงทะเบียนสำเร็จ',
            username: data.idCard,
            password: data.phone
        })
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'เลขบัตรประชาชนนี้เคยลงทะเบียนไว้แล้ว' })
        }
        next(error)
    }
}

const putByPatientId = async (req, res, next) => {
    try {
        const id = req.params.id
        const errors = validatePatient(req.body)
        if (errors.length > 0) {
            return res.status(400).json({ message: 'กรอกข้อมูลไม่ครบถ้วน', errors })
        }

        const { firstname, lastname, age, phone, address, congenital_disease, allergic_medicine } = req.body
        const result = await PatientModel.editPatientById(id, { firstname, lastname, age, phone, address, congenital_disease, allergic_medicine })
        if (!result) {
            return res.status(404).json({ message: 'แก้ไขข้อมูลคนไข้ไม่สำเร็จ' })
        }
        res.json({ message: 'แก้ไขข้อมูลคนไข้สำเร็จ' })
    } catch (error) {
        next(error)
    }
}

const deleteByPatientId = async (req, res, next) => {
    try {
        const result = await PatientModel.removePatientById(req.params.id)
        if (!result) {
            return res.status(500).json({ message: 'ลบข้อมูลไม่สำเร็จ' })
        }
        res.json({ message: 'ลบข้อมูลของคนไข้สำเร็จ' })
    } catch (error) {
        next(error)
    }
}

module.exports = { getAllPatient, getPatientById, postPatient, putByPatientId, deleteByPatientId }