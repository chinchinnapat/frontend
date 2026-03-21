document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = new FormData(e.target) //จะวิ่งไปอ่านทุก input ในform
    const data = Object.fromEntries(formData.entries()) //แปลง key, value แปลงเป็น object

    try {
    const response = await api.users.login(data)
    if (response.status === 200) {
        const loginInfo = response.data.data;

        localStorage.setItem('userData', JSON.stringify(loginInfo))
        localStorage.setItem('userRole', loginInfo.role)

        if (loginInfo.role === 'admin') {
            window.location.href = '../admin/admin-dashboard.html'
        } else {
            window.location.href = '../user-dashboard/patient-dashboard.html'
        }
    }
    }catch(error){
        const errorMsg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
        alert(errorMsg)
    }
})