let currentVisitId = null;
let currentPatient = null;

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('staffData') || '{}');
    if (user.firstname) {
        document.getElementById('doctor_fullname').innerText =
            `${user.prefix || 'นพ./พญ.'} ${user.firstname} ${user.lastname}`;
    }
    document.getElementById('btn_search_patient').onclick = searchPatient;
    document.getElementById('saveTreatmentForm').onsubmit = saveTreatment;
});

async function searchPatient() {
    const q = document.getElementById('search_input').value.trim();
    if (!q) return Swal.fire('คำเตือน', 'กรุณากรอกข้อมูลเพื่อค้นหา', 'warning');

    try {
        Swal.fire({ title: 'กำลังค้นหา...', didOpen: () => Swal.showLoading() });
        const res = await api.visits.getListByPatient(q);
        Swal.close();

        const visits = res.data?.data || [];
        if (!visits.length) {
            return Swal.fire('ไม่พบข้อมูล', 'ไม่พบประวัติการตรวจของคนไข้รายนี้', 'error');
        }

        const p = visits[0];
        currentPatient = p;
        currentVisitId = null;
        document.getElementById('display_name').innerText = `${p.firstname} ${p.lastname}`;
        document.getElementById('display_hn').innerText = `HN-${p.patient_id}`;
        document.getElementById('display_allergy').innerText = p.allergic_medicine || '-';

        renderVisitTable(visits);
        document.getElementById('patient_info_card').style.display = 'grid';

    } catch (err) {
        Swal.close();
        Swal.fire('ไม่พบรายการ', 'ไม่พบประวัติการตรวจของคนไข้รายนี้', 'error');
    }
}

function renderVisitTable(visits) {
    const old = document.getElementById('visit_select_section');
    if (old) old.remove();

    const section = document.createElement('div');
    section.id = 'visit_select_section';
    section.className = 'card';
    section.style.marginBottom = '25px';

    const rows = visits.map(v => {
        const dateStr = new Date(v.visit_date).toLocaleString('th-TH');
        const hasRecord = v.has_record == 1;
        const statusBadge = hasRecord
            ? `<span style="color:#16a34a; background:#dcfce7; padding:3px 10px; border-radius:20px; font-size:12px;">บันทึกแล้ว</span>`
            : `<span style="color:#ea580c; background:#fff7ed; padding:3px 10px; border-radius:20px; font-size:12px;">ยังไม่บันทึก</span>`;
        const btn = hasRecord ? '' :
            `<button onclick="selectVisit(${v.visit_id}, this)"
                style="background:#2563eb; color:white; border:none; padding:6px 16px; border-radius:6px; cursor:pointer; font-family:'Kanit',sans-serif;">
                เลือก
            </button>`;
        return `
            <tr id="visit_row_${v.visit_id}">
                <td style="padding:10px 14px;">${dateStr}</td>
                <td style="padding:10px 14px;">${v.symptoms || '-'}</td>
                <td style="padding:10px 14px;">${v.weight} กก. / ${v.height} ซม.</td>
                <td style="padding:10px 14px;">${statusBadge}</td>
                <td style="padding:10px 14px; text-align:center;">${btn}</td>
            </tr>`;
    }).join('');

    section.innerHTML = `
        <div class="card-title" style="font-weight:600; color:#0d47a1; display:flex; align-items:center; gap:8px; border-bottom:2px solid #f0f0f0; padding-bottom:10px; margin-bottom:15px;">
            <i class="fas fa-list-alt"></i> ประวัติการตรวจ — เลือกรายการที่ต้องการบันทึกผล
        </div>
        <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                <thead>
                    <tr style="background:#f8fafc; color:#64748b;">
                        <th style="padding:10px 14px; text-align:left;">วันที่ตรวจ</th>
                        <th style="padding:10px 14px; text-align:left;">อาการ</th>
                        <th style="padding:10px 14px; text-align:left;">น้ำหนัก/ส่วนสูง</th>
                        <th style="padding:10px 14px; text-align:left;">สถานะ</th>
                        <th style="padding:10px 14px; text-align:center;">เลือก</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;

    const form = document.getElementById('saveTreatmentForm');
    form.parentNode.insertBefore(section, form);
}

function selectVisit(visitId, btn) {
    document.querySelectorAll('[id^="visit_row_"]').forEach(r => r.style.background = '');
    document.getElementById(`visit_row_${visitId}`).style.background = '#eff6ff';

    currentVisitId = visitId;
    Swal.fire({ icon: 'info', title: 'เลือกรายการแล้ว', text: `Visit ID: ${visitId} — กรอกผลการรักษาด้านล่างได้เลย`, timer: 1500, showConfirmButton: false });
}

async function saveTreatment(e) {
    e.preventDefault();
    if (!currentVisitId) {
        return Swal.fire('คำเตือน', 'กรุณาเลือกรายการตรวจก่อนบันทึก', 'warning');
    }

    const data = {
        visit_id: currentVisitId,
        diagnosis: document.getElementById('diagnosis').value,
        treatment_plan: document.getElementById('treatment_plan').value,
        prescriptions: document.getElementById('prescriptions').value
    };

    try {
        Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
        await api.medicalRecords.save(data);
        await Swal.fire('สำเร็จ ✅', 'บันทึกผลการรักษาเรียบร้อยแล้ว', 'success');
        location.reload();
    } catch (err) {
        Swal.close();
        Swal.fire('ล้มเหลว', 'ไม่สามารถบันทึกได้ กรุณาลองใหม่', 'error');
    }
}