const express = require('express')
const router = express.Router()
const controller = require('../controllers/appointment')

router.get('/', controller.getAllAppointment)
router.post('/', controller.postAppointmentByPatientId)
router.put('/cancel/:id', controller.cancelAppointment)
router.put('/confirm/:id', controller.confirmAppointment)
router.put('/:id/status', controller.updateAppointmentStatus)
router.get('/:id', controller.getAppointmentByPatientId)

module.exports = router