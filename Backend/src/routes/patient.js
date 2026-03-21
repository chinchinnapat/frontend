const express = require('express')
const router = express.Router()
const controller = require('../controllers/patient')
const isAdmin = require('../middlewares/auth_admin')
const isStaff = require('../middlewares/auth_staff')

router.get('/', controller.getAllPatient)
router.post('/register', controller.postPatient)
router.get('/:id', controller.getPatientById)
router.post('/', controller.postPatient)
router.put('/:id', controller.putByPatientId)
router.delete('/:id', controller.deleteByPatientId)

module.exports = router