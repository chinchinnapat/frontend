const express = require('express')
const router = express.Router()
const controller = require('../controllers/medical_record')

router.post('/', controller.postMedicalRecord)
router.get('/patient/:id', controller.getPatientHistory)
router.get('/:id', controller.getMedicalRecordByVisitId)

module.exports = router