document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    //  ดึงค่าจากฟอร์ม
    const fullname = document.getElementById('fullname').value;
    const idCard = document.getElementById('id_card').value;
    const dob = document.getElementById('dob').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const congenital_disease = document.getElementById('congenital_disease').value;
    const allergic_medicine = document.getElementById('allergic_medicine').value;

    // ตรวจสอบความถูกต้องเบื้องต้น (Client-side validation)
    if (idCard.length !== 13) {
        return Swal.fire('ข้อมูลไม่ถูกต้อง', 'เลขบัตรประชาชนต้องมี 13 หลัก', 'warning');
    }
    if (phone.length < 9) {
        return Swal.fire('ข้อมูลไม่ถูกต้อง', 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง', 'warning');
    }

    // เตรียมข้อมูลส่งไป Backend
    const formData = {
        fullname,
        idCard,
        dob,
        phone,
        address,
        congenital_disease,
        allergic_medicine
    };

    try {
        // แสดง Loading ระหว่างรอ
        Swal.fire({
            title: 'กำลังบันทึกข้อมูล...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        // ยิง API (ตรวจสอบ URL ของคุณให้ถูกต้อง เช่น http://localhost:8000/api/patient/register)
        const response = await axios.post('http://localhost:8000/patient/register', formData);

        if (response.status === 201) {
            // แสดงการแจ้งเตือนสำเร็จ พร้อมบอก Username และ Password
            Swal.fire({
                title: 'ลงทะเบียนสำเร็จ!',
                icon: 'success',
                html: `
                    <div style="text-align: left; background: #f0f7ff; padding: 20px; border-radius: 15px; border: 1px solid #bae6fd; margin-top: 15px;">
                        <p style="margin-bottom: 10px; color: #0369a1;"><b>ข้อมูลการเข้าสู่ระบบของคุณ:</b></p>
                        <p style="font-size: 1.1rem;">👤 <b>Username:</b> <span style="color: #1a73e8;">${response.data.username}</span></p>
                        <p style="font-size: 1.1rem;">🔑 <b>Password:</b> <span style="color: #1a73e8;">${response.data.password}</span></p>
                        <hr style="margin: 15px 0; border: 0; border-top: 1px solid #bae6fd;">
                        <p style="font-size: 0.9rem; color: #64748b;">*รหัสผ่านของคุณคือเบอร์โทรศัพท์ที่ใช้สมัคร</p>
                    </div>
                `,
                confirmButtonText: 'ไปหน้าเข้าสู่ระบบ',
                confirmButtonColor: '#1a73e8',
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    // ส่งไปหน้าล็อกอิน (ปรับ Path ตามจริง)
                    window.location.href = '../login/login.html'; 
                }
            });
        }
    } catch (error) {
        console.error('Error:', error);
        const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
        Swal.fire('ลงทะเบียนไม่สำเร็จ', message, 'error');
    }
});