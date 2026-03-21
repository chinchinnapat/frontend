let selectedPatient = null;
let selectedAppId = null;
const staffData = JSON.parse(localStorage.getItem('staffData') || '{}');

document.addEventListener('DOMContentLoaded', () => {
    if (staffData.firstname) {
        document.getElementById('doctor_fullname').innerText = 
            `${staffData.prefix || 'นพ./พญ.'} ${staffData.firstname} ${staffData.lastname}`;
    }
});

async function searchPatient() {
    const q = document.getElementById('search_input').value.trim();
    if (!q) return Swal.fire('คำเตือน', 'กรุณากรอกข้อมูลเพื่อค้นหา', 'warning');

    try {
        Swal.fire({ title: 'กำลังค้นหา...', didOpen: () => Swal.showLoading() });

        const res = await api.patients.getAll();
        let list = res.data;
        while (list && list.data) { list = list.data; }
        if (!Array.isArray(list)) list = [];

        const found = list.find(p => p.idCard === q || String(p.patient_id) === q);
        Swal.close();

        if (!found) return Swal.fire('ไม่พบข้อมูล', 'ไม่พบคนไข้ในระบบ', 'error');

        selectedPatient = found;
        selectedAppId = null;

        document.getElementById('p_name').innerText = `${found.prefix || ''} ${found.firstname} ${found.lastname}`;
        document.getElementById('p_hn').innerText = `HN-${found.patient_id}`;
        document.getElementById('p_idcard').innerText = found.idCard || '-';

        const allergyWarn = document.getElementById('allergy_warn');
        if (found.allergic_medicine && found.allergic_medicine !== '-') {
            document.getElementById('p_allergy').innerText = found.allergic_medicine;
            allergyWarn.style.display = 'block';
        } else {
            allergyWarn.style.display = 'none';
        }

        await loadAppointments(found.patient_id);

        document.getElementById('step2').style.display = 'block';
        document.getElementById('step2').scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        Swal.close();
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถค้นหาได้', 'error');
    }
}

async function loadAppointments(patientId) {
    try {
        const res = await api.appointments.getByPatientId(patientId);
        let list = res.data;
        while (list && list.data) { list = list.data; }
        if (!Array.isArray(list)) list = [];

        // กรองเฉพาะ confirmed — ถ้า doctor_id มีใน staffData ให้กรองด้วย ถ้าไม่มีแสดงทุก confirmed
        const myDoctorId = staffData.doctor_id ? parseInt(staffData.doctor_id) : null;
        const confirmed = list.filter(a => {
            if (a.status !== 'confirmed') return false;
            if (myDoctorId) return parseInt(a.doctor_id) === myDoctorId;
            return true;
        });
        const apptSection = document.getElementById('appt_section');
        const apptList = document.getElementById('appt_list');

        if (confirmed.length > 0) {
            apptSection.style.display = 'block';
            apptList.innerHTML = confirmed.map(a => `
                <div class="appt-item" onclick="selectAppt(this, ${a.app_id})" data-id="${a.app_id}">
                    <div>
                        <div><strong>${new Date(a.app_date).toLocaleDateString('th-TH')}</strong> เวลา ${a.app_time}</div>
                        <div class="appt-sub">${a.reason || '-'}</div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
            `).join('');
        } else {
            apptSection.style.display = 'none';
        }
    } catch (err) {
        console.error('โหลดนัดหมายไม่ได้:', err);
    }
}

function selectAppt(el, appId) {
    document.querySelectorAll('.appt-item').forEach(i => i.classList.remove('selected'));
    el.classList.toggle('selected');
    selectedAppId = el.classList.contains('selected') ? appId : null;
}

async function submitVisit() {
    if (!selectedPatient) return;

    if (!selectedAppId) {
        return Swal.fire('กรุณาเลือกนัดหมาย', 'โปรดเลือกรายการนัดหมายที่ confirmed ก่อนบันทึกการตรวจ', 'warning');
    }

    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const blood_pressure = document.getElementById('blood_pressure').value;
    const symptoms = document.getElementById('symptoms').value;
    const doctor_id = staffData.doctor_id;

    if (!weight || !height || !blood_pressure || !symptoms) {
        return Swal.fire('กรอกข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบทุกช่อง', 'warning');
    }

    if (!doctor_id) {
        return Swal.fire('เกิดข้อผิดพลาด', 'ไม่พบข้อมูลหมอ กรุณา login ใหม่', 'error');
    }

    try {
        Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });

        await api.visits.create({
            app_id: selectedAppId || null,
            patient_id: selectedPatient.patient_id,
            doctor_id: parseInt(doctor_id),
            symptoms,
            weight: parseFloat(weight),
            height: parseFloat(height),
            blood_pressure
        });

        if (selectedAppId) {
            await api.appointments.updateStatus(selectedAppId, 'completed');
        }

        Swal.fire('สำเร็จ! ', 
            `Check-in คนไข้ ${selectedPatient.firstname} ${selectedPatient.lastname} เรียบร้อยแล้ว`, 
            'success'
        ).then(() => location.reload());

    } catch (err) {
        Swal.close();
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกได้ กรุณาลองใหม่', 'error');
    }
}