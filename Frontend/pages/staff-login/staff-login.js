document.getElementById('staffLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. ดึงค่าจาก Form input
    const usernameInput = document.getElementById('staff_id').value;
    const passwordInput = document.getElementById('password').value;

    if (!usernameInput || !passwordInput) {
        Swal.fire('กรุณากรอกข้อมูล', 'โปรดระบุรหัสเจ้าหน้าที่และรหัสผ่าน', 'warning');
        return;
    }

    try {
        // 2. ส่งข้อมูลไปยัง Backend API (ใช้ /users/login ตาม Route หลังบ้าน)
        const response = await axios.post('http://localhost:8000/users/login', {
            username: usernameInput, 
            password: passwordInput
        });

        // 3. จัดการข้อมูลที่ได้จาก Backend
        const userData = response.data.data || response.data;
        
        if (!userData || !userData.role) {
            throw new Error("ไม่พบข้อมูลบทบาทผู้ใช้งาน");
        }

        const role = userData.role.toLowerCase().trim();
        const displayName = userData.username || "Staff";

        // 4. ตรวจสอบสิทธิ์ (admin หรือ doctor เท่านั้น)
        if (role === 'admin' || role === 'doctor') {
            
            // เก็บข้อมูลลง localStorage
            localStorage.setItem('staffData', JSON.stringify(userData));

            Swal.fire({
                title: 'เข้าสู่ระบบสำเร็จ',
                text: `ยินดีต้อนรับคุณ ${displayName} (บทบาท: ${role})`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                //  นำทางไปยังหน้าที่ถูกต้อง
                if (role === 'admin') {
                    window.location.href = '../admin/admin-dashboard.html';
                } else if (role === 'doctor') {
                    window.location.href = '../doctor/doctor-appointment.html';
                }
            });

        } else {
            Swal.fire({
                title: 'ปฏิเสธการเข้าถึง',
                text: `บทบาท "${role}" ไม่มีสิทธิ์เข้าใช้งานส่วนเจ้าหน้าที่`,
                icon: 'error'
            });
        }

    } catch (error) {
        console.error('Login Error:', error);
        const errorMessage = error.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        Swal.fire({
            title: 'เข้าสู่ระบบไม่สำเร็จ',
            text: errorMessage,
            icon: 'error'
        });
    }
});