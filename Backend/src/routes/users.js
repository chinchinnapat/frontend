const express = require('express')
const router = express.Router()
const controller = require('../controllers/users')

router.get('/', controller.getUserAll)
router.get('/:id', controller.getUserById)
router.post('/login', controller.userLogin)
router.put('/:id', controller.putUser)


module.exports = router