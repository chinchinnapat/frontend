const RecordModel = require('../models/medical_record')

const validateMedicalRecord = (data) =>{
    const errors = []
    if(!data.visit_id) errors.push('กรุณากรอกรหัสของการเข้าพบ')
    if(!data.diagnosis) errors.push('กรุณากรอกผลการวินิจฉัย')
    if(!data.treatment_plan) errors.push('กรุณากรอกแนวทางการรักษา')
    if(!data.prescriptions) errors.push('กรุณากรอกใบสั่งยา')
    
    return errors
}

const getMedicalRecordByVisitId = async (req, res, next) => {
    try {
        const result = await RecordModel.findMedicalRecordByVisitId(req.params.id)
        res.json(result)
    } catch (error) {
        next(error)
    }
};

const getPatientHistory = async (req, res, next) =>{
    try{
        const id = req.params.id
        const history = await RecordModel.findTimelineByPatientId(id)

        if(!history){
            return res.status(404).json({message: 'ไม่พบประวัติการรักษา'})
        }
        res.json({
            id: id,
            total_visit: history.length,
            timeline: history
        })
    }catch(error){
        next(error)
    }
}

const postMedicalRecord = async (req, res, next) => {
    try {
        const { visit_id, diagnosis, treatment_plan, prescriptions } = req.body
        
        if (!visit_id) return res.status(400).json({ message: 'ไม่พบ Visit ID' })

        const result = await RecordModel.createMedicalRecord({
            visit_id, diagnosis, treatment_plan, prescriptions
        });
        
        res.json({ message: 'บันทึกข้อมูลสำเร็จ', data: result })
    } catch (error) {
        next(error)
    }
};

module.exports = {getMedicalRecordByVisitId, getPatientHistory, postMedicalRecord}