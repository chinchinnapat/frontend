const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');
const patientId = urlParams.get('patientId');

const loadUserData = async () => {
    if (!userId) return;
    try {
        if (typeof api === 'undefined') throw new Error("ไม่พบไฟล์ api.js กรุณาเช็ค Path ใน HTML");

        const userRes = await api.users.getById(userId);
        const user = userRes.data;

        document.getElementById('username').value = user.username || '';
        document.getElementById('role').value = user.role.toLowerCase();
        document.getElementById('status').value = user.is_active === 0 ? 'inactive' : 'active';

        if (patientId && patientId !== 'null') {
            try {
                const patientRes = await api.patients.getById(patientId);
                document.getElementById('phone').value = patientRes.data.phone_number || '';
            } catch (err) {
                document.getElementById('phone').value = '';
            }
        }
    } catch (error) {
        console.error("Load Data Error:", error);
        Swal.fire('ผิดพลาด', error.message, 'error');
    }
};

// บันทึกข้อมูล
document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const statusValue = document.getElementById('status').value === 'active' ? 1 : 0;

    try {
        Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
        await api.users.update(userId, { is_active: statusValue });

        Swal.fire('สำเร็จ', 'อัปเดตสถานะเรียบร้อย', 'success').then(() => {
            window.location.href = 'admin-user.html';
        });
    } catch (error) {
        console.error(error);
        Swal.fire('ผิดพลาด', 'บันทึกไม่สำเร็จ: ' + error.response.data.message, 'error');
    }
});

document.addEventListener('DOMContentLoaded', loadUserData);