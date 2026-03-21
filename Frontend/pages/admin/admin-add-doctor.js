

const saveDoctor = async (event) => {
    event.preventDefault();

    const prefix = document.getElementById('prefix').value;
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const licenseId = document.getElementById('licenseId').value.trim();
    const phone = document.getElementById('phone').value.trim();

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId') || 8; 


    if (!prefix || !firstName || !lastName || !licenseId || !phone || !userId) {
        return Swal.fire({
            title: 'ข้อมูลไม่ครบถ้วน',
            text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง และระบุรหัสผู้ใช้งาน',
            icon: 'warning',
            confirmButtonColor: '#3b82f6'
        });
    }

    const doctorData = {
        user_id: userId,  
        prefix: prefix,
        first_name: firstName,  
        last_name: lastName,   
        license_id: licenseId,  
        phone: phone         
    };

    try {
        Swal.fire({
            title: 'กำลังบันทึก...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const response = await api.doctors.create(doctorData);

        if (response.status === 201 || response.status === 200) {
            await Swal.fire({
                title: 'บันทึกสำเร็จ!',
                text: `เพิ่มข้อมูล ${prefix} ${firstName} เรียบร้อยแล้ว`,
                icon: 'success'
            });
            window.location.href = 'admin-doctor.html';
        }

    } catch (error) {
        console.error("Save Doctor Error:", error);
        let errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        if (error.response && error.response.data) {
            errorMessage = error.response.data.message || errorMessage;
            if (error.response.data.errors) {
                errorMessage += `: ${error.response.data.errors.join(', ')}`;
            }
        }

        Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#ef4444'
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addDoctorForm');
    if (form) {
        form.addEventListener('submit', saveDoctor);
    }
});