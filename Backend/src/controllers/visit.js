const VisitModel = require('../models/visit')

const validateVisit = (data) => {
    const errors = []
    if (!data.patient_id) errors.push('กรุณากรอกรหัสคนไข้')
    if (!data.doctor_id) errors.push('กรุณากรอกรหัสหมอ')
    if (!data.symptoms) errors.push('กรุณากรอกอาการของคนไข้')
    if (!data.weight) errors.push('กรุณากรอกน้ำหนักของคนไข้')
    if (!data.height) errors.push('กรุณากรอกส่วนสูงของคนไข้')
    if (!data.blood_pressure) errors.push('กรุณากรอกความดันของคนไข้')
    return errors
}

const postVisit = async (req, res, next) => {
    try {
        const errors = validateVisit(req.body)
        if (errors.length > 0) {
            return res.status(400).json({ message: 'กรอกข้อมูลไม่ครบถ้วน', errors })
        }
        const result = await VisitModel.createVisit(req.body)
        res.json({ message: 'เพิ่มข้อมูลสำเร็จ', data: result })
    } catch (error) {
        next(error)
    }
}

const getPatientVisitHistoryById = async (req, res, next) => {
    try {
        const id = req.params.id
        const history = await VisitModel.findVisitByPatientId(id)
        res.json({
            count: history.length,
            id: id,
            history: history
        })
    } catch (error) {
        next(error)
    }
}

const getVisitsByPatientQuery = async (req, res, next) => {
    try {
        const query = req.query.q
        if (!query) return res.status(400).json({ message: 'กรุณาระบุคำค้นหา' })
        const visits = await VisitModel.findVisitsByPatientQuery(query)
        if (!visits || visits.length === 0) {
            return res.status(404).json({ message: 'ไม่พบประวัติการตรวจ' })
        }
        res.json({ data: visits })
    } catch (error) {
        next(error)
    }
}

const searchVisit = async (req, res, next) => {
    try {
        const query = req.query.q
        const doctorId = req.query.doctor_id
        const visit = await VisitModel.findLatestVisitByQuery(query, doctorId)
        if (!visit) {
            return res.status(404).json({ message: 'ไม่พบรายการตรวจที่ยังไม่ได้บันทึกผล' })
        }
        res.json(visit)
    } catch (error) {
        next(error)
    }
}

module.exports = { postVisit, getPatientVisitHistoryById, searchVisit, getVisitsByPatientQuery }