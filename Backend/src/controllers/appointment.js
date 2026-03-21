const AppointmentModel = require('../models/appointment')

const validateAppointment = (data) => {
    const errors = []
    if (!data.patient_id) errors.push('กรุณากรอกรหัสคนไข้')
    if (!data.doctor_id) errors.push('กรุณากรอกรหัสหมอ')
    if (!data.app_date) errors.push('กรุณากรอกวันที่ทำการนัด')
    if (!data.app_time) errors.push('กรุณากรอกเวลาที่ทำการนัด')
    if (!data.reason) errors.push('กรุณากรอกหมายเหตุ')

    return errors
}

const getAppointmentByPatientId = async (req, res, next) => {
    try {
        const appointment = await AppointmentModel.findAppointmentByPatientId(req.params.id)
        if (!appointment) return res.status(404).json({ message: 'ไม่พบข้อมูลการนัดหมาย' })
        res.json(appointment)
    } catch (error) {
        next(error)
    }
}

const getAllAppointment = async (req, res, next) =>{
    try{
        const appointment = await AppointmentModel.findAllAppointment()
        if(!appointment){
            return res.status(404).json({message: 'ไม่พบข้อมูลการนัดหมาย'})
        }
        res.json(appointment)
    }catch(error){
        next(error)
    }
}

const postAppointmentByPatientId = async (req, res, next) => {
    try {
        const errors = validateAppointment(req.body)
        if (errors.length > 0) {
            return res.status(400).json({ message: 'กรอกข้อมูลการนัดหมายไม่ครบถ้วน', errors })
        }
        const result = await AppointmentModel.addAppointmentByPatientId(req.body)
        res.json({ message: 'เพิ่มข้อมูลการนัดหมายสำเร็จ', data: result })
    } catch (error) {
        next(error)
    }
}


const cancelAppointment = async (req, res, next) => {
    try {
        const { id } = req.params
        const result = await AppointmentModel.updateStatus(id, 'cancelled')
        res.json({ message: 'ยกเลิกนัดหมายสำเร็จ' })
    } catch (error) {
        next(error)
    }
}

const confirmAppointment = async (req, res, next) => {
    try {
        const { id } = req.params
        const result = await AppointmentModel.updateStatus(id, 'confirmed')
        
        if (!result) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการนัดหมาย' })
        }
        
        res.json({ message: 'ยืนยันการนัดหมายสำเร็จ' })
    } catch (error) {
        next(error)
    }
}

const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status } = req.body
        if (!status) return res.status(400).json({ message: 'กรุณาระบุ status' })
        const result = await AppointmentModel.updateStatus(id, status)
        if (!result) return res.status(404).json({ message: 'ไม่พบข้อมูลการนัดหมาย' })
        res.json({ message: `อัปเดตสถานะเป็น ${status} สำเร็จ` })
    } catch (error) {
        next(error)
    }
}

module.exports = { getAppointmentByPatientId, postAppointmentByPatientId, cancelAppointment, getAllAppointment, confirmAppointment, updateAppointmentStatus }