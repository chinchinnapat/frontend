// ตรวจสอบสิทธิ์ Admin
const checkAuth = () => {
    const staffData = JSON.parse(localStorage.getItem('staffData'));
    if (!staffData || staffData.role.toLowerCase() !== 'admin') {
        window.location.href = '../staff-login/staff-login.html';
    }
};

// โหลดข้อมูล Dashboard
const loadDashboardData = async () => {
    try {
        const [resApp, resPat, resDoc] = await Promise.all([
            api.appointments.getAll(),
            api.patients.getAll(),
            api.doctors.getAll()
        ]);

        document.getElementById('today-appointments').innerText = resApp.data.length || 0;
        document.getElementById('total-patients').innerText = resPat.data.length || 0;
        document.getElementById('total-doctors').innerText = resDoc.data.length || 0;

        renderRecentAppointments(resApp.data);
    } catch (error) {
        console.error("Dashboard Error:", error);
        const container = document.getElementById('recent-appointments-container');
        if (container) container.innerHTML = '<p style="color:red; text-align:center;">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
};

function renderRecentAppointments(appointments) {
    const container = document.getElementById('recent-appointments-container');
    if (!container) return;

    if (!appointments || appointments.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">ยังไม่มีข้อมูลการนัดหมาย</p>';
        return;
    }

    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
            <tr style="text-align: left; border-bottom: 2px solid #f1f5f9;">
                <th style="padding: 12px;">คนไข้ (ID)</th>
                <th style="padding: 12px;">วันที่นัด</th>
                <th style="padding: 12px;">เวลา</th>
                <th style="padding: 12px;">สถานะ</th>
                <th style="padding: 12px; text-align: center;">จัดการ</th>
            </tr>
        </thead><tbody>`;

    const displayData = [...appointments].slice(0, 10);

    displayData.forEach(app => {
        const status = (app.status || 'pending').toLowerCase();
        const isPending = status === 'pending';
        
        const colors = {
            confirmed: { bg: '#dcfce7', text: '#166534' },
            pending: { bg: '#fef9c3', text: '#854d0e' },
            cancelled: { bg: '#fee2e2', text: '#991b1b' }
        };

        const { bg, text } = colors[status] || colors.pending;

        tableHtml += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; color: #0f172a;">${app.firstname ? app.firstname + ' ' + app.lastname : 'Patient ID: ' + app.patient_id}</td>
                <td style="padding: 12px;">${app.app_date ? app.app_date.substring(0, 10) : '-'}</td>
                <td style="padding: 12px;">${app.app_time || '-'} น.</td>
                <td style="padding: 12px;">
                    <span style="padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; background: ${bg}; color: ${text};">
                        ${app.status || 'Pending'}
                    </span>
                </td>
                <td style="padding: 12px; text-align: center;">
                    ${isPending ? `
                        <button onclick="updateStatus(${app.app_id}, 'confirm')" style="background:#22c55e; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; margin-right:5px;">ยืนยัน</button>
                        <button onclick="updateStatus(${app.app_id}, 'cancel')" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem;">ยกเลิก</button>
                    ` : `<span style="color:#94a3b8; font-size:0.85rem;">จัดการแล้ว</span>`}
                </td>
            </tr>`;
    });

    container.innerHTML = tableHtml + `</tbody></table>`;
}

// กดยืนยัน/ยกเลิก
async function updateStatus(id, action) {
    const isConfirm = action === 'confirm';
    const { isConfirmed } = await Swal.fire({
        title: isConfirm ? 'ยืนยันการนัดหมาย?' : 'ยกเลิกการนัดหมาย?',
        icon: isConfirm ? 'question' : 'warning',
        showCancelButton: true,
        confirmButtonColor: isConfirm ? '#22c55e' : '#ef4444',
        confirmButtonText: 'ตกลง'
    });

    if (isConfirmed) {
        try {
            const res = isConfirm ? await api.appointments.confirm(id) : await api.appointments.cancel(id);
            if (res.status === 200) {
                Swal.fire('สำเร็จ', 'ดำเนินการแล้ว', 'success');
                loadDashboardData();
            }
        } catch (error) {
            Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
        }
    }
}

function logout() {
    localStorage.removeItem('staffData');
    window.location.href = '../staff-login/staff-login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDashboardData();
});