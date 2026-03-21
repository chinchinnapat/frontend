const isStaff = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'doctor')) {
        next()
    } else {
        res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการเข้าถึง' })
    }
}

module.exports = isStaff