const UserModel = require('../models/users')

const getUserAll = async (req, res, next) => {
    try {
        const user = await UserModel.findUserAll()
        res.json(user)
    } catch (error) {
        next(error)
    }
}

const getUserById = async (req, res, next) => {
    try {
        const user = await UserModel.findUserById(req.params.id)
        if (!user) return res.status(404).json({ message: 'ไม่พบบัญชีผู้ใช้งาน' })
        res.json(user)
    } catch (error) {
        next(error)
    }
}

const userLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body
        const user = await UserModel.checkUser(username, password)
        if (!user) {
            return res.status(401).json({ message: 'ไม่พบข้อมูลผู้ใช้งานในระบบ หรือรหัสผ่านไม่ถูกต้อง' })
        }
        res.json({ message: 'เข้าสู่ระบบสำเร็จ', data: user })
    } catch (error) {
        next(error)
    }
}

const updatePassword = async (req, res, next) => {
    try {
        const id = req.params.id
        const { password } = req.body
        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'รหัสผ่านต้องมีความยาว 8 ตัวขึ้นไป' })
        }
        const result = await UserModel.updatePassword(id, { password })
        if (!result) return res.status(404).json({ message: 'อัปเดตรหัสผ่านไม่สำเร็จ' })
        res.json({ message: 'อัปเดตรหัสผ่านเสร็จสิ้น' })
    } catch (error) {
        next(error)
    }
}

const putUser = async (req, res, next) => {
    try {
        const { id } = req.params
        const { is_active } = req.body
        const result = await UserModel.updateUser(id, { is_active })

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' })
        }

        res.json({ status: 'success', message: 'อัปเดตสถานะสำเร็จ' })
    } catch (error) {
        console.error("Update Error:", error)
        next(error)
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const result = await UserModel.removeUser(req.params.id)
        res.json({ message: 'ลบผู้ใช้งานสำเร็จ' })
    } catch (error) {
        res.status(400).json({ message: 'ไม่สามารถลบได้เนื่องจากมีข้อมูลนัดหมายค้างอยู่ในระบบ' })
    }
};

module.exports = { deleteUser,putUser, getUserById, userLogin, updatePassword, getUserAll }