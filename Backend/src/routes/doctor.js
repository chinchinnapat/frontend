const express = require('express')
const router = express.Router()
const controller = require('../controllers/doctor')

router.get('/', controller.getAllDoctor)
router.get('/:id', controller.getDoctorById)
router.post('/', controller.postDoctor)
router.put('/:id', controller.putDoctorById)
router.delete('/:id', controller.deleteDoctorById)

module.exports = router