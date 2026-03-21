const userData = JSON.parse(localStorage.getItem('userData'))

const loadDashboard = async () => {
    try {
        if (!userData || !userData.patient_id) {
            window.location.href = "../login/login.html"
            return;
        }

        const pId = userData.patient_id
        const profileRes = await api.patients.getById(pId)
        
        console.log("เช็คโครงสร้างที่นี่:", profileRes)

        let p = profileRes.data
        while (p && p.data) { p = p.data; }
        if (Array.isArray(p)) { p = p[0]; }

        if (p) {
            console.log("เจอข้อมูลคนไข้แล้ว!:", p)
            
            document.getElementById('profile_id').innerText = p.idCard || "-"
            document.getElementById('profile_phone').innerText = p.phone || "-"
            document.getElementById('profile_address').innerText = p.address || "-"
            document.getElementById('profile_allergy').innerText = p.allergic_medicine || "ไม่มี"
            
            const fname = p.firstname || ""
            document.getElementById('user_display_name').innerText = `สวัสดี... คุณ${fname}`
        }

        const appBox = document.getElementById('next_appointment_box')
        const appointRes = await api.appointments.getByPatientId(pId)
        
        let appList = appointRes.data
        while (appList && appList.data) { appList = appList.data; }
        if (!Array.isArray(appList)) appList = []

        const upcoming = appList.filter(a => {
            const s = (a.status || "").toLowerCase()
            return s !== 'completed' && s !== 'complete' && s !== 'cancelled' && s !== 'canceled' && s !== 'cancel'
        }).sort((a, b) => new Date(a.app_date) - new Date(b.app_date))

        if (upcoming.length > 0) {
            const statusConfig = {
                confirmed: { label: 'ยืนยันแล้ว',       bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' },
                pending:   { label: 'รอการยืนยัน',       bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
            };
            const getStatus = (raw) => {
                const key = (raw || '').toLowerCase();
                return statusConfig[key] || { label: raw || '-', bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' };
            };

            const header = `<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
                <span style="font-size:13px; color:#6b7280;">พบ <strong style="color:#1a73e8;">${upcoming.length}</strong> รายการที่รอดำเนินการ</span>
            </div>`;

            const cards = upcoming.map((item, i) => {
                const cfg = getStatus(item.status)
                const dateStr = new Date(item.app_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
                const isNext = i === 0;
                return `
                <div style="background:#fff; border:1px solid ${cfg.border}; border-left: 4px solid ${cfg.color}; border-radius:10px; padding:14px 18px; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; ${isNext ? 'box-shadow:0 2px 8px rgba(26,115,232,0.08);' : ''}">
                    <div style="display:flex; align-items:center; gap:14px;">
                        <div style="background:${cfg.bg}; border-radius:8px; width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:18px;">📅</div>
                        <div>
                            <div style="font-weight:600; font-size:14px; color:#1e293b;">
                                ${dateStr}
                                ${isNext ? '<span style="font-size:11px; background:#eff6ff; color:#1a73e8; border:1px solid #bfdbfe; border-radius:20px; padding:2px 8px; margin-left:6px;">นัดถัดไป</span>' : ''}
                            </div>
                            ${item.note ? `<div style="font-size:12px; color:#64748b; margin-top:2px;">หมายเหตุ: ${item.note}</div>` : ''}
                        </div>
                    </div>
                    <span style="background:${cfg.bg}; color:${cfg.color}; border:1px solid ${cfg.border}; border-radius:20px; padding:4px 12px; font-size:12px; font-weight:500; white-space:nowrap;">
                        ${cfg.label}
                    </span>
                </div>`
            }).join('')

            appBox.innerHTML = header + cards
        } else {
            appBox.innerHTML = '<p style="color:gray; text-align:center; width:100%; padding:20px 0;">ไม่มีนัดหมายที่รอดำเนินการ</p>';
        }
    } catch (err) { console.error("Error:", err); }
};
document.addEventListener('DOMContentLoaded', loadDashboard)

function logout() { 
    localStorage.clear()
    location.href = '../login/login.html'
}

function openEditProfile() {
    const phone = document.getElementById('profile_phone').innerText
    const address = document.getElementById('profile_address').innerText

    Swal.fire({
        title: 'แก้ไขข้อมูลส่วนตัว',
        html: `
            <div style="text-align:left; margin-bottom:8px;">
                <label style="font-size:14px;">ชื่อ</label>
                <input id="edit_firstname" class="swal2-input" placeholder="ชื่อ">
            </div>
            <div style="text-align:left; margin-bottom:8px;">
                <label style="font-size:14px;">นามสกุล</label>
                <input id="edit_lastname" class="swal2-input" placeholder="นามสกุล">
            </div>
            <div style="text-align:left; margin-bottom:8px;">
                <label style="font-size:14px;">เบอร์โทรศัพท์</label>
                <input id="edit_phone" class="swal2-input" value="${phone}" placeholder="เบอร์โทรศัพท์">
            </div>
            <div style="text-align:left;">
                <label style="font-size:14px;">ที่อยู่</label>
                <input id="edit_address" class="swal2-input" value="${address}" placeholder="ที่อยู่">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'บันทึก',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#1a73e8',
        didOpen: () => {
            api.patients.getById(userData.patient_id).then(res => {
                let p = res.data;
                while (p && p.data) { p = p.data; }
                if (Array.isArray(p)) { p = p[0]; }
                document.getElementById('edit_firstname').value = p.firstname || '';
                document.getElementById('edit_lastname').value = p.lastname || '';
            });
        },
        preConfirm: async () => {
            const firstname = document.getElementById('edit_firstname').value;
            const lastname = document.getElementById('edit_lastname').value;
            const phone = document.getElementById('edit_phone').value;
            const address = document.getElementById('edit_address').value;

            if (!firstname || !lastname || !phone || !address) {
                Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบ');
                return false;
            }

            try {
                const res = await api.patients.getById(userData.patient_id);
                let p = res.data;
                while (p && p.data) { p = p.data; }
                if (Array.isArray(p)) { p = p[0]; }

                await api.patients.update(userData.patient_id, {
                    idCard: p.idCard,
                    firstname,
                    lastname,
                    age: p.age,
                    phone,
                    address,
                    congenital_disease: p.congenital_disease,
                    allergic_medicine: p.allergic_medicine
                });
                return true;
            } catch (err) {
                Swal.showValidationMessage('บันทึกไม่สำเร็จ กรุณาลองใหม่');
                return false;
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('สำเร็จ', 'อัปเดตข้อมูลเรียบร้อยแล้ว', 'success')
                .then(() => location.reload());
        }
    });
}