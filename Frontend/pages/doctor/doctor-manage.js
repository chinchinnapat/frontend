document.addEventListener('DOMContentLoaded', loadQueue);

async function loadQueue() {
    try {
        const res = await api.appointments.getAll(); 
        
        // ขุดหา Array ข้อมูล
        let list = res.data;
        while (list && list.data) { list = list.data; }
        if (!Array.isArray(list)) list = [];

        // กรองเฉพาะที่ยืนยันแล้ว
        const confirmedQueue = list.filter(app => {
            const s = (app.status || "").toString().toLowerCase().trim();
            return s === 'confirmed';
        });

        const tbody = document.querySelector('tbody');
        if (!tbody) return;

        if (confirmedQueue.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">ไม่พบคิวที่ยืนยัน</td></tr>';
            return;
        }

        tbody.innerHTML = confirmedQueue.map((app, index) => `
            <tr>
                <td style="text-align:center;">${index + 1}</td>
                <td><strong>HN: ${app.patient_id || app.Patient_id}</strong></td>
                <td>${new Date(app.app_date || app.App_date).toLocaleDateString('th-TH')}</td>
                <td><span style="color:green; font-weight:bold;">Confirmed</span></td>
                <td style="text-align:center;">
                    <button onclick="startTreatment(${app.app_id || app.App_id}, ${app.patient_id || app.Patient_id})" 
                            style="background:#2563eb; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">
                        เรียกตรวจ
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) { console.error("Error:", error); }
}

async function startTreatment(appId, patientId) {
    const confirm = await Swal.fire({ title: 'เริ่มการตรวจ?', text: `คนไข้รหัส: ${patientId}`, icon: 'question', showCancelButton: true });
    if (!confirm.isConfirmed) return;

    try {
        const staff = JSON.parse(localStorage.getItem('staffData') || '{}');
        const res = await api.visits.create({
            app_id: appId,
            patient_id: patientId,
            doctor_id: staff.doctor_id || 1,
            symptoms: 'มาตามนัดหมาย',
            weight: 0, height: 0, blood_pressure: '-'
        });
        
        // ดึง visit_id
        const vId = res.data.insertId || res.data.id || res.data;
        localStorage.setItem('current_visit_id', vId);
        window.location.href = 'doctor-treatment.html';
    } catch (e) { Swal.fire('Error', 'ไม่สามารถสร้างรายการตรวจได้', 'error'); }
}