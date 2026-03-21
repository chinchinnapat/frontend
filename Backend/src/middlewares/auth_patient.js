const isPatient = (req, res, next) => {
    if (req.user && req.user.role === 'patient') {
        next()
    } else {
        res.status(403).json({ message: 'คุณไม่มีสิทธิ์การเข้าถึง' })
    }
}

module.exports = isPatient