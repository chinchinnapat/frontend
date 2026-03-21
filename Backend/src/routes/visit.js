const express = require('express')
const router = express.Router()
const controller = require('../controllers/visit')

router.get('/search', controller.searchVisit)
router.get('/list', controller.getVisitsByPatientQuery)
router.get('/:id', controller.getPatientVisitHistoryById)
router.post('/', controller.postVisit)

module.exports = router