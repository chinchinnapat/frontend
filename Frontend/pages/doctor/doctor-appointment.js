const staffData = JSON.parse(localStorage.getItem('staffData') || '{}');

document.addEventListener('DOMContentLoaded', async () => {
    if (staffData.firstname) {
        const prefix = staffData.prefix || 'นพ./พญ.';
        document.getElementById('doctor_fullname').innerText =
            `${prefix} ${staffData.firstname} ${staffData.lastname}`;
    }
    await loadAppointments();
    setInterval(loadAppointments, 30000);
});

async function loadAppointments() {
    const tbody = document.getElementById('appointment_tbody');
    try {
        const res = await api.appointments.getAll();
        let list = res.data;
        while (list && list.data) { list = list.data; }
        if (!Array.isArray(list)) list = [];

        const myAppts = list
            .filter(a => parseInt(a.doctor_id) === parseInt(staffData.doctor_id))
            .sort((a, b) => new Date(b.app_date) - new Date(a.app_date));

        const now = new Date().toLocaleTimeString('th-TH');
        document.getElementById('last_updated').innerText = `อัปเดตล่าสุด ${now}`;

        if (myAppts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-state">ไม่มีรายการนัดหมาย</td></tr>`;
            return;
        }

        const statusMap = {
            confirmed: { label: 'ยืนยันแล้ว',  cls: 'badge-confirmed' },
            pending:   { label: 'รอการยืนยัน', cls: 'badge-pending'   },
            completed: { label: 'เสร็จสิ้น',    cls: 'badge-completed' },
            cancelled: { label: 'ยกเลิก',       cls: 'badge-cancelled' },
        };

        tbody.innerHTML = myAppts.map(app => {
            const dateStr = new Date(app.app_date).toLocaleDateString('th-TH',
                { year: 'numeric', month: 'long', day: 'numeric' });
            const s = (app.status || '').toLowerCase();
            const st = statusMap[s] || { label: app.status, cls: 'badge-pending' };
            const patientName = app.firstname
                ? `${app.firstname} ${app.lastname}`
                : `คนไข้ #${app.patient_id}`;
            return `<tr>
                <td>${dateStr}</td>
                <td>${app.app_time || '-'}</td>
                <td>${patientName}</td>
                <td>${app.reason || '-'}</td>
                <td><span class="badge ${st.cls}">${st.label}</span></td>
            </tr>`;
        }).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
        console.error(err);
    }
}

function logout() {
    localStorage.clear();
    location.href = '../../pages/staff-login/staff-login.html';
}