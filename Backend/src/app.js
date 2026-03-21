const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors')
const errorHandler = require('./middlewares/errorHandler')

const app = express()
app.use(cors())
app.use(bodyparser.json())

app.use('/users', require('./routes/users'))
app.use('/patient', require('./routes/patient'))
app.use('/doctor', require('./routes/doctor'))
app.use('/appointment', require('./routes/appointment'))
app.use('/visit', require('./routes/visit'))
app.use('/medical_records', require('./routes/medical_record'))

app.use(errorHandler)

module.exports = app